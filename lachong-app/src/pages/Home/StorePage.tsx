import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { storeService } from "../../services/store.service";
import { followService } from "../../services/follow.service";
import { typeStoreService } from "../../services/typeStore.service";
import "../../assets/styles/Store.css";
import ChatModal from "../../components/chat/ChatModal";
import { ToastContainer, toast } from "react-toastify";

export default function StorePage() {
    const [openChat, setOpenChat] = useState(false);
    const normalizeImageUrl = (url?: string) => {
        if (!url) return "https://via.placeholder.com/200x200?text=No+Image";
        if (/^https?:\/\//i.test(url)) return url;
        const base = (import.meta.env.VITE_API_BASE_URL as string) || "";
        return base ? base.replace(/\/$/, "") + "/" + url.replace(/^\//, "") : url;
    };

    const { id } = useParams<{ id?: string }>();
    const [store, setStore] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [followerCount, setFollowerCount] = useState<number>(0);
    const [productCount, setProductCount] = useState<number>(0);
    const [typeStoreName, setTypeStoreName] = useState<string>("");

    useEffect(() => {
        const fetchStore = async () => {
            setLoading(true);
            setError(null);
            try {
                let storeData;
                if (id) {
                    const res = await storeService.getStoreById(id);
                    storeData = res?.data?.store ?? res?.data ?? res;
                } else {
                    const res = await storeService.getStoreInfo();
                    storeData = res?.data?.store ?? res?.data ?? res;
                }
                setStore(storeData);

                if (storeData?._id) {
                    try {
                        const followRes = await followService.getFollowingStores();
                        const followingList = followRes?.data?.stores || followRes?.data || [];
                        setIsFollowing(followingList.some((id: string) => id === storeData._id));
                    } catch {
                        setIsFollowing(false);
                    }
                    try {
                        const res = await followService.getFollowingByStore(storeData._id);
                        const follows = res?.data?.follows || [];
                        setFollowerCount(Array.isArray(follows) ? follows.length : 0);
                    } catch {
                        setFollowerCount(storeData.followerCount ?? 0);
                    }
                    try {
                        const prodRes = await storeService.getProductsByStoreId(storeData._id);
                        const products = prodRes?.data?.products || prodRes?.data || [];
                        setProductCount(Array.isArray(products) ? products.length : 0);
                    } catch {
                        setProductCount(storeData.productCount ?? 0);
                    }
                }
            } catch (err: any) {
                setError(err?.response?.data?.message || "Không tải được thông tin cửa hàng");
            } finally {
                setLoading(false);
            }
        };
        fetchStore();
    }, [id]);

    useEffect(() => {
        const resolveTypeStoreName = async () => {
            if (!store) {
                setTypeStoreName("");
                return;
            }

            // Prefer explicit name field if backend already provides it
            if (store.typeStoreName && String(store.typeStoreName).trim()) {
                setTypeStoreName(String(store.typeStoreName));
                return;
            }

            // If typeStoreId is populated object
            if (store.typeStoreId && typeof store.typeStoreId === "object") {
                const populated = String(store.typeStoreId?.typeName || store.typeStoreId?.name || "");
                if (populated.trim()) {
                    setTypeStoreName(populated);
                    return;
                }
            }

            // Fallback: map id -> name
            const idRaw =
                typeof store.typeStoreId === "string"
                    ? store.typeStoreId
                    : (store.typeStoreId && typeof store.typeStoreId === "object" ? store.typeStoreId?._id : "");

            const typeId = String(idRaw || "").trim();
            if (!typeId) {
                setTypeStoreName("");
                return;
            }

            try {
                const res: any = await typeStoreService.getAllTypeStores();
                const list = res?.data?.typeStores || res?.data?.data || res?.data || [];
                const found = Array.isArray(list) ? list.find((t: any) => String(t?._id) === typeId) : undefined;
                const name = String(found?.typeName || found?.name || "");
                setTypeStoreName(name.trim() ? name : typeId);
            } catch {
                setTypeStoreName(typeId);
            }
        };

        resolveTypeStoreName();
    }, [store]);

    const getStoreId = () => store?._id || store?.storeId || store?.id;
    const handleFollowClick = async () => {
        const storeId = getStoreId();
        if (!storeId) {
            console.error("Không tìm thấy storeId để follow", store);
            return;
        }
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await followService.unfollowStore(storeId);
                setIsFollowing(false);
                setFollowerCount((prev) => (prev > 0 ? prev - 1 : 0));
                toast.success("Đã bỏ theo dõi cửa hàng");
            } else {
                await followService.followStore(storeId);
                setIsFollowing(true);
                setFollowerCount((prev) => prev + 1);
                toast.success("Đã theo dõi cửa hàng");
            }
        } catch (err: any) {
            console.error("Lỗi khi follow/unfollow:", err?.response?.data || err);
        } finally {
            setFollowLoading(false);
        }
    };

    const formatDate = (createdAt: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const date = new Date(createdAt);
        return date.toLocaleDateString(undefined, options);
    }

    if (loading) {
        return (
            <div className="store-page">
                <div className="store-status">Đang tải thông tin cửa hàng...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="store-page">
                <div className="store-status error">{error}</div>
            </div>
        );
    }

    if (!store) {
        return (
            <div className="store-page">
                <div className="store-status">Không tìm thấy cửa hàng.</div>
            </div>
        );
    }

    const social = store.socialMedia || {};

    const statsLeft = [
        { label: "Sản Phẩm", value: productCount },
        { label: "Người Theo Dõi", value: followerCount },
        { label: "Tham Gia", value: formatDate(store.createdAt) }
    ];

    return (
        <div className="store-page">
            <ChatModal
                storeId={getStoreId()}
                open={openChat}
                onClose={() => setOpenChat(false)}
            />
            <div className="store-header-row">
                <div className="store-banner">
                    <div className="store-banner-left">
                        <div className="store-banner-avatar">
                            <img
                                src={normalizeImageUrl(store.avatar || store.avatarUrl)}
                                alt={store.storeName || store.name}
                            />
                        </div>
                        <div className="store-banner-info">
                            <h1 className="store-banner-name">
                                {store.storeName || store.name}
                            </h1>
                            <p className="store-banner-sub">
                                {store.address || "Online vài phút trước"}
                            </p>
                            <div className="store-banner-actions">
                                <button
                                    className={isFollowing ? "btn-store-outline active" : "btn-store-outline"}
                                    onClick={handleFollowClick}
                                    disabled={followLoading}
                                >
                                    {isFollowing ? "Đã Theo Dõi" : "+ Theo Dõi"}
                                </button>
                                <button
                                    className="btn-store-outline"
                                    onClick={() => setOpenChat(true)}
                                >
                                    Chat
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cột thống kê bên giữa */}
                <div className="store-stats-col">
                    {statsLeft.map((s, idx) => (
                        <div className="store-stat-item" key={idx}>
                            <span className="store-stat-label">{s.label}:</span>
                            <span className="store-stat-value">{s.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="store-detail-sections">
                <div className="store-section">
                    <h3>Thông tin liên hệ</h3>
                    <ul>
                        <li>Email: {store.emailStore || store.storeEmail || store.email || "—"}</li>
                        <li>Điện thoại: {store.phone || store.phoneNumber || "—"}</li>
                        <li>Địa chỉ: {store.address || "—"}</li>
                    </ul>
                    {store.address && (
                        <div className="store-map-frame">
                            <iframe
                                title="Google Map"
                                src={`https://www.google.com/maps?q=${encodeURIComponent(store.address)}&output=embed`}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                allowFullScreen
                            />
                        </div>
                    )}
                </div>

                <div className="store-section">
                    <h3>Thông tin khác</h3>
                    <ul>
                        <li>Loại cửa hàng: {typeStoreName || "—"}</li>
                        <li style={{ whiteSpace: "pre-line" }}>
                            Mô tả:
                        </li>
                        <div className="store-section-text">
                            {store.description ? store.description : "—"}
                        </div>
                        <li style={{ whiteSpace: "pre-line" }}>
                            Chính sách:
                        </li>
                        <div className="store-section-text">
                            {store.policy ? store.policy : "—"}
                        </div>
                        <li>
                            Social:&nbsp;
                            {(social.facebook || social.instagram || social.twitter) ? (
                                <span>
                                    {social.facebook && (
                                        <a
                                            href={social.facebook}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Facebook
                                        </a>
                                    )}
                                    {social.instagram && (
                                        <>
                                            {social.facebook && " | "}
                                            <a
                                                href={social.instagram}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Instagram
                                            </a>
                                        </>
                                    )}
                                    {social.twitter && (
                                        <>
                                            {(social.facebook || social.instagram) && " | "}
                                            <a
                                                href={social.twitter}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Twitter
                                            </a>
                                        </>
                                    )}
                                </span>
                            ) : (
                                "—"
                            )}
                        </li>
                    </ul>
                </div>
            </div>
            <ToastContainer toastStyle={{ color: "white" }} autoClose={1000} />
        </div>
    );
}