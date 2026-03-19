import "../../assets/styles/Footer.css";


const Footer = () => {
    return (
        <footer className="footer-section">
            <div className="footer-container">
                <div className="footer-brand">
                    <div className="footer-brand-title">
                        <span className="footer-brand-main">LAC HONG</span>
                        <span className="footer-brand-sub">ARTISAN</span>
                    </div>

                    <div className="footer-socials">
                        <a className="footer-social-link" href="#" aria-label="Facebook">
                            <i className="bi bi-facebook footer-social-icon"></i>
                        </a>
                        <a className="footer-social-link" href="#" aria-label="Instagram">
                            <i className="bi bi-instagram footer-social-icon"></i>
                        </a>
                        <a className="footer-social-link" href="#" aria-label="Twitter">
                            <i className="bi bi-twitter footer-social-icon"></i>
                        </a>
                        <a className="footer-social-link" href="#" aria-label="Email">
                            <i className="bi bi-envelope footer-social-icon"></i>
                        </a>
                    </div>
                </div>

                <div className="footer-col">
                    <div className="footer-col-title">Shop</div>
                    <ul className="footer-link-list">
                        <li><a className="footer-link" href="#">My account</a></li>
                        <li><a className="footer-link" href="#">Login</a></li>
                        <li><a className="footer-link" href="#">Wishlist</a></li>
                        <li><a className="footer-link" href="#">Cart</a></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <div className="footer-col-title">Information</div>
                    <ul className="footer-link-list">
                        <li><a className="footer-link" href="#">Shipping Policy</a></li>
                        <li><a className="footer-link" href="#">Returns &amp; Refunds</a></li>
                        <li><a className="footer-link" href="#">Cookies Policy</a></li>
                        <li><a className="footer-link" href="#">Frequently asked</a></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <div className="footer-col-title">Information</div>
                    <ul className="footer-link-list">
                        <li><a className="footer-link" href="#">Shipping Policy</a></li>
                        <li><a className="footer-link" href="#">Returns &amp; Refunds</a></li>
                        <li><a className="footer-link" href="#">Cookies Policy</a></li>
                        <li><a className="footer-link" href="#">Frequently asked</a></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <div className="footer-col-title">Company</div>
                    <ul className="footer-link-list">
                        <li><a className="footer-link" href="#">About us</a></li>
                        <li><a className="footer-link" href="/policy">Privacy Policy</a></li>
                        <li><a className="footer-link" href="/policy">Terms &amp; Conditions</a></li>
                        <li><a className="footer-link" href="#">Contact Us</a></li>
                    </ul>
                </div>
            </div>

            <hr className="footer-divider" />

            <div className="footer-bottom-row">
                <div className="footer-copyright">© LacHong 2025 - 2026. All rights reserved.</div>
            </div>
        </footer>
    );
};

export default Footer;