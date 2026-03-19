import { useEffect, useRef, useState } from "react";
import "../../assets/styles/Header.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../../components/common/icons/Icon";
import NotificationModal from "../notification/NotificationModal";
import notificationService from "../../services/notification.service";
import { useTranslation } from "react-i18next";
import { normalizeLanguage } from "../../i18n";
import { productService } from "../../services/product.service";

const normalizeImageUrl = (url?: string) => {
    if (!url) return "https://via.placeholder.com/60x60?text=No+Image";
    if (/^https?:\/\//i.test(url)) return url;
    const base = (import.meta.env.VITE_API_BASE_URL as string) || "";
    return base ? base.replace(/\/$/, "") + "/" + url.replace(/^\//, "") : url;
};

const normalizeForSearch = (value: unknown) => {
    const str = String(value ?? "")
        .toLowerCase()
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d");
    // remove diacritics
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export default function Header() {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement | null>(null);
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);
    const [unread, setUnread] = useState<Notification[]>([]);
    const [search, setSearch] = useState("");
    const [suggestOpen, setSuggestOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [suggestLoading, setSuggestLoading] = useState(false);
    const searchWrapRef = useRef<HTMLDivElement | null>(null);
    const allProductsRef = useRef<any[] | null>(null);
    const [storeStatus, setStoreStatus] = useState<string>("");
    const [language, setLanguage] = useState<'vi' | 'en'>(() => normalizeLanguage(i18n.language));
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);
    const languageMenuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleLanguageChanged = (lng: string) => {
            setLanguage(normalizeLanguage(lng));
        };
        i18n.on('languageChanged', handleLanguageChanged);
        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, [i18n]);

    useEffect(() => {
        if (!location.pathname.startsWith("/product")) return;
        const q = new URLSearchParams(location.search).get("q") ?? "";
        setSearch(q);
    }, [location.pathname, location.search]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const term = search.trim();
        setSuggestOpen(false);

        const current = new URLSearchParams(location.search);
        const category = current.get("category");

        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (term) params.set("q", term);

        const qs = params.toString();
        navigate(qs ? `/product?${qs}` : "/product");
    };

    useEffect(() => {
        if (!suggestOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node | null;
            if (!target) return;
            if (searchWrapRef.current && !searchWrapRef.current.contains(target)) {
                setSuggestOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [suggestOpen]);

    useEffect(() => {
        // close suggestions on route changes
        setSuggestOpen(false);
    }, [location.pathname, location.search]);

    useEffect(() => {
        const term = search.trim();
        if (!suggestOpen) {
            setSuggestions([]);
            return;
        }
        if (term.length < 2) {
            setSuggestions([]);
            return;
        }

        const run = async () => {
            if (!allProductsRef.current) {
                setSuggestLoading(true);
                try {
                    const res = await productService.getAllProducts();
                    const pData = res?.data?.products ?? res?.data ?? [];
                    const list = Array.isArray(pData) ? pData : (pData?.data ?? []);
                    allProductsRef.current = Array.isArray(list) ? list : [];
                } catch {
                    allProductsRef.current = [];
                } finally {
                    setSuggestLoading(false);
                }
            }

            const lower = normalizeForSearch(term);
            const list = allProductsRef.current || [];
            const filtered = list
                .filter((p: any) => {
                    const name = normalizeForSearch(p?.productName || p?.name || '');
                    return name.includes(lower);
                })
                .slice(0, 6);
            setSuggestions(filtered);
        };

        void run();
    }, [search, suggestOpen]);

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

        const savedStore = localStorage.getItem("store");
        if (savedStore) {
            try {
                const parsedStore = JSON.parse(savedStore);
                setStoreStatus(String(parsedStore?.status || ""));
            } catch {
                // ignore
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

    useEffect(() => {
        if (!isLanguageOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node | null;
            if (!target) return;
            if (languageMenuRef.current && !languageMenuRef.current.contains(target)) {
                setIsLanguageOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isLanguageOpen]);

    const setAppLanguage = (next: 'vi' | 'en') => {
        localStorage.setItem('app_lang', next);
        setLanguage(next);
        void i18n.changeLanguage(next);
        try {
            window.dispatchEvent(new CustomEvent('app:languageChanged', { detail: { language: next } }));
        } catch {
            // ignore
        }
    };


    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        localStorage.removeItem("manager");
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
                            {t('header.home')}
                        </Link>

                        <Link
                            to="/product"
                            className={`dashboard-tab${location.pathname.startsWith("/product")
                                ? " active"
                                : ""
                                }`}
                        >
                            {t('header.shop')}
                        </Link>

                        <Link
                            to="/community"
                            className={`dashboard-tab${location.pathname.startsWith("/community")
                                ? " active"
                                : ""
                                }`}
                        >
                            {t('header.community')}
                        </Link>

                        <Link
                            to="/about"
                            className={`dashboard-tab${location.pathname.startsWith("/about")
                                ? " active"
                                : ""
                                }`}
                        >
                            {t('header.about')}
                        </Link>
                    </div>
                </div>

                <div className="header-icons" style={{ position: 'relative' }}>
                    <div>
                        <div className="header-search-wrap" ref={searchWrapRef}>
                            <form className="header-search" onSubmit={handleSearchSubmit}>
                                <input
                                    type="text"
                                    placeholder={t('header.searchPlaceholder')}
                                    value={search}
                                    onFocus={() => setSuggestOpen(true)}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        if (!suggestOpen) setSuggestOpen(true);
                                    }}
                                />
                                <button type="submit"><Icon name="search" size={18} /></button>
                            </form>

                            {suggestOpen && !suggestLoading && suggestions.length > 0 && (
                                <div className="header-search-suggest" role="listbox" aria-label="Gợi ý sản phẩm">
                                    {suggestions.map((p: any) => (
                                        <Link
                                            key={p?._id || p?.id || (p?.productName || p?.name)}
                                            to={`/product/detail?id=${p?._id}`}
                                            className="header-search-suggest-item"
                                            onClick={() => setSuggestOpen(false)}
                                            role="option"
                                        >
                                            <img
                                                className="header-search-suggest-img"
                                                src={normalizeImageUrl(p?.imageUrl || p?.image)}
                                                alt={p?.productName || p?.name || 'product'}
                                                loading="lazy"
                                            />
                                            <span className="header-search-suggest-name">{p?.productName || p?.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    {user?.role !== "manager" && user?.role !== "admin" && (
                        <>
                            <span className="icon-header" title={t('header.notifications')} style={{ position: 'relative' }}>
                                <span
                                    onClick={() => setShowNotificationPopup(v => !v)}
                                    style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}
                                >
                                    <Icon name="bell" size={20} />
                                    {unread.length > 0 && (
                                        <span className="notification-count" >{unread.length}</span>
                                    )}
                                </span>
                                {showNotificationPopup && <NotificationModal onUpdate={fetchUnread} />}
                            </span>

                            <Link to="/cart" className="cart-link icon-header" title={t('header.cart')}>
                                <Icon name="cart" size={20} />
                            </Link>
                        </>
                    )}

                    <div className="lang-switch" ref={languageMenuRef}>
                        <button
                            type="button"
                            className="lang-btn"
                            onClick={() => setIsLanguageOpen((v) => !v)}
                            aria-haspopup="menu"
                            aria-expanded={isLanguageOpen}
                            aria-label={`${t('header.language')}: ${language === 'vi' ? 'Tiếng Việt' : 'English'}`}
                            title={t('header.language')}
                        >
                            <img
                                className="lang-flag-img"
                                src={language === 'vi' ? 'https://flagcdn.com/vn.svg' : 'https://flagcdn.com/us.svg'}
                                alt={language === 'vi' ? 'Tiếng Việt' : 'English'}
                            />
                        </button>

                        {isLanguageOpen && (
                            <div className="lang-menu" role="menu">
                                <button
                                    type="button"
                                    className={"lang-item" + (language === 'vi' ? ' active' : '')}
                                    aria-label="Tiếng Việt"
                                    title="Tiếng Việt"
                                    onClick={() => {
                                        setAppLanguage('vi');
                                        setIsLanguageOpen(false);
                                    }}
                                    role="menuitem"
                                >
                                    <img className="lang-flag-img" src="https://flagcdn.com/vn.svg" alt="Tiếng Việt" />
                                </button>
                                <button
                                    type="button"
                                    className={"lang-item" + (language === 'en' ? ' active' : '')}
                                    aria-label="English"
                                    title="English"
                                    onClick={() => {
                                        setAppLanguage('en');
                                        setIsLanguageOpen(false);
                                    }}
                                    role="menuitem"
                                >
                                    <img className="lang-flag-img" src="https://flagcdn.com/us.svg" alt="English" />
                                </button>
                            </div>
                        )}
                    </div>

                    <span className="sign-in">
                        {user ? (
                            <div className="user-menu" ref={userMenuRef}>
                                <button
                                    type="button"
                                    className="user-options-btn"
                                    aria-haspopup="menu"
                                    aria-expanded={isUserMenuOpen}
                                    onClick={() => setIsUserMenuOpen((v) => !v)}
                                    title={t('header.options')}
                                >
                                    <Icon name="justify" size={18} />
                                </button>

                                {isUserMenuOpen && (
                                    <div className="user-dropdown" role="menu">
                                        {user?.role === "manager" && (
                                            <Link
                                                to={String(storeStatus || "").toUpperCase() === "PENDING" ? "/store/registration" : "/store"}
                                                className="user-dropdown-item"
                                                role="menuitem"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <Icon name="home" size={16} />
                                                <span>{t('header.dashboard')}</span>
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
                                                <span>{t('header.dashboard')}</span>
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
                                                    <span>{t('header.profile')}</span>
                                                </Link>
                                                <Link
                                                    to="/chat"
                                                    className="user-dropdown-item"
                                                    role="menuitem"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <Icon name="chat" size={16} />
                                                    <span>{t('header.chat')}</span>
                                                </Link>
                                                <Link
                                                    to="/wishlist"
                                                    className="user-dropdown-item"
                                                    role="menuitem"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <Icon name="heart" size={16} />
                                                    <span>{t('header.wishlist')}</span>
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
                                            <span>{t('header.logout')}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="sign-in-btn">
                                <Icon name="profile" size={20} />
                                {t('header.signIn')}
                            </Link>
                        )}
                    </span>
                </div>
            </div >
        </header >
    );
}