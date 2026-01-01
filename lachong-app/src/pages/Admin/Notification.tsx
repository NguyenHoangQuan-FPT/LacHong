import "../../assets/styles/AdminNotification.css";
import { useEffect, useState } from "react";
import notificationService from "../../services/notification.service";

interface Notification {
    _id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    store?: any;
}

export default function NotificationAdmin() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        notificationService.getNotifications()
            .then((res: any) => {
                setNotifications(res?.data?.notifications || res?.data || []);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleMarkAsRead = async (id: string) => {
        await notificationService.markAsRead(id);
        setNotifications(notifications => notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    };

    return (
        <div className="admin-notification-page">
            <h2 className="page-title">Thông báo hệ thống</h2>
            {loading ? (
                <div>Đang tải...</div>
            ) : notifications.length === 0 ? (
                <div>Không có thông báo</div>
            ) : (
                <table className="notifications-table">
                    <thead>
                        <tr>
                            <th style={{ width: '25%' }}>Tiêu đề</th>
                            <th>Nội dung</th>
                            <th style={{ width: '18%' }}>Thời gian</th>
                            <th style={{ width: '12%' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notifications.map(n => (
                            <tr key={n._id} className={n.isRead ? "read" : "unread"}>
                                <td style={{ fontWeight: n.isRead ? 400 : 600 }}>{n.title}</td>
                                <td>{n.message}</td>
                                <td>{new Date(n.createdAt).toLocaleString()}</td>
                                <td>
                                    {!n.isRead && (
                                        <button className="btn btn-secondary" onClick={() => handleMarkAsRead(n._id)}>
                                            Đánh dấu đã đọc
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
