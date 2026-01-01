import { useEffect, useRef, useState } from "react";
import "../../assets/styles/Header.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../../assets/icons/Icon";
import NotificationModal from "../notification/NotificationModal";
import notificationService from "../../services/notification.service";

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement | null>(null);
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);
    const [unread, setUnread] = useState<Notification[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                let role = "customer";
                if (parsedUser.role) {
                    role = parsedUser.role;
                } else if (parsedUser.roleId && typeof parsedUser.roleId === "object" && parsedUser.roleId.name) {
                    role = parsedUser.roleId.name;
                } else if (parsedUser.name) {
                    role = parsedUser.name;
                }
                setUser({ ...parsedUser, role });
            } catch (e) {
                console.error("Lỗi parse user:", e);
            }
        }
        setLoading(false);
    }, []);

    const fetchUnread = () => {
        setLoading(true);
        notificationService.getNotificationIsRead()
            .then((res: any) => setUnread(res?.data?.notifications || []))
            .catch(() => setError("Không thể tải thông báo mới"))
            .finally(() => setLoading(false));
    };
    useEffect(() => {
        fetchUnread();
    }, []);

    useEffect(() => {
        if (!isUserMenuOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node | null;
            if (!target) return;
            if (userMenuRef.current && !userMenuRef.current.contains(target)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isUserMenuOpen]);


    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
    };


    return (
        <header className="main-header">
            <div className="header-top">
                <div className="logo-cate">
                    <span>
                        <Link to="/" className="logo-etsy">
                            <p>LAC HONG</p>
                            <p style={{ fontSize: 14, fontWeight: 400, marginTop: 4 }}>
                                ARTISAN
                            </p>
                        </Link>
                    </span>
                </div>

                <div className="dashboard-tabs-wrapper">
                    <div className="dashboard-tabs">
                        <Link
                            to="/"
                            className={`dashboard-tab${location.pathname === "/" ? " active" : ""
                                }`}
                        >
                            Home
                        </Link>

                        <Link
                            to="/product"
                            className={`dashboard-tab${location.pathname.startsWith("/product")
                                ? " active"
                                : ""
                                }`}
                        >
                            Shop
                        </Link>

                        <Link
                            to="/community"
                            className={`dashboard-tab${location.pathname.startsWith("/community")
                                ? " active"
                                : ""
                                }`}
                        >
                            Community
                        </Link>

                        <Link
                            to="/about"
                            className={`dashboard-tab${location.pathname.startsWith("/about")
                                ? " active"
                                : ""
                                }`}
                        >
                            About
                        </Link>
                    </div>
                </div>

                <div className="header-icons" style={{ position: 'relative' }}>
                    {user?.role !== "manager" && (
                        <>
                            <span className="icon-header" title="Notifications" style={{ position: 'relative' }}>
                                <span onClick={() => setShowNotificationPopup(v => !v)} style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}>
                                    <Icon name="bell" size={20} />
                                    {unread.length > 0 && (
                                        <span className="notification-count" >{unread.length}</span>
                                    )}
                                </span>
                                {showNotificationPopup && <NotificationModal onUpdate={fetchUnread} />}
                            </span>
                            <span className="icon-header" title="Cart">
                                <Link to="/cart" className="cart-link">
                                    <Icon name="cart" size={20} />
                                </Link>
                                <Link to="/wishlist" className="wishlist-link">
                                    <Icon name="heart" size={20} />
                                </Link>
                            </span>
                        </>
                    )}
                    <span className="sign-in">
                        {user ? (
                            <div className="user-menu" ref={userMenuRef}>
                                <button
                                    type="button"
                                    className="user-options-btn"
                                    aria-haspopup="menu"
                                    aria-expanded={isUserMenuOpen}
                                    onClick={() => setIsUserMenuOpen((v) => !v)}
                                    title="Options"
                                >
                                    <Icon name="justify" size={18} />
                                </button>

                                {isUserMenuOpen && (
                                    <div className="user-dropdown" role="menu">
                                        {user?.role === "manager" ? (
                                            <Link
                                                to="/store"
                                                className="user-dropdown-item"
                                                role="menuitem"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <Icon name="home" size={16} />
                                                <span>Dashboard</span>
                                            </Link>
                                        ) : (
                                            <Link
                                                to="/customer/profile"
                                                className="user-dropdown-item"
                                                role="menuitem"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <Icon name="profile" size={16} />
                                                <span>Profile</span>
                                            </Link>
                                        )}

                                        <button
                                            type="button"
                                            className="user-dropdown-item"
                                            role="menuitem"
                                            onClick={handleLogout}
                                        >
                                            <Icon name="logout" size={16} />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="sign-in-btn">
                                <Icon name="profile" size={20} />
                                Sign in
                            </Link>
                        )}
                    </span>
                </div>
            </div >

            <hr
                style={{
                    width: "90%",
                    margin: "auto",
                    border: "1px solid #eee",
                }}
            />

        </header >
    );
}