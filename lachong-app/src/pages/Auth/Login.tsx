import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/styles/Login.css";
import { authService } from "../../services/auth.service";
import { storeService } from "../../services/store.service";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const toMessage = (err: any) => {
        const status = err?.response?.status;
        const raw = err?.response?.data?.message || err?.message || "";
        const msg = String(raw || "").trim();
        const normalized = msg.toLowerCase();

        // Common invalid-credentials patterns
        if (
            status === 401 ||
            normalized.includes("invalid") ||
            normalized.includes("unauthorized") ||
            normalized.includes("email") && normalized.includes("password") ||
            normalized.includes("sai") && (normalized.includes("mật khẩu") || normalized.includes("mat khau"))
        ) {
            return "Email hoặc mật khẩu không đúng";
        }

        return msg || "Đăng nhập thất bại";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await authService.login(email, password);
            const data = res?.data ?? res;

            const token = data?.accessToken ?? data?.access_token ?? data?.token ?? data?.data?.accessToken ?? data?.data?.access_token ?? null;
            if (token) {
                localStorage.setItem("access_token", token);
            }
            const user = data?.user ?? data?.data ?? data ?? null;
            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
            }

            if (data?.store) {
                localStorage.setItem("store", JSON.stringify(data.store));
            }

            const roleName = String(user?.roleId?.name || user?.role || "").toLowerCase();
            const isAdmin = roleName === "admin";
            if (isAdmin) {
                navigate('/admin/');
                return;
            }

            const isManager = roleName === "manager";
            if (isManager) {
                try {
                    const storeRes = await storeService.getStoreInfo();
                    const storeData = (storeRes as any)?.data ?? storeRes;
                    const store = storeData?.store ?? storeData;

                    // Debug log
                    console.log("Store info:", store);
                    console.log("Store keys:", Object.keys(store));
                    console.log("Store JSON:", JSON.stringify(store));
                    const status = String(store?.status || "").toUpperCase();
                    console.log("Store status:", status);

                    if (store) {
                        localStorage.setItem("store", JSON.stringify(store));
                    }

                    if (status === "PENDING") {
                        navigate('/store/registration');
                    } else {
                        navigate('/store');
                    }
                } catch {
                    // If store profile cannot be loaded, fall back to store dashboard.
                    navigate('/store');
                }
                return;
            }

            navigate('/');
        } catch (err: any) {
            setError(toMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lg-root">
            <div className="lg-back">
                <Link to="/" className="lg-back-link">
                    <i className="bi bi-arrow-left" /> Quay lại
                </Link>
            </div>

            <div className="lg-card">
                <div className="lg-header">
                    <img src="/images/Logo/logo1.png" alt="Logo" className="lg-logo" />
                    <h2 className="lg-title">
                        Chạm vào di sản, kết nối đam mê – Đăng nhập để mở ra thế giới thủ công mỹ nghệ tinh hoa.
                    </h2>
                </div>
                <form onSubmit={handleSubmit} autoComplete="off" className="lg-form">
                    <div className="lg-row">
                        <div className="lg-col">
                            <h3 className="lg-section">
                                <span className="lg-section-bar" /> Thông tin đăng nhập
                            </h3>

                            <label className="lg-label">Email</label>
                            <input
                                className="lg-input"
                                type="email"
                                name="email"
                                value={email}
                                onChange={e => {
                                    setEmail(e.target.value);
                                    if (error) setError(null);
                                }}
                                required
                                autoComplete="off"
                            />

                            <label className="lg-label">Mật khẩu</label>
                            <div style={{ position: "relative" }}>
                                <input
                                    className="lg-input"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={password}
                                    onChange={e => {
                                        setPassword(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    required
                                    autoComplete="current-password"
                                />
                                <span
                                    className="lg-toggle-eye"
                                    onClick={() => setShowPassword(s => !s)}
                                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                    {showPassword ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                </span>
                            </div>

                            <div className="lg-forgot">
                                <Link to="/forgot-password" className="lg-forgot-link">Quên mật khẩu?</Link>
                            </div>

                            {error && (
                                <div className="lg-error">{error}</div>
                            )}

                            <button className="lg-btn" type="submit" disabled={loading}>
                                {loading ? "Đang xử lý..." : "Đăng nhập"}
                            </button>

                            <div className="lg-bottom">
                                Chưa có tài khoản? <Link to="/user-register" className="lg-bottom-link">Đăng ký ngay</Link>
                            </div>
                            <div className="lg-bottom">
                                <Link to="/business-register" className="lg-bottom-link">Đăng ký doanh nghiệp</Link>
                            </div>
                        </div>

                        <div className="lg-col lg-col-illustration">
                            <img
                                src="/images/Banner/login_banner.jpg"
                                alt="Login illustration"
                                className="lg-illustration"
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}