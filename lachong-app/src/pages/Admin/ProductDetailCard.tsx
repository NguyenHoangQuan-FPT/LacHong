import { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { productService } from "../../services/product.service";
import "../../assets/styles/ProductDetails.css";

import Icon from "../../components/common/icons/Icon";

const normalizeImageUrl = (url?: string) => {
    if (!url) return "https://via.placeholder.com/400x300?text=No+Image";
    if (/^https?:\/\//i.test(url)) return url;
    const base = (import.meta.env.VITE_API_BASE_URL as string) || "";
    return base ? base.replace(/\/$/, "") + "/" + url.replace(/^\//, "") : url;
};

export default function ProductDetail() {
    const { id: paramId } = useParams<{ id?: string }>();
    const location = useLocation();
    const searchId = new URLSearchParams(location.search).get("id");
    const id = paramId || searchId;
    const [product, setProduct] = useState<any>(null);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(false);
    }, []);
    useEffect(() => {
        if (!id) {
            setError("ID sản phẩm không hợp lệ");
            setProduct(null);
            return;
        }

        let mounted = true;

        const fetchProduct = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log("[ProductDetail] Fetching product id:", id);

                const res = await productService.getProductById(id as string);
                console.log("[ProductDetail] API response:", res);

                // Backend trả về { message, product }
                const productData = res?.data?.product ?? null;
                console.log("[ProductDetail] extracted product:", productData);

                if (!productData) {
                    if (mounted) {
                        setProduct(null);
                        setError("Không tìm thấy sản phẩm");
                    }
                } else {
                    if (mounted) {
                        setProduct(productData);
                        setError(null);
                        const firstImage = productData.imageUrl || productData.image || (productData.images && productData.images[0]);
                        setSelectedImage(firstImage || "");
                        window.scrollTo(0, 0);
                    }
                }
            } catch (err: any) {
                console.error("[ProductDetail] fetch error:", err);
                const msg = err?.response?.data?.message || err?.response?.statusText || err?.message || "Không tải được sản phẩm";
                if (mounted) {
                    setError(msg);
                    setProduct(null);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchProduct();

        return () => {
            mounted = false;
        };
    }, [id]);

    if (loading) {
        return (
            <div className="product-detail-page">
                <div className="product-detail-status">Đang tải sản phẩm...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="product-detail-page">
                <div className="product-detail-status error">{error}</div>
                <Link to="/product" className="product-detail-back">← Quay lại danh sách sản phẩm</Link>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-page">
                <div className="product-detail-status">Không tìm thấy sản phẩm.</div>
                <Link to="/product" className="product-detail-back">← Quay lại danh sách sản phẩm</Link>
            </div>
        );
    }

    const priceAfterDiscount = (product.discountPercent && product.discountPercent > 0)
        ? Math.round((product.price || 0) * (1 - product.discountPercent / 100))
        : (product.discount && product.discount > 0)
            ? Math.round((product.price || 0) * (1 - product.discount / 100))
            : product.price;

    const productImages = product.images || [];
    const mainImage = selectedImage || product.imageUrl || product.image || (productImages.length > 0 ? productImages[0] : "");
    const discountValue = product.discountPercent || product.discount || 0;
    const storeIdForBack =
        (typeof product.storeId === "object"
            ? product.storeId._id || product.storeId.id
            : product.storeId) ||
        (typeof product.store === "object"
            ? product.store._id || product.store.id
            : "");

    return (
        <div className="product-detail-page">
            <div className="product-detail-container">
                <div className="product-detail-main">
                    <div className="product-detail-left">
                        <div className="product-detail-media">
                            {productImages.length > 0 && (
                                <div className="product-detail-thumbnails">
                                    {productImages.map((img: string, idx: number) => (
                                        <div
                                            key={idx}
                                            className={`thumbnail ${selectedImage === img ? "active" : ""}`}
                                            onClick={() => setSelectedImage(img)}
                                        >
                                            <img src={normalizeImageUrl(img)} alt={`${product.productName || product.name} ${idx + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="product-detail-image-wrap">
                                <img src={normalizeImageUrl(mainImage)} alt={product.productName || product.name} />
                            </div>
                        </div>
                    </div>

                    <div className="product-detail-info">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                            <h1 className="product-detail-title" style={{ margin: 0 }}>{product.productName || product.name}</h1>
                            <span style={{ display: "flex", alignItems: "center" }}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} style={{ color: i < Math.round(product.avgRating) ? '#ffc107' : '#e4e5e9', fontSize: 22, paddingRight: 2 }}>
                                        <Icon name="star" size={12} />
                                    </span>
                                ))}
                            </span>
                        </div>
                        <div className="product-detail-prices">
                            {discountValue > 0 ? (
                                <>
                                    <span className="price-old">{(product.price ?? 0).toLocaleString()} VND</span>
                                    <span className="price-neww">{(priceAfterDiscount ?? 0).toLocaleString()} VND</span>
                                </>
                            ) : (
                                <span className="price-neww">{(product.price ?? 0).toLocaleString()} VND</span>
                            )}
                            <div>
                                {discountValue > 0 && (
                                    <span className="product-detail-badge">{discountValue}% off</span>
                                )}
                            </div>
                        </div>

                        {product.description && (
                            <div className="product-detail-desc">
                                <h3>Mô tả sản phẩm</h3>
                                <p style={{ whiteSpace: "pre-line" }}>{product.description}</p>
                            </div>
                        )}

                        {product.category && (
                            <div className="product-detail-meta">
                                <strong>Danh mục:</strong> {product.category.name || product.category}
                            </div>
                        )}
                        {product.material && (
                            <div className="product-detail-meta">
                                <strong>Chất liệu:</strong> {product.material.name || product.material}
                            </div>
                        )}
                        {product.stock && (
                            <div className="product-detail-meta">
                                <strong>Tồn kho:</strong> {product.stock} sản phẩm
                            </div>
                        )}
                        {product.policy && (
                            <div className="product-detail-meta">
                                <strong>Chính sách bảo hành:</strong>
                                <ul>
                                    {product.policy
                                        .split("\n")
                                        .filter((line: string) => line.trim())
                                        .map((line: string, idx: number) => (
                                            <li key={idx}>{line}</li>
                                        ))}
                                </ul>
                            </div>
                        )}
                        <Link to={`/admin/store/product/${storeIdForBack}`} className="product-detail-back">← Quay lại danh sách sản phẩm</Link>
                    </div>
                </div>
                <hr className="hr"></hr>
            </div>
        </div >
    );
}