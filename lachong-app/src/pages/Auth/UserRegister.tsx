import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/styles/RegisterUser.css";
import { authService } from "../../services/auth.service";

export default function UserRegister() {
    const [form, setForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        showPassword: false,
        showConfirmPassword: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const toggleShowPassword = () => {
        setForm((prev) => ({ ...prev, showPassword: !prev.showPassword }));
    };

    const toggleShowConfirmPassword = () => {
        setForm((prev) => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (form.password !== form.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }
        setLoading(true);
        try {
            await authService.register(form.email, form.password);
            alert("Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.");
            navigate('/login');
        } catch (err: any) {
            console.error('Register error', err);
            const msg = err?.response?.data?.message || err?.message || 'Đăng ký thất bại';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="ur-back" >
                <Link to="/" className="ur-back-link">
                    <i className="bi bi-arrow-left" ></i>
                    Quay lại
                </Link>
            </div >

            <div className="ur-root">
                <div className="ur-card">
                    <img src="/images/Logo/logo1.png" alt="Logo" className="ur-logo" />
                    <h2 className="ur-title">
                        Khám phá vẻ đẹp truyền thống – Đăng ký để đồng hành cùng cộng đồng yêu thủ công mỹ nghệ.
                    </h2>
                    <form onSubmit={handleSubmit} autoComplete="off" className="ur-form">
                        <div className="ur-row" style={{ textAlign: "left", marginBottom: 40 }}>
                            <div className="ur-col">
                                <h3 className="ur-section">
                                    <span className="ur-section-bar" /> Thông tin tài khoản
                                </h3>

                                <label className="ur-label">Email</label>
                                <input
                                    className="ur-input"
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="off"
                                />

                                <label className="ur-label">Mật khẩu</label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        className="ur-input"
                                        type={form.showPassword ? "text" : "password"}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        autoComplete="new-password"
                                    />
                                    <span
                                        className="ur-toggle-eye"
                                        onClick={toggleShowPassword}
                                        title={form.showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    >
                                        {form.showPassword ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                    </span>
                                </div>

                                <label className="ur-label">Xác nhận mật khẩu</label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        className="ur-input"
                                        type={form.showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        autoComplete="new-password"
                                    />
                                    <span
                                        className="ur-toggle-eye"
                                        onClick={toggleShowConfirmPassword}
                                        title={form.showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    >
                                        {form.showConfirmPassword ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                    </span>
                                </div>
                            </div>

                            <div className="ur-col ur-col-illustration" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <img
                                    src="/images/Banner/Login.jpg"
                                    alt="Register mascot"
                                    className="ur-illustration"
                                    style={{ height: 330, maxWidth: "92%", borderRadius: 8, boxShadow: "0 2px 16px #0001" }}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="ur-error" style={{ marginBottom: 8 }}>{error}</div>
                        )}

                        <button className="ur-btn" type="submit" disabled={loading}>
                            {loading ? 'Đang xử lý...' : 'Đăng ký'}
                        </button>
                    </form>

                    <div className="ur-bottom">
                        Đã có tài khoản? <Link to="/login" className="ur-bottom-link">Đăng nhập ngay</Link>
                    </div>
                </div>
            </div>
        </>
    );
}