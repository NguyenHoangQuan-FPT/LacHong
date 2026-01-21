import { useEffect, useState } from "react";
import notificationService from "../../services/notification.service";
import "../../assets/styles/Notification.css";

interface Notification {
    _id: string;
    title: string;
    message: string;
    type?: string;
    createdAt?: string;
    isRead?: boolean;
}

export default function Notification() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showAll, setShowAll] = useState(false);

    const DEFAULT_VISIBLE = 5;
    const visibleNotifications = showAll
        ? notifications
        : notifications.slice(0, DEFAULT_VISIBLE);
    const canViewAll = !showAll && notifications.length > DEFAULT_VISIBLE;

    useEffect(() => {
        setLoading(true);
        notificationService.getNotifications()
            .then((res: any) => setNotifications(res?.data?.notifications || []))
            .catch(() => setError("Không thể tải thông báo"))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="notification-page">
            <div className="notification-header">Tất cả thông báo</div>

            {loading ? (
                <div className="notification-loading">Đang tải...</div>
            ) : error ? (
                <div className="notification-error">{error}</div>
            ) : notifications.length === 0 ? (
                <div className="notification-empty">Không có thông báo nào.</div>
            ) : (
                <>
                    <ul className="notification-list">
                        {visibleNotifications.map(n => (
                            <li
                                key={n._id}
                                className={`notification-item `}
                            >
                                <div
                                    className={`notification-title ${n.type === "success" ? "success" : ""
                                        }`}
                                >
                                    {n.title}
                                </div>

                                <div className="notification-message">
                                    {n.message}
                                </div>

                                <div className="notification-time">
                                    {n.createdAt
                                        ? new Date(n.createdAt).toLocaleString()
                                        : ""}
                                </div>
                            </li>
                        ))}
                    </ul>

                    {canViewAll && (
                        <div className="notification-actions">
                            <button
                                type="button"
                                className="notification-view-all"
                                onClick={() => setShowAll(true)}
                            >
                                View all
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
