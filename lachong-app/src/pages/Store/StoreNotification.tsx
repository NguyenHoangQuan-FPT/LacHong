import { useEffect, useState } from "react";
import { storeService } from "../../services/store.service";
import "../../assets/styles/StoreNotification.css";
import { Link } from "react-router-dom";

interface Notification {
    _id: string;
    order?: string;
    title: string;
    message: string;
    type?: string;
    createdAt?: string;
    isRead?: boolean;
}

export default function StoreNotification() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        storeService.getStoreNotifications()
            .then((res: any) => setNotifications(res?.data?.notifications || []))
            .catch(() => setError("Không thể tải thông báo cho cửa hàng"))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="store-notification-container">
            <div className="store-notification-header">Thông báo của cửa hàng</div>
            {loading ? (
                <div>Đang tải...</div>
            ) : error ? (
                <div style={{ color: 'red' }}>{error}</div>
            ) : notifications.length === 0 ? (
                <div>Không có thông báo nào.</div>
            ) : (
                <div className="store-notification-list">
                    <Link to={`/store/order/${notifications.length > 0 ? notifications[0].order : ''}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {notifications.map(n => (
                            <div key={n._id} className={`store-notification-item${n.isRead ? ' read' : ''}`}>
                                <div className="store-notification-title">{n.title}</div>
                                <div className="store-notification-message">{n.message}</div>
                                <div className="store-notification-time">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
                            </div>
                        ))}
                    </Link>
                </div>
            )}
        </div>
    );
}
