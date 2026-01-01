import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { productService } from "../../services/product.service";
import { cartService } from "../../services/cart.service";
import { wishListService } from "../../services/wishList.service";
import customerService from "../../services/customer.service";
import { ToastContainer, toast } from "react-toastify";
import "../../assets/styles/ProductDetails.css";
import ProductRelated from "../../components/product/ProductRelated";
import ProductReview from "../../components/product/ProductReview";
import Icon from "../../assets/icons/Icon";

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
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [product, setProduct] = useState<any>(null);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [addingToWishList, setAddingToWishList] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [customerProfile, setCustomerProfile] = useState<any | null>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                let role = "customer";
                if (parsedUser.role) {
                    role = parsedUser.role;
                } else if (parsedUser.roleId && typeof parsedUser.roleId === "object" && parsedUser.roleId.name) {
                    role = parsedUser.roleId.name;
                } else if (parsedUser.name) {
                    role = parsedUser.name;
                }
                setUser({ ...parsedUser, role });
            } catch (e) {
                console.error("Lỗi parse user:", e);
            }
        }
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

    const isProfileComplete = (profile: any | null) => {
        if (!profile) return false;
        const name = String(profile?.fullName || profile?.name || "").trim();
        const phone = String(profile?.phone || profile?.phoneNumber || "").trim();
        return !!name && !!phone;
    };

    const ensureCustomerProfileComplete = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            toast.info("Vui lòng đăng nhập để thêm vào giỏ hàng");
            navigate("/login");
            return false;
        }

        if (isProfileComplete(customerProfile)) return true;

        try {
            const res: any = await customerService.getProfileCustomer();
            const data = res?.data ?? res;
            const c = data?.customer ?? data?.data ?? data;
            setCustomerProfile(c);

            if (isProfileComplete(c)) return true;

            toast.error("Vui lòng cập nhật thông tin cá nhân trước khi thêm vào giỏ hàng");

            navigate("/product/detail" + (id ? `?id=${id}` : ""));
            return false;
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Không lấy được thông tin tài khoản");
            navigate("/product/detail" + (id ? `?id=${id}` : ""));
            return false;
        }
    };

    const getCategoryId = (cate: any) => {
        if (!cate) return null;
        if (typeof cate === "string") return cate;
        return cate._id || cate.id || null;
    };

    const currentCategoryId = useMemo(() => getCategoryId(product?.category), [product?.category]);

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

    const storeName =
        product.storeName ||
        product.store?.storeName ||
        product.store?.name ||
        product.storeId?.storeName ||
        product.storeId?.name ||
        "Lac Hong Store";

    const storeAvatar =
        product.storeAvatar ||
        product.store?.storeAvatar ||
        product.store?.avatar ||
        product.storeId?.storeAvatar ||
        product.storeId?.avatar ||
        "Lac Hong Store";

    const productImages = product.images || [];
    const mainImage = selectedImage || product.imageUrl || product.image || (productImages.length > 0 ? productImages[0] : "");
    const discountValue = product.discountPercent || product.discount || 0;
    const storeIdValue =
        (typeof product.storeId === "object"
            ? product.storeId._id || product.storeId.id
            : product.storeId) ||
        (typeof product.store === "object"
            ? product.store._id || product.store.id
            : undefined);

    return (
        <div className="product-detail-page">
            <div className="product-detail-container">
                <div className="product-detail-main">
                    <div className="product-detail-left">
                        <div className="product-detail-image-wrap">
                            {discountValue > 0 && (
                                <span className="product-detail-badge">{discountValue}% off</span>
                            )}
                            <img src={normalizeImageUrl(mainImage)} alt={product.productName || product.name} />
                        </div>

                        {productImages.length > 0 && (
                            <div className="product-detail-thumbnails">
                                {productImages.map((img: string, idx: number) => (
                                    <div
                                        key={idx}
                                        className={`thumbnail ${selectedImage === img ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(img)}
                                    >
                                        <img src={normalizeImageUrl(img)} alt={`${product.productName || product.name} ${idx + 1}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="product-detail-store">
                            <Link to={storeIdValue ? `/store/${storeIdValue}` : "/store"} className="store-link">
                                {storeAvatar && <img src={normalizeImageUrl(storeAvatar)} className="avatar-store" />}  {storeName}
                            </Link>
                        </div>
                    </div>

                    <div className="product-detail-info">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                            <h1 className="product-detail-title" style={{ margin: 0 }}>{product.productName || product.name}</h1>
                            <span style={{ display: "flex", alignItems: "center" }}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} style={{ color: i < Math.round(product.avgRating) ? '#ffc107' : '#e4e5e9', fontSize: 22, paddingRight: 2 }}>
                                        <Icon name="start" size={12} />
                                    </span>
                                ))}
                                <span style={{ fontSize: 18, color: '#888', marginLeft: 4 }}>{product.avgRating ? product.avgRating.toFixed(1) : 'Chưa có đánh giá'}</span>
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
                        </div>

                        {product.description && (
                            <div className="product-detail-desc">
                                <h3>Mô tả sản phẩm</h3>
                                <p>{product.description}</p>
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
                                <strong>Chính sách bảo hành:</strong> {product.policy}
                            </div>
                        )}
                        {user?.role !== "manager" && (

                            <div className="product-detail-actions">
                                <div className="quantity-control">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                                    <input type="number" min="1" value={quantity} onChange={e => setQuantity(Math.max(1, Number(e.target.value)))} />
                                    <button onClick={() => setQuantity(quantity + 1)}>+</button>
                                </div>
                                <div>
                                    <button
                                        onClick={async () => {
                                            if (!id || !product) return;
                                            if (quantity > (product.stock ?? 0)) {
                                                toast.error(`Chỉ còn ${product.stock} sản phẩm trong kho!`);
                                                return;
                                            }
                                            const ok = await ensureCustomerProfileComplete();
                                            if (!ok) return;
                                            setAddingToCart(true);
                                            try {
                                                await cartService.addToCart(id, quantity);
                                                toast.success("Đã thêm sản phẩm vào giỏ!");
                                                setQuantity(1);
                                            } catch (err: any) {
                                                toast.error(err?.response?.data?.message || "Không thể thêm vào giỏ");
                                            } finally {
                                                setAddingToCart(false);
                                            }
                                        }}
                                        disabled={addingToCart}
                                        className="product-detail-add-to-cart"
                                    >
                                        {addingToCart ? "Đang thêm..." : "Thêm vào giỏ hàng"}
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (!id || !product) return;
                                            const ok = await ensureCustomerProfileComplete();
                                            if (!ok) return;
                                            setAddingToCart(true);
                                            try {
                                                await wishListService.addToWishList(id);
                                                toast.success("Đã thêm vào danh sách yêu thích!");
                                            } catch (err: any) {
                                                toast.error(err?.response?.data?.message || "Không thể thêm vào danh sách yêu thích");
                                            } finally {
                                                setAddingToCart(false);
                                            }
                                        }}
                                        disabled={addingToWishList}
                                        className="product-detail-wish-list"
                                    >
                                        <Icon name="heart" size={15} />
                                    </button>
                                </div>
                            </div>
                        )}

                        <Link to="/product" className="product-detail-back">← Quay lại danh sách sản phẩm</Link>
                    </div>
                </div>
                <hr className="hr"></hr>
            </div>
            <ProductRelated product={product} currentCategoryId={currentCategoryId} />
            <ProductReview productId={id as string} />
            <ToastContainer toastStyle={{ color: "white" }} autoClose={1000} />
        </div >
    );
}