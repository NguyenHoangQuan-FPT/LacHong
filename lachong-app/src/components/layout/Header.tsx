import { useState, useEffect } from "react";
import "../../assets/styles/Header.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../../assets/icons/Icon";

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
                    <span className="logo">
                        <img src="/images/Logo/logo1.png" alt="Logo" />
                    </span>
                    <span>
                        <Link to="/" className="logo-etsy">
                            <p>Lac Hong</p>
                            <p
                                style={{
                                    color: "#69580dc1",
                                    fontSize: "1.2rem",
                                    fontFamily: "revert",
                                    fontWeight: "600",
                                }}
                            >
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
                            🛒<span className="cart-badge"></span>
                        </Link>
                    </span>

                    <span className="sign-in">
                        {user ? (
                            <div className="user-menu">
                                <span className="user-name">
                                    <Link to="/customer/profile" className="profile-link">
                                        <Icon name="profile" size={16} />
                                    </Link>
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="logout-btn"
                                    title="Đăng xuất"
                                >
                                    Logout
                                </button>
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