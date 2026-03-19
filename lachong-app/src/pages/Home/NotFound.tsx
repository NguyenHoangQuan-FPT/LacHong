import { Link } from "react-router-dom";
import "../../assets/styles/NotFound.css";

export default function NotFound() {

    return (
        <section className="nf-page">
            <div className="nf-card" role="status" aria-live="polite">
                <div className="nf-code">404</div>
                <h1 className="nf-title">Không tìm thấy trang</h1>
                <div className="nf-actions">
                    <Link to="/" className="nf-btn nf-btn-primary">Về trang chủ</Link>
                    <Link to="/product" className="nf-btn">Xem sản phẩm</Link>
                </div>
            </div>
        </section>
    );
}
