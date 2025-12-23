import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { storeService } from '../../services/store.service';
import { authService } from '../../services/auth.service'; // nếu em tạo file này
import '../../assets/styles/Sidebar.css';

type StoreInfo = {
    id?: string;
    storeName?: string;
    emailStore?: string;
    avatar?: string;
};

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [store, setStore] = useState<StoreInfo | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem('store');
        if (raw) {
            try {
                const s = JSON.parse(raw);
                setStore({
                    id: s._id,
                    storeName: s.storeName,
                    emailStore: s.emailStore,
                    avatar: s.avatar,
                });
                return;
            } catch {
                // parse lỗi thì fetch lại
            }
        }

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
                };
                setStore(mapped);
                localStorage.setItem('store', JSON.stringify(mapped));
            })
            .catch((err: any) => {
                console.error('Load store for sidebar error', err);
            });
    }, []);

    const links = [
        { to: '/store', label: 'Overview', icon: 'bi-house' },
        { to: '/store/products', label: 'Products', icon: 'bi-box-seam' },
        { to: '/store/orders', label: 'Orders', icon: 'bi-receipt' },
        { to: '/store/orders/pending', label: 'Pending', icon: 'bi-clock' },
        { to: '/store/customers', label: 'Customers', icon: 'bi-people' },
        { to: '/store/reports', label: 'Reports', icon: 'bi-bar-chart' },
        { to: '/store/profile', label: 'Profile', icon: 'bi-person-circle' },
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
                    className="lh-nav-item lh-nav-logout"
                    onClick={handleLogout}
                >
                    <i className="bi bi-box-arrow-right" />
                    <span className="lh-nav-label">Logout</span>
                </button>
            </nav>
        </aside>
    );
}