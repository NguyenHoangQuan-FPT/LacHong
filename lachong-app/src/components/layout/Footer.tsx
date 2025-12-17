import "../../assets/styles/Footer.css";

const Footer = () => {
    return (
        <footer className="footer-section">
            <div className="footer-container">
                <div className="footer-brand">
                    <span className="footer-brand-logo">
                        <img src="/images/Logo/Logo.png" alt="Nest Logo" className="footer-logo" />
                        <div className="footer-brand-title">
                            <span className="footer-brand-main">Lac Hong</span>
                            <span className="footer-brand-sub">Artisan</span>
                        </div>
                    </span>
                    <ul className="footer-contact-list">
                        <li><span className="footer-contact-icon">📍</span> Address: 5171 W Campbell Ave, Kent, Utah 53127 United States</li>
                        <li><span className="footer-contact-icon">📞</span> Call Us: (+91) - 540-025-124553</li>
                        <li><span className="footer-contact-icon">✉️</span> Email: sale@Nest.com</li>
                        <li><span className="footer-contact-icon">⏰</span> Hours: 10:00 - 18:00, Mon - Sat</li>
                    </ul>
                </div>
                <div className="footer-col">
                    <div className="footer-col-title">Company</div>
                    <ul className="footer-link-list">
                        <li><a href="#" className="footer-link">About Us</a></li>
                        <li><a href="#" className="footer-link">Delivery Information</a></li>
                        <li><a href="#" className="footer-link">Privacy Policy</a></li>
                        <li><a href="#" className="footer-link">Terms & Conditions</a></li>
                        <li><a href="#" className="footer-link">Contact Us</a></li>
                        <li><a href="#" className="footer-link">Support Center</a></li>
                        <li><a href="#" className="footer-link">Careers</a></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <div className="footer-col-title">Account</div>
                    <ul className="footer-link-list">
                        <li><a href="#" className="footer-link">Sign In</a></li>
                        <li><a href="#" className="footer-link">View Cart</a></li>
                        <li><a href="#" className="footer-link">My Wishlist</a></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <div className="footer-col-title">Corporate</div>
                    <ul className="footer-link-list">
                        <li><a href="#" className="footer-link">Become a Vendor</a></li>
                        <li><a href="#" className="footer-link">Affiliate Program</a></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <div className="footer-col-title">Popular</div>
                    <ul className="footer-link-list">
                        <li><a href="#" className="footer-link">Milk & Flavoured Milk</a></li>
                        <li><a href="#" className="footer-link">Butter and Margarine</a></li>
                    </ul>
                </div>
            </div>
            <hr className="footer-divider" />
            <div className="footer-bottom">
                <div className="footer-bottom-left">
                    © 2025, <span className="footer-link">Lac Hong</span> - HTML Ecommerce Template<br />All rights reserved
                </div>
                <div className="footer-bottom-right">
                    <span className="footer-bottom-contact"><span className="footer-contact-icon">📞</span> <span className="footer-bottom-number">1900 - 6666</span> <span className="footer-bottom-desc">Working 8:00 - 22:00</span></span>
                    <span className="footer-bottom-contact"><span className="footer-contact-icon">📞</span> <span className="footer-bottom-number">1900 - 8888</span> <span className="footer-bottom-desc">24/7 Support Center</span></span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;