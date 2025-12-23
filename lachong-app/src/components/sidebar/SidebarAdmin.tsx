import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import '../../assets/styles/AdminSidebar.css';

export default function SidebarAdmin() {
    const location = useLocation();
    const navigate = useNavigate();

    const links = [
        { to: '/admin', label: 'Overview', icon: 'bi-speedometer2' },
        { to: '/admin/stores', label: 'Stores', icon: 'bi-shop' },
        { to: '/admin/customers', label: 'Customers', icon: 'bi-people' },
        { to: '/admin/orders', label: 'Orders', icon: 'bi-receipt' },
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
                        <span>{l.label}</span>
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
