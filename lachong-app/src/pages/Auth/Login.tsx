import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/styles/Login.css";
import { authService } from "../../services/auth.service";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            console.log('🔄 Logging in with:', { email, password: '***' });

            const res = await authService.login(email, password);

            const data = res?.data ?? res;
            console.log('📦 Data:', data);

            const token = data?.access_token ?? data?.token ?? data?.data?.access_token ?? null;
            console.log('🔑 Token found:', token);

            if (token) {
                localStorage.setItem("access_token", token);
                console.log('✅ Token saved to localStorage');
                const verify = localStorage.getItem('access_token');
                console.log('✔️ Verify token saved:', verify);
            } else {
                console.warn('⚠️ NO TOKEN FOUND - Response structure is:', Object.keys(data));
            }

            const user = data?.user ?? data?.data ?? data ?? null;
            console.log('👤 User:', user);

            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
                console.log('✅ User saved');
            }

            if (data?.store) {
                localStorage.setItem("store", JSON.stringify(data.store));
                console.log('✅ Store saved');
            }

            const isStoreAccount = !!(
                user?.storeId || user?.roleId?.name === 'manager' || user?.isStore || data?.store || data?.storeId
            );

            console.log('✅ isStoreAccount:', isStoreAccount);

            if (isStoreAccount) {
                navigate('/store');
            } else {
                navigate('/');
            }
        } catch (err: any) {
            console.error("❌ Login error:", err);
            console.error("Response:", err?.response?.data);
            const msg = err?.response?.data?.message || err?.message || "Đăng nhập thất bại";
            setError(msg);
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
                <img src="/images/Logo/logo1.png" alt="Logo" className="lg-logo" />
                <h2 className="lg-title">
                    Chạm vào di sản, kết nối đam mê – Đăng nhập để mở ra thế giới thủ công mỹ nghệ tinh hoa.
                </h2>
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
                                onChange={e => setEmail(e.target.value)}
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
                                    onChange={e => setPassword(e.target.value)}
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