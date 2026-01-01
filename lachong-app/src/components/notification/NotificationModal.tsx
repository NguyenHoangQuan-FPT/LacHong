import { useEffect, useState } from "react";
import notificationService from "../../services/notification.service";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/NotificationModal.css";

interface Notification {
    _id: string;
    title: string;
    message: string;
    type?: string;
    createdAt?: string;
    isRead?: boolean;
}

interface NotificationModalProps {
    onUpdate?: () => void;
}

export default function NotificationModal({ onUpdate }: NotificationModalProps) {
    const [unread, setUnread] = useState<Notification[]>([]);
    const [showAll, setShowAll] = useState(false);
    const [all, setAll] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        notificationService.getNotificationIsRead()
            .then((res: any) => setUnread(res?.data?.notifications || []))
            .catch(() => setError("Dang nhap de tai thong bao moi"))
            .finally(() => setLoading(false));
    }, []);

    const handleShowAll = () => {
        navigate("/notification");
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setUnread(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            if (onUpdate) onUpdate();
        } catch {
            alert('Không thể đánh dấu đã đọc');
        }
    };

    const list = showAll ? all : unread;

    return (
        <div className="notification-modal">
            <div className="notification-title">Thông báo mới</div>

            {loading ? (
                <div className="notification-loading">Đang tải...</div>
            ) : error ? (
                <div className="notification-error">{error}</div>
            ) : (
                <>
                    <ul className="notification-list">
                        {list.length === 0 ? (
                            <li className="notification-empty">Không có thông báo</li>
                        ) : (
                            list.map(n => (
                                <li
                                    key={n._id}
                                    className={`notification-item ${n.isRead ? "read" : "unread"}`}
                                >
                                    <div
                                        className={`notification-item-title ${n.type === "success" ? "success" : ""}`}
                                    >
                                        {n.title}
                                    </div>
                                    <div>{n.message}</div>
                                    <div className="notification-item-time">
                                        {n.createdAt
                                            ? new Date(n.createdAt).toLocaleString()
                                            : ""}
                                    </div>
                                    {!n.isRead && (
                                        <button
                                            className="notification-markread-btn"
                                            onClick={() => handleMarkAsRead(n._id)}
                                            style={{ marginTop: 6, padding: '2px 10px', borderRadius: 6, border: 'none', background: '#537dd1', color: '#fff', cursor: 'pointer', fontSize: 13 }}
                                        >
                                            Đánh dấu đã đọc
                                        </button>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>

                    <button
                        className="notification-btn"
                        onClick={handleShowAll}
                    >
                        Xem tất cả thông
                    </button>
                </>
            )}
        </div>
    );
}
