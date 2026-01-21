import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { storeService } from '../../services/store.service';
import { authService } from '../../services/auth.service'; // nếu em tạo file này
import '../../assets/styles/Sidebar.css';
import Icon from "../../components/common/icons/Icon";

type StoreInfo = {
    id?: string;
    storeName?: string;
    emailStore?: string;
    avatar?: string;
    status?: string;
};

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [store, setStore] = useState<StoreInfo | null>(null);

    useEffect(() => {
        const fetchStore = () => {
            storeService
                .getStoreInfo()
                .then((res: any) => {
                    const data = res?.data ?? res;
                    const s = data?.store ?? data?.data ?? data;
                    const mapped: StoreInfo = {
                        id: s._id,
                        storeName: s.storeName,
                        emailStore: s.emailStore,
                        avatar: s.avatar,
                        status: s.status,
                    };
                    setStore(mapped);
                    localStorage.setItem('store', JSON.stringify(mapped));
                })
                .catch((err: any) => {
                    console.error('Load store for sidebar error', err);
                });
        };
        fetchStore();
        // Lắng nghe sự kiện cập nhật profile để tự động reload
        window.addEventListener('store-profile-updated', fetchStore);
        return () => {
            window.removeEventListener('store-profile-updated', fetchStore);
        };
    }, []);

    const links = [
        { to: '/store', label: 'Overview', icon: 'bi-layout-text-window-reverse' },
        { to: '/store/products', label: 'Products', icon: 'bi-box-seam' },
        { to: '/store/orders', label: 'Orders', icon: 'bi-receipt' },
        { to: '/store/notifications', label: 'Notifications', icon: 'bi-bell' },
        { to: '/store/message', label: 'Messages', icon: 'bi-chat-dots' },
        { to: '/store/profile', label: 'Profile', icon: 'bi-person-circle' },
        { to: '/', label: 'View Website', icon: 'bi-house' },

    ];

    const isActive = (path: string) => {
        if (path === '/store') {
            return location.pathname === '/store';
        }
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const avatarChar =
        (store?.storeName || store?.emailStore || 'S').charAt(0).toUpperCase();

    const avatarUrl = store?.avatar;

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
    };

    return (
        <aside className="lh-sidebar">
            <div className="lh-store-card">
                <div className="lh-store-avatar">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="store avatar" />
                    ) : (
                        avatarChar
                    )}
                </div>
                <div className="lh-store-meta">
                    <div className="lh-store-name">
                        {store?.storeName || 'Store của bạn'}
                    </div>
                    <div className="lh-store-email">
                        {store?.emailStore || '—'}
                    </div>
                    <div className="lh-store-status-badge">
                        {store?.status ? (
                            <span className={`badge badge-${(store.status || '').toLowerCase()}`}>
                                {store.status === 'ACTIVE' ? 'Active' : store.status === 'PENDING' ? 'Pending' : store.status === 'INACTIVE' ? 'Inactive' : store.status}
                            </span>
                        ) : '—'}
                    </div>
                </div>
            </div>

            <nav className="lh-nav">
                {links.map((l) => (
                    <Link
                        key={l.to}
                        to={l.to}
                        className={`lh-nav-item ${isActive(l.to) ? 'active' : ''}`}
                    >
                        <i className={`bi ${l.icon}`} />
                        <span className="lh-nav-label">{l.label}</span>
                    </Link>
                ))}

                <button
                    type="button"
                    className='lh-nav-item'
                    style={{ background: "#0f172a", color: "white", border: "none", width: "100%" }}
                    onClick={handleLogout}
                >
                    <Icon name="logout" size={18} />
                    <span className="lh-nav-label"> Logout</span>
                </button>

            </nav>
        </aside >
    );
}