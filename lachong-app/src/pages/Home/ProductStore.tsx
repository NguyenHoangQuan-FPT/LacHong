import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { storeService } from "../../services/store.service";
import { productService } from "../../services/product.service";
import ProductCard, { type ProductItem } from "../../components/product/ProductCard";
import "../../assets/styles/ProductStore.css";

type Category = { _id?: string; id?: string; name?: string };
type Material = { _id?: string; id?: string; name?: string };

export default function ProductStore() {
    const { storeId: storeIdParam } = useParams<{ storeId?: string }>();
    const { id: idParam } = useParams<{ id?: string }>();
    const storeId = storeIdParam || idParam;

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

    // Store info
    const [storeName, setStoreName] = useState<string>("");

    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch products from specific store
                if (!storeId) {
                    setError("Không tìm thấy ID cửa hàng");
                    setLoading(false);
                    return;
                }

                const [productRes, storeRes, cRes, mRes] = await Promise.all([
                    storeService.getProductsByStoreId(storeId),
                    storeService.getStoreById(storeId),
                    productService.getAllCategory(),
                    productService.getAllMaterial(),
                ]);

                // Extract products from response
                const pData = productRes?.data?.products ?? productRes?.data ?? productRes ?? [];
                const list = Array.isArray(pData) ? pData : (pData?.data ?? []);

                // Extract store info
                const storeData = storeRes?.data?.store ?? storeRes?.data ?? storeRes;
                const name = storeData?.storeName || storeData?.name || "Cửa hàng";

                // Extract categories and materials
                const cData = cRes?.data?.categories ?? cRes?.data ?? cRes ?? [];
                const mData = mRes?.data?.materials ?? mRes?.data ?? mRes ?? [];

                const cats = Array.isArray(cData) ? cData : (cData?.data ?? []);
                const mats = Array.isArray(mData) ? mData : (mData?.data ?? []);

                if (!mounted) return;

                setProducts(list);
                setStoreName(name);
                setCategories(cats);
                setMaterials(mats);

                const max = list.length > 0 ? Math.max(...list.map((x: any) => Number(x.price || 0))) : 0;
                setMaxPrice(max);
                setPriceFilter(max);
            } catch (err: any) {
                console.error("Error fetching store products:", err);
                const msg = err?.response?.data?.message || err?.message || "Lỗi tải sản phẩm";
                if (mounted) {
                    setError(msg);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            mounted = false;
        };
    }, [storeId]);

    // Filter products
    const filteredProducts = useMemo(() => {
        return products.filter((p: any) => {
            const name = (p.productName || p.name || "").toLowerCase();
            const price = Number(p.price || 0);
            const categoryId = p.category?._id || p.category?.id || p.category;
            const materialId = p.material?._id || p.material?.id || p.material;

            const matchSearch = name.includes(search.toLowerCase());
            const matchCategory = !selectedCategory || categoryId === selectedCategory;
            const matchMaterial = !selectedMaterial || materialId === selectedMaterial;
            const matchPrice = price <= priceFilter;

            return matchSearch && matchCategory && matchMaterial && matchPrice;
        });
    }, [products, search, selectedCategory, selectedMaterial, priceFilter]);

    if (loading) {
        return (
            <div className="product-store-page">
                <div className="product-store-status">Đang tải sản phẩm...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="product-store-page">
                <div className="product-store-status error">{error}</div>
            </div>
        );
    }

    return (
        <div className="product-store-page">

            <div className="product-store-container">
                {/* Left Sidebar - Filters */}
                <aside className="product-store-filters">
                    {/* Search */}
                    <div className="filter-section">
                        <label htmlFor="search" className="filter-label">Tìm kiếm</label>
                        <input
                            id="search"
                            type="text"
                            placeholder="Nhập tên sản phẩm..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="filter-search"
                        />
                    </div>

                    {/* Category Filter */}
                    {categories.length > 0 && (
                        <div className="filter-section">
                            <label htmlFor="category" className="filter-label">Danh mục</label>
                            <select
                                id="category"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">Tất cả danh mục</option>
                                {categories.map((cat) => (
                                    <option key={cat._id || cat.id} value={cat._id || cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Material Filter */}
                    {materials.length > 0 && (
                        <div className="filter-section">
                            <label htmlFor="material" className="filter-label">Chất liệu</label>
                            <select
                                id="material"
                                value={selectedMaterial}
                                onChange={(e) => setSelectedMaterial(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">Tất cả chất liệu</option>
                                {materials.map((mat) => (
                                    <option key={mat._id || mat.id} value={mat._id || mat.id}>
                                        {mat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Price Filter */}
                    {maxPrice > 0 && (
                        <div className="filter-section">
                            <label htmlFor="price" className="filter-label">Giá tối đa</label>
                            <div className="price-filter">
                                <input
                                    id="price"
                                    type="range"
                                    min="0"
                                    max={maxPrice}
                                    value={priceFilter}
                                    onChange={(e) => setPriceFilter(Number(e.target.value))}
                                    className="price-slider"
                                />
                                <div className="price-display">
                                    <span>0 VND</span>
                                    <span className="price-value">{priceFilter.toLocaleString()} VND</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reset Filters */}
                    <button
                        className="filter-reset"
                        onClick={() => {
                            setSearch("");
                            setSelectedCategory("");
                            setSelectedMaterial("");
                            setPriceFilter(maxPrice);
                        }}
                    >
                        Xóa bộ lọc
                    </button>
                </aside>

                {/* Right - Products */}
                <main className="product-store-main">
                    {filteredProducts.length > 0 ? (
                        <div className="product-store-grid">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product._id || product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="product-store-empty">
                            <p>Không tìm thấy sản phẩm phù hợp</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
