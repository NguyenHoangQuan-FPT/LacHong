import { useEffect, useMemo, useState } from "react";
import { productService } from "../../services/product.service";
import ProductCard from "../../components/product/ProductCard";
import type { ProductItem } from "../../components/product/ProductCard";
import "../../assets/styles/Product.css";
import Icon from "../../components/common/icons/Icon";

type Category = { _id?: string; id?: string; name?: string };
type Material = { _id?: string; id?: string; name?: string };

export default function Product() {
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

                const max = list.length > 0 ? Math.max(...list.map((x: any) => Number(x.price || 0))) : 0;
                setMaxPrice(max);
                setPriceFilter(max);
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

    const filteredProducts = useMemo(() => {
        const term = search.trim().toLowerCase();
        return products.filter((p) => {
            const name = (p.productName || p.name || "").toString().toLowerCase();
            const matchSearch = !term || name.includes(term);
            const categoryId = (p as any)?.category?._id || (p as any)?.category?.id || (p as any)?.category;
            const materialId = (p as any)?.material?._id || (p as any)?.material?.id || (p as any)?.material;
            const matchCategory = !selectedCategory || String(categoryId) === String(selectedCategory);
            const matchMaterial = !selectedMaterial || String(materialId) === String(selectedMaterial);
            const price = Number(p.price || 0);
            const matchPrice = priceFilter === 0 ? true : price <= priceFilter;
            return matchSearch && matchCategory && matchMaterial && matchPrice;
        });
    }, [products, search, selectedCategory, selectedMaterial, priceFilter]);

    const handleClearFilters = () => {
        setSearch("");
        setSelectedCategory("");
        setSelectedMaterial("");
        setPriceFilter(maxPrice);
    };

    const formatCurrency = (v?: number | string) => {
        if (v == null) return "";
        const n = Number(v);
        if (Number.isNaN(n)) return String(v);
        return n.toLocaleString();
    };

    return (
        <div className="product-page">
            <div className="product-controls">
                <form className="product-search" onSubmit={(e) => e.preventDefault()}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên sản phẩm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit"><Icon name="search" size={18} /></button>
                </form>

                <div className="product-filters">
                    <div className="filter-item">
                        <label>Danh mục</label>
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                            <option value="">Tất cả danh mục</option>
                            {categories.map((c) => (
                                <option key={c._id ?? c.id} value={c._id ?? c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-item">
                        <label>Chất liệu</label>
                        <select value={selectedMaterial} onChange={(e) => setSelectedMaterial(e.target.value)} >
                            <option value="">Tất cả chất liệu</option>
                            {materials.map((m) => (
                                <option key={m._id ?? m.id} value={m._id ?? m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
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
                        <div className="price-range">
                            <small>0</small>
                            <small>{formatCurrency(Math.max(maxPrice, 1000))} VND</small>
                        </div>
                    </div>

                    <div className="filter-actions">
                        <button type="button" className="btn-clear" onClick={handleClearFilters}>Xóa bộ lọc</button>
                    </div>
                </div>
            </div>

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

        </div>
    );
}