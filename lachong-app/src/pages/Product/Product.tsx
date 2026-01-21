import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { productService } from "../../services/product.service";
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
    const [maxPrice, setMaxPrice] = useState<number>(0);
    const [priceFilter, setPriceFilter] = useState<number>(0);

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

                const effectivePrices = list.map((x: any) => getDiscountedPrice(x)).filter((n: number) => Number.isFinite(n));
                const max = effectivePrices.length > 0 ? Math.max(...effectivePrices) : 0;
                const roundedMax = max > 0 ? Math.ceil(max / 10) * 10 : 0;
                setMaxPrice(roundedMax);
                setPriceFilter(roundedMax);
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

    const filteredProducts = useMemo(() => {
        const term = search.trim().toLowerCase();
        return products.filter((p) => {
            const name = (p.productName || p.name || "").toString().toLowerCase();
            const matchSearch = !term || name.includes(term);
            const categoryId = (p as any)?.category?._id || (p as any)?.category?.id || (p as any)?.category;
            const materialId = (p as any)?.material?._id || (p as any)?.material?.id || (p as any)?.material;
            const matchCategory = !selectedCategory || String(categoryId) === String(selectedCategory);
            const matchMaterial = !selectedMaterial || String(materialId) === String(selectedMaterial);
            const effectivePrice = getDiscountedPrice(p);
            const matchPrice = priceFilter === 0 ? true : effectivePrice <= priceFilter;
            return matchSearch && matchCategory && matchMaterial && matchPrice;
        });
    }, [products, search, selectedCategory, selectedMaterial, priceFilter]);


    const formatCurrency = (v?: number | string) => {
        if (v == null) return "";
        const n = Number(v);
        if (Number.isNaN(n)) return String(v);
        return n.toLocaleString();
    };

    return (
        <div className="product-page">
            <div className="product-layout">
                <aside className="product-controls">
                    <div className="product-filters">
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

                        <div className="filter-item price-filter">
                            <label>Giá tối đa: <strong>{priceFilter ? formatCurrency(priceFilter) : "0"} VND</strong></label>
                            <input
                                type="range"
                                min={0}
                                max={Math.max(maxPrice, 1000)}
                                step={10}
                                value={priceFilter}
                                onChange={(e) => setPriceFilter(Number(e.target.value))}
                            />
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
                            {filteredProducts.length === 0 ? (
                                <div className="product-empty">Không tìm thấy sản phẩm phù hợp.</div>
                            ) : (
                                filteredProducts.map((p) => <ProductCard key={p._id || p.name} product={p} />)
                            )}
                        </div>
                    )}
                </section>
            </div>

        </div>
    );
}