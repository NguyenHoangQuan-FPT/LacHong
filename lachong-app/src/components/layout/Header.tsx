import { useEffect, useRef, useState } from "react";
import "../../assets/styles/Header.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../../components/common/icons/Icon";
import NotificationModal from "../notification/NotificationModal";
import notificationService from "../../services/notification.service";
import ChatList from "../chat/ChatList";
export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement | null>(null);
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);
    const [unread, setUnread] = useState<Notification[]>([]);
    const [showChatList, setShowChatList] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!location.pathname.startsWith("/product")) return;
        const q = new URLSearchParams(location.search).get("q") ?? "";
        setSearch(q);
    }, [location.pathname, location.search]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const term = search.trim();

        const current = new URLSearchParams(location.search);
        const category = current.get("category");

        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (term) params.set("q", term);

        const qs = params.toString();
        navigate(qs ? `/product?${qs}` : "/product");
    };

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
    }, []);

    const fetchUnread = () => {
        notificationService.getNotificationIsRead()
            .then((res: any) => setUnread(res?.data?.notifications || []))
            .catch((e: any) => {
                console.error("Không thể tải thông báo mới", e);
            });
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
                    <div>
                        <form className="header-search" onSubmit={handleSearchSubmit}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button type="submit"><Icon name="search" size={18} /></button>
                        </form>
                    </div>
                    {user?.role !== "manager" && user?.role !== "admin" && (
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
                                <span className="wishlist-link" onClick={() => setShowChatList(true)} style={{ cursor: 'pointer' }}>
                                    <Icon name="chat" size={20} />
                                </span>

                                {showChatList && (
                                    <div className="chat-modal-overlay">
                                        <div style={{ position: 'relative', width: '90vw', maxWidth: 1200, maxHeight: '90vh', overflow: 'auto', borderRadius: 12, background: '#fff' }}>
                                            <button
                                                style={{ position: 'absolute', top: 8, right: 12, fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', zIndex: 2 }}
                                                onClick={() => setShowChatList(false)}
                                                aria-label="Đóng chat"
                                            >
                                                &times;
                                            </button>
                                            <ChatList />
                                        </div>
                                    </div>
                                )}
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
                                        {user?.role === "manager" && (
                                            <Link
                                                to="/store"
                                                className="user-dropdown-item"
                                                role="menuitem"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <Icon name="home" size={16} />
                                                <span>Dashboard</span>
                                            </Link>
                                        )}

                                        {user?.role === "admin" && (
                                            <Link
                                                to="/admin"
                                                className="user-dropdown-item"
                                                role="menuitem"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <Icon name="home" size={16} />
                                                <span>Dashboard</span>
                                            </Link>
                                        )}

                                        {user?.role !== "manager" && user?.role !== "admin" && (
                                            <>
                                                <Link
                                                    to="/customer/profile"
                                                    className="user-dropdown-item"
                                                    role="menuitem"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <Icon name="profile" size={16} />
                                                    <span>Profile</span>
                                                </Link>

                                                <Link
                                                    to="/wishlist"
                                                    className="user-dropdown-item"
                                                    role="menuitem"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <Icon name="heart" size={16} />
                                                    <span>Wishlist</span>
                                                </Link>
                                            </>
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
                    width: "100%",
                    margin: "auto",
                    border: "1px solid #eee",
                }}
            />

        </header >
    );
}