import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { storeService } from "../../services/store.service";
import { productStoreService } from "../../services/product-store.service";
import "../../assets/styles/SidebarStoreView.css";

type StoreInfo = {
    id?: string;
    _id?: string;
    storeName?: string;
    emailStore?: string;
    avatar?: string;
    phone?: string;
    address?: string;
    policy?: string;
    socialMedia?: any;
};

type Product = {
    _id?: string;
    id?: string;
    productName?: string;
    name?: string;
    price?: number;
    imageUrl?: string;
    image?: string;
    discountPercent?: number;
    discount?: number;
};

const normalizeImageUrl = (url?: string) => {
    if (!url) return "https://via.placeholder.com/150x150?text=No+Image";
    if (/^https?:\/\//i.test(url)) return url;
    const base = (import.meta.env.VITE_API_BASE_URL as string) || "";
    return base ? base.replace(/\/$/, "") + "/" + url.replace(/^\//, "") : url;
};

export default function SidebarStoreView() {
    const { id: storeId } = useParams<{ id?: string }>();
    const [activeTab, setActiveTab] = useState<"info" | "products">("info");
    const [store, setStore] = useState<StoreInfo | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch store info
                const storeRes = await storeService.getStoreInfo();
                const storeData = storeRes?.data?.store ?? storeRes?.data ?? storeRes;
                setStore(storeData);

                // Fetch products
                const productsRes = await productStoreService.getStoreProducts();
                const productList = productsRes?.data?.products ?? [];
                setProducts(Array.isArray(productList) ? productList : []);
            } catch (err: any) {
                console.error("Error fetching data:", err);
                setError(err?.response?.data?.message || "Lỗi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [storeId]);

    const avatarChar =
        (store?.storeName || store?.emailStore || "S").charAt(0).toUpperCase();

    const renderTabContent = () => {
        if (activeTab === "info") {
            return (
                <div className="tab-content info-content">
                    <div className="info-section">
                        <h3>Thông tin liên hệ</h3>
                        <div className="info-item">
                            <label>Email:</label>
                            <span>{store?.emailStore || "—"}</span>
                        </div>
                        <div className="info-item">
                            <label>Điện thoại:</label>
                            <span>{store?.phone || "—"}</span>
                        </div>
                        <div className="info-item">
                            <label>Địa chỉ:</label>
                            <span>{store?.address || "—"}</span>
                        </div>
                    </div>

                    {(store?.policy || store?.socialMedia) && (
                        <div className="info-section">
                            <h3>Thêm thông tin</h3>
                            {store?.policy && (
                                <div className="info-item">
                                    <label>Chính sách:</label>
                                    <span>{store.policy}</span>
                                </div>
                            )}
                            {store?.socialMedia && (
                                <div className="info-item">
                                    <label>Mạng xã hội:</label>
                                    <span>
                                        {typeof store.socialMedia === "string"
                                            ? store.socialMedia
                                            : JSON.stringify(store.socialMedia)}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        } else {
            // Products tab
            return (
                <div className="tab-content products-content">
                    {products.length > 0 ? (
                        <div className="products-grid">
                            {products.map((product) => {
                                const productId = product._id || product.id;
                                const productName = product.productName || product.name;
                                const price = product.price || 0;
                                const image = normalizeImageUrl(
                                    product.imageUrl || product.image
                                );
                                const discount = product.discountPercent || product.discount || 0;

                                return (
                                    <div key={productId} className="product-card">
                                        <div className="product-image-wrap">
                                            {discount > 0 && (
                                                <span className="discount-badge">
                                                    -{discount}%
                                                </span>
                                            )}
                                            <img src={image} alt={productName} />
                                        </div>
                                        <div className="product-info">
                                            <p className="product-name">{productName}</p>
                                            <p className="product-price">
                                                {price.toLocaleString()} VND
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>Không có sản phẩm nào</p>
                        </div>
                    )}
                </div>
            );
        }
    };

    if (loading) {
        return (
            <div className="sidebar-store-view">
                <div className="loading-state">Đang tải...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="sidebar-store-view">
                <div className="error-state">{error}</div>
            </div>
        );
    }

    if (!store) {
        return (
            <div className="sidebar-store-view">
                <div className="error-state">Không tìm thấy cửa hàng</div>
            </div>
        );
    }

    return (
        <div className="sidebar-store-view">
            {/* Left Sidebar */}
            <aside className="sidebar-store-left">
                {/* Store Card */}
                <div className="store-card-header">
                    <div className="store-avatar">
                        {store.avatar ? (
                            <img
                                src={normalizeImageUrl(store.avatar)}
                                alt={store.storeName}
                            />
                        ) : (
                            <div className="avatar-char">{avatarChar}</div>
                        )}
                    </div>
                    <div className="store-meta">
                        <h2 className="store-name">
                            {store.storeName || "Cửa hàng"}
                        </h2>
                        <p className="store-email">{store.emailStore || "—"}</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <nav className="store-tabs">
                    <button
                        className={`tab-btn ${activeTab === "info" ? "active" : ""}`}
                        onClick={() => setActiveTab("info")}
                    >
                        <i className="bi bi-info-circle" />
                        <span>Thông tin</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "products" ? "active" : ""}`}
                        onClick={() => setActiveTab("products")}
                    >
                        <i className="bi bi-box-seam" />
                        <span>Sản phẩm ({products.length})</span>
                    </button>
                </nav>
            </aside>

            {/* Right Content */}
            <main className="sidebar-store-content">
                {renderTabContent()}
            </main>
        </div>
    );
}
