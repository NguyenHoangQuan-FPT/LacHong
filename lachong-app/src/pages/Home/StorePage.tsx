import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { storeService } from "../../services/store.service";
import { followService } from "../../services/follow.service";
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
    const navigate = useNavigate();
    const [store, setStore] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [followerCount, setFollowerCount] = useState<number>(0);
    const [productCount, setProductCount] = useState<number>(0);

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
                {/* Khối banner bên trái */}
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
                        <p>Email: {store.emailStore || store.storeEmail || store.email || "—"}</p>
                        <p>Điện thoại: {store.phone || store.phoneNumber || "—"}</p>
                        <p>Địa chỉ: {store.address || "—"}</p   >
                    </ul>
                </div>

                <div className="store-section">
                    <h3>Thông tin khác</h3>
                    <ul>
                        <p>Mô tả: {store.description || "—"}</p>
                        <p>Chính sách:
                            <ul style={{ whiteSpace: "pre-line" }}>
                                {store.policy ? store.policy.split('\n').map((line: string, index: number) => (
                                    <li key={index}>{line}</li>
                                )) : "—"}
                            </ul>
                        </p>
                        <p>
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
                        </p>
                    </ul>
                </div>
            </div>
            <ToastContainer toastStyle={{ color: "white" }} autoClose={1000} />
        </div>
    );
}