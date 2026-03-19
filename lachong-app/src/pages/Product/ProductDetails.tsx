import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { productService } from "../../services/product.service";
import { cartService } from "../../services/cart.service";
import { wishListService } from "../../services/wishList.service";
import customerService from "../../services/customer.service";
import "../../assets/styles/ProductDetails.css";
import ProductRelated from "../../components/product/ProductRelated";
import ProductReview from "../../components/product/ProductReview";
import Icon from "../../components/common/icons/Icon";
import { toast } from "react-toastify";
import Toast from "../../components/common/toast/Toast";
import { useTranslation } from "react-i18next";

const normalizeImageUrl = (url?: string) => {
    if (!url) return "https://via.placeholder.com/400x300?text=No+Image";
    if (/^https?:\/\//i.test(url)) return url;
    const base = (import.meta.env.VITE_API_BASE_URL as string) || "";
    return base ? base.replace(/\/$/, "") + "/" + url.replace(/^\//, "") : url;
};

export default function ProductDetail() {
    const { t } = useTranslation();
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

    const [activeTab, setActiveTab] = useState<"related" | "reviews">("related");

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
            setError(t('productDetails.invalidId'));
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

                const productData = res?.data?.product ?? null;
                console.log("[ProductDetail] extracted product:", productData);

                if (!productData) {
                    if (mounted) {
                        setProduct(null);
                        setError(t('productDetails.notFound'));
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
                const msg = err?.response?.data?.message || err?.response?.statusText || err?.message || t('productDetails.cannotLoad');
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

    useEffect(() => {
        const tab = new URLSearchParams(location.search).get("tab");
        if (tab === "related" || tab === "reviews") {
            setActiveTab(tab);
        }
    }, [location.search]);

    const isProfileComplete = (profile: any | null) => {
        if (!profile) return false;
        const name = String(profile?.fullName || profile?.name || "").trim();
        const phone = String(profile?.phone || profile?.phoneNumber || "").trim();
        return !!name && !!phone;
    };

    const ensureCustomerProfileComplete = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            toast.info(t('productDetails.loginToAddCart'));
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

            toast.error(t('productDetails.updateProfileBeforeCart'));

            navigate("/product/detail" + (id ? `?id=${id}` : ""));
            return false;
        } catch (err: any) {
            toast.error(err?.response?.data?.message || t('productDetails.cannotFetchAccount'));
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
                <div className="product-detail-status">{t('productDetails.loadingProduct')}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="product-detail-page">
                <div className="product-detail-status error">{error}</div>
                <Link to="/product" className="product-detail-back">{t('productDetails.backToProducts')}</Link>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-page">
                <div className="product-detail-status">{t('productDetails.notFoundDot')}</div>
                <Link to="/product" className="product-detail-back">{t('productDetails.backToProducts')}</Link>
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
                                    <span className="product-detail-badge">{t('productDetails.off', { percent: discountValue })}</span>
                                )}
                            </div>
                        </div>
                        {product.description && (
                            <div className="product-detail-desc">
                                <h3>{t('productDetails.description')}</h3>
                                <p style={{ whiteSpace: "pre-line" }}>{product.description}</p>
                            </div>
                        )}

                        {product.category && (
                            <div className="product-detail-meta">
                                <strong>{t('productDetails.category')}:</strong> {product.category.name || product.category}
                            </div>
                        )}
                        {product.material && (
                            <div className="product-detail-meta">
                                <strong>{t('productDetails.material')}:</strong> {product.material.name || product.material}
                            </div>
                        )}
                        {product.stock && (
                            <div className="product-detail-meta">
                                <strong>{t('productDetails.stock')}:</strong> {product.stock} {t('productDetails.stockUnit')}
                            </div>
                        )}
                        {product.policy && (
                            <div className="product-detail-meta">
                                <strong >{t('productDetails.warrantyPolicy')}:</strong>
                                <ul>
                                    {product.policy ? (
                                        product.policy
                                            .split('\n')
                                            .filter((line: string) => line.trim())
                                            .map((line: string, idx: number) => (
                                                <li key={idx}>{line}</li>
                                            ))
                                    ) : (
                                        <li>{t('productDetails.noPolicy')}</li>
                                    )}
                                </ul>
                            </div>
                        )}
                        {user?.role !== "manager" && user?.role !== "admin" && (

                            <div className="product-detail-actions">
                                <div className="quantity-controls">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                                    <input type="number" min="1" value={quantity} onChange={e => setQuantity(Math.max(1, Number(e.target.value)))} />
                                    <button onClick={() => setQuantity(quantity + 1)}>+</button>
                                </div>
                                <div>
                                    <button
                                        onClick={async () => {
                                            if (!id || !product) return;
                                            if (quantity > (product.stock ?? 0)) {
                                                toast.error(t('productDetails.onlyLeftInStock', { count: product.stock ?? 0 }));
                                                return;
                                            }
                                            const ok = await ensureCustomerProfileComplete();
                                            if (!ok) return;
                                            setAddingToCart(true);
                                            try {
                                                await cartService.addToCart(id, quantity);
                                                toast.success(t('productDetails.addedToCart'));
                                                setQuantity(1);
                                            } catch (err: any) {
                                                toast.error(err?.response?.data?.message || t('productDetails.cannotAddToCart'));
                                            } finally {
                                                setAddingToCart(false);
                                            }
                                        }}
                                        disabled={addingToCart}
                                        className="product-detail-add-to-cart"
                                    >
                                        {addingToCart ? t('productDetails.adding') : t('productDetails.addToCart')}
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (!id || !product) return;
                                            const ok = await ensureCustomerProfileComplete();
                                            if (!ok) return;
                                            setAddingToWishList(true);
                                            try {
                                                await wishListService.addToWishList(id);
                                                toast.success(t('productDetails.addedToWishlist'));
                                            } catch (err: any) {
                                                const serverMsg = err?.response?.data?.message || "";
                                                const alreadyInWishList = serverMsg.toLowerCase().includes("already in wish list");

                                                if (alreadyInWishList) {
                                                    toast.error(t('productDetails.alreadyInWishlist'));
                                                } else {
                                                    toast.error(serverMsg || t('productDetails.cannotAddToWishlist'));
                                                }
                                            } finally {
                                                setAddingToWishList(false);
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
                    </div>
                </div>
            </div>
            <div className="product-detail-tabs" role="tablist" aria-label={t('productDetails.chooseContent')}>
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "related"}
                    className={activeTab === "related" ? "product-detail-tab active" : "product-detail-tab"}
                    onClick={() => {
                        setActiveTab("related");
                        if (id) {
                            navigate({ pathname: location.pathname, search: `?id=${id}&tab=related` }, { replace: true });
                        }
                    }}
                >
                    {t('productDetails.related')}
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "reviews"}
                    className={activeTab === "reviews" ? "product-detail-tab active" : "product-detail-tab"}
                    onClick={() => {
                        setActiveTab("reviews");
                        if (id) {
                            navigate({ pathname: location.pathname, search: `?id=${id}&tab=reviews` }, { replace: true });
                        }
                    }}
                >
                    {t('productDetails.reviews')}
                </button>

            </div>

            <div className="product-detail-tab-panel" role="tabpanel">
                {activeTab === "related" ? (
                    <ProductRelated product={product} currentCategoryId={currentCategoryId} />

                ) : (
                    <ProductReview productId={id as string} />
                )}
            </div>
            <Toast></Toast>
        </div >
    );
}