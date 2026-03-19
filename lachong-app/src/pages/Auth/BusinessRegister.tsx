import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/styles/RegisterBusiness.css";
import { authService } from "../../services/auth.service";

export default function BusinessRegister() {
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
        if (!form.email || !form.password || !form.confirmPassword) {
            setError("Vui lòng điền đầy đủ thông tin");
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError("Xác nhận mật khẩu không khớp");
            return;
        }
        setLoading(true);
        try {
            await authService.registerStore(form.email, form.password);

            const res = await authService.login(form.email, form.password);
            const data = (res as any)?.data ?? res;
            const token = data?.access_token ?? data?.token ?? data?.data?.access_token ?? null;
            if (token) localStorage.setItem("access_token", token);
            const user = data?.user ?? data?.data ?? data ?? null;
            if (user) localStorage.setItem("user", JSON.stringify(user));
            if (data?.store) localStorage.setItem("store", JSON.stringify(data.store));

            navigate("/store/registration");
        } catch (err: any) {
            console.error("Register store error", err);
            const msg =
                err?.response?.data?.message || err?.message || "Đăng ký thất bại";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="br-root">
            <div className="br-back">
                <Link to="/login" className="br-back-link">
                    <i className="bi bi-arrow-left" /> Quay lại
                </Link>
            </div>

            <div className="br-card">
                <div className="br-card-inner">
                    <div className="br-header">
                        <img src="/images/Logo/logo1.png" alt="Logo" className="br-logo" />
                        <h2 className="br-title">
                            Bắt đầu hành trình lan tỏa giá trị thủ công – trở thành người gìn
                            giữ giá trị truyền thống cùng chúng tôi hôm nay!
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} autoComplete="off" className="br-form">
                        <div className="br-row">
                            <div className="br-col">
                                <h3 className="br-section">
                                    <span className="br-section-bar" /> Thông tin tài khoản
                                </h3>

                                <label className="br-label">Email</label>
                                <input
                                    className="br-input"
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="off"
                                />

                                <label className="br-label">Mật khẩu</label>
                                <div className="br-input-wrap">
                                    <input
                                        className="br-input"
                                        type={form.showPassword ? "text" : "password"}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="br-eye-btn"
                                        onClick={toggleShowPassword}
                                        aria-label={form.showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    >
                                        {form.showPassword ? (
                                            <i className="bi bi-eye-slash" />
                                        ) : (
                                            <i className="bi bi-eye" />
                                        )}
                                    </button>
                                </div>

                                <label className="br-label">Xác nhận mật khẩu</label>
                                <div className="br-input-wrap">
                                    <input
                                        className="br-input"
                                        type={form.showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="br-eye-btn"
                                        onClick={toggleShowConfirmPassword}
                                        aria-label={form.showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    >
                                        {form.showConfirmPassword ? (
                                            <i className="bi bi-eye-slash" />
                                        ) : (
                                            <i className="bi bi-eye" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="br-col br-col-illustration">
                                <img
                                    src="/images/About/About3.jpg"
                                    alt="Register mascot"
                                    className="br-illustration"
                                    loading="lazy"
                                />
                            </div>
                        </div>

                        {error && <div className="br-error">{error}</div>}

                        <div className="br-actions">
                            <button className="br-btn" type="submit" disabled={loading}>
                                {loading ? "Đang xử lý..." : "Đăng ký"}
                            </button>
                        </div>

                        <div className="br-foot">
                            Đã có tài khoản?{" "}
                            <Link to="/login" className="br-foot-link">
                                Đăng nhập ngay
                            </Link>
                        </div>
                        <div className="ur-terms">
                            Bằng việc đăng ký, bạn đã đồng ý với Lạc Hồng về
                            <Link to="/policy" className="ur-terms-link"> Điều khoản dịch vụ</Link>
                            <span> &amp; </span>
                            <Link to="/policy" className="ur-terms-link">Chính sách bảo mật</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}