import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { storeService } from "../../services/store.service";
import { followService } from "../../services/follow.service";
import "../../assets/styles/Store.css";
import { toast, ToastContainer } from "react-toastify";

const normalizeImageUrl = (url?: string) => {
    if (!url) return "https://via.placeholder.com/200x200?text=No+Image";
    if (/^https?:\/\//i.test(url)) return url;
    const base = (import.meta.env.VITE_API_BASE_URL as string) || "";
    return base ? base.replace(/\/$/, "") + "/" + url.replace(/^\//, "") : url;
};

export default function StorePage() {
    const { id } = useParams<{ id?: string }>();
    const [store, setStore] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [followerCount, setFollowerCount] = useState<number>(0);

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

                // Kiểm tra follow đúng user
                if (storeData?._id) {
                    try {
                        // Lấy danh sách store user hiện tại đang theo dõi
                        const followRes = await followService.getFollowingStores();
                        const followingList = followRes?.data?.stores || followRes?.data || [];
                        // followingList là mảng id (string)
                        setIsFollowing(followingList.some((id: string) => id === storeData._id));
                    } catch {
                        setIsFollowing(false);
                    }
                    // Lấy số follower thực tế từ API mới getFollowingByStore
                    try {
                        const res = await followService.getFollowingByStore(storeData._id);
                        const follows = res?.data?.follows || [];
                        setFollowerCount(Array.isArray(follows) ? follows.length : 0);
                    } catch {
                        setFollowerCount(storeData.followerCount ?? 0);
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

    // Xử lý follow/unfollow
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
                console.log("Unfollow storeId:", storeId);
                await followService.unfollowStore(storeId);
                setIsFollowing(false);
                toast.success("Đã bỏ theo dõi cửa hàng");
            } else {
                console.log("Follow storeId:", storeId);
                await followService.followStore(storeId);
                setIsFollowing(true);
                toast.success("Đã theo dõi cửa hàng");
            }
        } catch (err: any) {
            console.error("Lỗi khi follow/unfollow:", err?.response?.data || err);
        } finally {
            setFollowLoading(false);
        }
    };

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

    // Dữ liệu demo cho các thống kê (nếu bạn có field thật thì map vào ở đây)
    const statsLeft = [
        { label: "Sản Phẩm", value: store.productCount ?? 141 },
        { label: "Đang Theo", value: store.followingCount ?? 15 },
        {
            label: "Tỉ Lệ Phản Hồi Chat",
            value: store.chatResponseRate ?? "83%",
            extra: "(Trong Vài Giờ)"
        },
        { label: "Tỉ Lệ Hủy Đơn", value: store.cancelRate ?? "3%" }
    ];

    const statsRight = [
        { label: "Người Theo Dõi", value: followerCount },
        {
            label: "Đánh Giá",
            value: store.rating ? `${store.rating} (${store.ratingCount} Đánh Giá)` : "4.8 (182,8k Đánh Giá)"
        },
        { label: "Tham Gia", value: store.joinedTime ?? "5 Năm Trước" }
    ];

    return (
        <div className="store-page">
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
                                <button className="btn-store-secondary">Chat</button>
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
                            {s.extra && <span className="store-stat-extra"> {s.extra}</span>}
                        </div>
                    ))}
                </div>

                {/* Cột thống kê bên phải */}
                <div className="store-stats-col">
                    {statsRight.map((s, idx) => (
                        <div className="store-stat-item" key={idx}>
                            <span className="store-stat-label">{s.label}:</span>
                            <span className="store-stat-value">{s.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Thông tin chi tiết phía dưới (tuỳ chọn dùng/ẩn) */}
            <div className="store-detail-sections">
                <div className="store-section">
                    <h3>Thông tin liên hệ</h3>
                    <ul>
                        <li>Email: {store.emailStore || store.storeEmail || store.email || "—"}</li>
                        <li>Điện thoại: {store.phone || store.phoneNumber || "—"}</li>
                        <li>Địa chỉ: {store.address || "—"}</li>
                    </ul>
                </div>

                <div className="store-section">
                    <h3>Chính sách & Mạng xã hội</h3>
                    <ul>
                        <li>Chính sách: {store.policy || "—"}</li>
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
