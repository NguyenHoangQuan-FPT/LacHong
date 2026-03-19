import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { productService } from "../../services/product.service";
import { reviewService } from "../../services/review.service";
import ProductCard from "../../components/product/ProductCard";
import type { ProductItem } from "../../components/product/ProductCard";
import "../../assets/styles/Product.css";

type Category = { _id?: string; id?: string; name?: string };
type Material = { _id?: string; id?: string; name?: string };

export default function Product() {
    const location = useLocation();
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [selectedMaterial, setSelectedMaterial] = useState<string>("");
    const [minStars, setMinStars] = useState<number>(0);
    const [priceSort, setPriceSort] = useState<"" | "asc" | "desc">("");

    const [ratingMap, setRatingMap] = useState<Record<string, { avg: number; count: number }>>({});

    const normalizeForSearch = (value: unknown) => {
        const str = String(value ?? "")
            .toLowerCase()
            .replace(/đ/g, "d")
            .replace(/Đ/g, "d");
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const toNumber = (value: unknown) => {
        if (value == null) return 0;
        if (typeof value === "number") return Number.isFinite(value) ? value : 0;
        const cleaned = String(value).replace(/[^0-9.-]/g, "");
        const n = Number(cleaned);
        return Number.isFinite(n) ? n : 0;
    };

    const getDiscountedPrice = (p: ProductItem) => {
        const base = toNumber(p.price);
        const discount = toNumber((p as any).discount ?? (p as any).discountPercent ?? 0);
        const percent = Math.max(0, Math.min(100, discount));
        return percent > 0 ? Math.round(base * (1 - percent / 100)) : base;
    };

    useEffect(() => {
        let mounted = true;
        const fetchAll = async () => {
            setLoading(true);
            setError(null);
            try {
                const [pRes, cRes, mRes] = await Promise.all([
                    productService.getAllProducts(),
                    productService.getAllCategory(),
                    productService.getAllMaterial(),
                ]);

                const pData = pRes?.data?.products ?? pRes?.data ?? pRes ?? [];
                const cData = cRes?.data?.categories ?? cRes?.data ?? cRes ?? [];
                const mData = mRes?.data?.materials ?? mRes?.data ?? mRes ?? [];

                const list = Array.isArray(pData) ? pData : (pData?.data ?? []);
                const cats = Array.isArray(cData) ? cData : (cData?.data ?? []);
                const mats = Array.isArray(mData) ? mData : (mData?.data ?? []);

                if (!mounted) return;

                setProducts(list);
                setCategories(cats);
                setMaterials(mats);
            } catch (err: any) {
                console.error("Load product/category/material error", err);
                setError("Không tải được dữ liệu. Vui lòng thử lại sau.");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchAll();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setSelectedCategory(params.get("category") || "");
        setSearch(params.get("q") || "");
    }, [location.search]);

    const candidateProducts = useMemo(() => {
        const term = normalizeForSearch(search.trim());
        return products.filter((p) => {
            const name = normalizeForSearch((p.productName || p.name || "").toString());
            const matchSearch = !term || name.includes(term);

            const categoryId = (p as any)?.category?._id || (p as any)?.category?.id || (p as any)?.category;
            const materialId = (p as any)?.material?._id || (p as any)?.material?.id || (p as any)?.material;
            const matchCategory = !selectedCategory || String(categoryId) === String(selectedCategory);
            const matchMaterial = !selectedMaterial || String(materialId) === String(selectedMaterial);

            return matchSearch && matchCategory && matchMaterial;
        });
    }, [products, search, selectedCategory, selectedMaterial]);

    useEffect(() => {
        if (minStars <= 0) return;

        let cancelled = false;

        const fetchRatings = async () => {
            const ids = candidateProducts
                .map((p) => String(p._id || (p as any).id || ""))
                .filter(Boolean);

            const missing = ids.filter((id) => ratingMap[id] == null);
            if (missing.length === 0) return;

            const CONCURRENCY = 6;

            for (let i = 0; i < missing.length; i += CONCURRENCY) {
                const chunk = missing.slice(i, i + CONCURRENCY);
                const results = await Promise.all(
                    chunk.map(async (id) => {
                        try {
                            const res = await reviewService.getReviewsByProductId(id);
                            const reviews = Array.isArray(res?.data?.reviews)
                                ? res.data.reviews
                                : Array.isArray(res?.data)
                                    ? res.data
                                    : [];

                            const scores = reviews
                                .map((r: any) => Number(r?.rating) || 0)
                                .filter((n: number) => Number.isFinite(n) && n > 0);

                            const count = scores.length;
                            const avg = count > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / count : 0;
                            return [id, { avg, count }] as const;
                        } catch {
                            return [id, { avg: 0, count: 0 }] as const;
                        }
                    })
                );

                if (cancelled) return;
                setRatingMap((prev) => {
                    const merged = { ...prev };
                    for (const [id, info] of results) merged[id] = info;
                    return merged;
                });
            }
        };

        fetchRatings();

        return () => {
            cancelled = true;
        };
    }, [minStars, candidateProducts]);

    const filteredProducts = useMemo(() => {
        if (minStars <= 0) return candidateProducts;
        return candidateProducts.filter((p) => {
            const id = String(p._id || (p as any).id || "");
            const avg = ratingMap[id]?.avg ?? 0;
            const shownStars = Math.round(Math.max(0, Math.min(5, avg)));
            return shownStars === minStars;
        });
    }, [candidateProducts, minStars, ratingMap]);

    const sortedProducts = useMemo(() => {
        if (!priceSort) return filteredProducts;
        const next = filteredProducts.slice();
        next.sort((a, b) => {
            const pa = getDiscountedPrice(a);
            const pb = getDiscountedPrice(b);
            const diff = priceSort === "asc" ? pa - pb : pb - pa;
            if (diff !== 0) return diff;

            const na = normalizeForSearch(a.productName || a.name || "");
            const nb = normalizeForSearch(b.productName || b.name || "");
            return na.localeCompare(nb);
        });
        return next;
    }, [filteredProducts, priceSort]);


    return (
        <div className="product-page">
            <div className="product-layout">
                <aside className="product-controls">
                    <div className="product-filters">
                        <div className="filter-item">
                            <label>Sắp xếp theo giá</label>
                            <select
                                value={priceSort}
                                onChange={(e) => setPriceSort(e.target.value as "" | "asc" | "desc")}
                            >
                                <option value="">Mặc định</option>
                                <option value="asc">Giá tăng dần</option>
                                <option value="desc">Giá giảm dần</option>
                            </select>
                        </div>

                        <div className="filter-item">
                            <label>Danh mục</label>
                            <div className="radio-group" role="radiogroup" aria-label="Danh mục">
                                <label className="radio-option">
                                    <input
                                        type="radio"
                                        name="product-category"
                                        value=""
                                        checked={selectedCategory === ""}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    />
                                    <span>Tất cả danh mục</span>
                                </label>

                                {categories.map((c, idx) => {
                                    const value = String(c._id ?? c.id ?? "");
                                    return (
                                        <label key={c._id ?? c.id ?? idx} className="radio-option">
                                            <input
                                                type="radio"
                                                name="product-category"
                                                value={value}
                                                checked={String(selectedCategory) === value}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                            />
                                            <span>{c.name}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="filter-item">
                            <label>Chất liệu</label>
                            <div className="radio-group" role="radiogroup" aria-label="Chất liệu">
                                <label className="radio-option">
                                    <input
                                        type="radio"
                                        name="product-material"
                                        value=""
                                        checked={selectedMaterial === ""}
                                        onChange={(e) => setSelectedMaterial(e.target.value)}
                                    />
                                    <span>Tất cả chất liệu</span>
                                </label>

                                {materials.map((m, idx) => {
                                    const value = String(m._id ?? m.id ?? "");
                                    return (
                                        <label key={m._id ?? m.id ?? idx} className="radio-option">
                                            <input
                                                type="radio"
                                                name="product-material"
                                                value={value}
                                                checked={String(selectedMaterial) === value}
                                                onChange={(e) => setSelectedMaterial(e.target.value)}
                                            />
                                            <span>{m.name}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="filter-item">
                            <label>Số sao</label>
                            <div className="radio-group" role="radiogroup" aria-label="Số sao">
                                <label className="radio-option">
                                    <input
                                        type="radio"
                                        name="product-rating"
                                        value="0"
                                        checked={minStars === 0}
                                        onChange={() => setMinStars(0)}
                                    />
                                    <span>Tất cả</span>
                                </label>

                                {[5, 4, 3, 2, 1].map((n) => (
                                    <label key={n} className="radio-option" aria-label={`${n} sao`}>
                                        <input
                                            type="radio"
                                            name="product-rating"
                                            value={String(n)}
                                            checked={minStars === n}
                                            onChange={() => setMinStars(n)}
                                        />
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <i
                                                    key={i}
                                                    className={`bi ${i < n ? "bi-star-fill" : "bi-star"}`}
                                                    style={{
                                                        color: i < n ? "#ffc107" : "#e4e5e9",
                                                        fontSize: 14,
                                                        lineHeight: 1,
                                                    }}
                                                    aria-hidden="true"
                                                />
                                            ))}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="product-results">
                    {loading ? (
                        <div className="product-status">Đang tải sản phẩm...</div>
                    ) : error ? (
                        <div className="product-status error">{error}</div>
                    ) : (
                        <div className="product-grid">
                            {sortedProducts.length === 0 ? (
                                <div className="product-empty">Không tìm thấy sản phẩm phù hợp.</div>
                            ) : (
                                sortedProducts.map((p: ProductItem) => {
                                    const id = String(p._id || (p as any).id || "");
                                    const rating = id ? ratingMap[id] : undefined;
                                    return (
                                        <ProductCard
                                            key={p._id || (p as any).id || p.name}
                                            product={p}
                                            rating={rating}
                                        />
                                    );
                                })
                            )}
                        </div>
                    )}
                </section>
            </div>

        </div>
    );
}