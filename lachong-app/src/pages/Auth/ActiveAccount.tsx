import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../assets/styles/ActiveAccount.css";
import { authService } from "../../services/auth.service";

export default function ActiveAccount() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Thiếu mã kích hoạt trong đường dẫn");
            return;
        }

        authService
            .activateAccount(token)
            .then((res) => {
                setStatus("success");
                setMessage(res.data.message || "Kích hoạt tài khoản thành công!");
            })
            .catch((err) => {
                console.error("Activate account error", err);
                setStatus("error");
                setMessage(
                    err.response?.data?.message ||
                    "Link kích hoạt không hợp lệ hoặc đã hết hạn"
                );
            });
    }, [token]);

    return (
        <div className="active-container">
            <div className="active-card">
                {status === "loading" && (
                    <>
                        <div className="spinner"></div>
                        <h2>Đang kích hoạt tài khoản...</h2>
                        <p>Vui lòng chờ trong giây lát</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="icon success">✓</div>
                        <h2>Kích hoạt thành công</h2>
                        <p>{message}</p>
                        <button onClick={() => navigate("/login")}>
                            Đăng nhập ngay
                        </button>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="icon error">✕</div>
                        <h2>Kích hoạt thất bại</h2>
                        <p>{message}</p>
                        <button onClick={() => navigate("/resend-active")}>
                            Gửi lại email kích hoạt
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
