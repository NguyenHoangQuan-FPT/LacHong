import { useEffect, useRef, useState } from "react";
import "../../assets/styles/Header.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../../assets/icons/Icon";
import { authService } from "../../services/auth.service";

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("Lỗi parse user:", e);
            }
        }
        setLoading(false);
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
                            <p>Lac Hong</p>
                            <p>
                                Artisan
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

                <div className="header-icons">
                    <span className="icon-header" title="Cart">
                        <Link to="/cart" className="cart-link">
                            <Icon name="cart" size={20} />
                        </Link>
                    </span>

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
                                        <Link
                                            to="/customer/profile"
                                            className="user-dropdown-item"
                                            role="menuitem"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <Icon name="profile" size={16} />
                                            <span>Profile</span>
                                        </Link>

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
                                Login
                            </Link>
                        )}
                    </span>
                </div>
            </div>

            <hr
                style={{
                    width: "90%",
                    margin: "auto",
                    border: "1px solid #eee",
                }}
            />

        </header>
    );
}