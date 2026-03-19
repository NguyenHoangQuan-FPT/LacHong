import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import notificationService from '../../services/notification.service';
import { authService } from '../../services/auth.service';
import '../../assets/styles/AdminSidebar.css';

export default function SidebarAdmin() {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        notificationService.getNotifications().then((res: any) => {
            const notis = res?.data?.notifications || res?.data || [];
            setUnreadCount(notis.filter((n: any) => !n.isRead).length);
        });

    }, []);
    const location = useLocation();
    const navigate = useNavigate();

    const links = [
        { to: '/admin', label: 'Overview', icon: 'bi-layout-text-window-reverse' },
        { to: '/admin/stores', label: 'Stores', icon: 'bi-shop' },
        { to: '/admin/customers', label: 'Customers', icon: 'bi-people' },
        { to: '/admin/categories', label: 'Categories', icon: 'bi-tags' },
        { to: '/admin/materials', label: 'Materials', icon: 'bi-box-seam' },
        { to: '/admin/typeStores', label: 'Type Stores', icon: 'bi-diagram-3' },
        { to: '/admin/notifications', label: 'Notifications', icon: 'bi-bell', badge: unreadCount },
        { to: '/', label: 'View Website', icon: 'bi-house' },
    ];

    const isActive = (path: string) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
    };

    return (
        <aside className="admin-sidebar">
            <div className="admin-user">
                <div className="admin-avatar">
                    <img src="/images/Avatar/avatarAdmin.png" alt="Admin Avatar" />
                </div>
                <div className="admin-meta">
                    <div className="admin-name">
                        Dashboard Admin
                    </div>
                    <div className="admin-email">

                    </div>
                </div>
            </div>
            <nav className="admin-nav">
                {links.map((l) => (
                    <Link
                        key={l.to}
                        to={l.to}
                        className={`admin-nav-item ${isActive(l.to) ? 'active' : ''}`}
                    >
                        <i className={`bi ${l.icon}`} />
                        <span>{l.label}
                            {typeof l.badge === 'number' && Number(l.badge) > 0 ? (
                                <span className="badge-noti">{l.badge}</span>
                            ) : null}
                        </span>
                    </Link>
                ))}

                <button
                    className="admin-nav-item logout"
                    onClick={handleLogout}
                >
                    <i className="bi bi-box-arrow-right" />
                    <span>Logout</span>
                </button>
            </nav>
        </aside>
    );
}
