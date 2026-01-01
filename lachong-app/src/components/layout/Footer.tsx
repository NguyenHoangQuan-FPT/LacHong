import "../../assets/styles/Footer.css";


const Footer = () => {
    return (
        <footer className="footer-section" style={{ background: '#f7f7f7', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
            <div className="footer-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 0 }}>
                <div style={{ flex: 2, minWidth: 220 }}>
                    <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: 2, marginBottom: 3, color: '#222' }}>
                        LAC HONG<br />
                        <span style={{ fontWeight: 400, fontSize: 14, letterSpacing: 3 }}> ARTISAN</span>
                    </div>
                    <div></div>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
                        <a href="#"><i className="bi bi-facebook" style={{ color: "black" }}></i></a>
                        <a href="#"><i className="bi bi-instagram" style={{ color: "black" }}></i></a>
                        <a href="#"><i className="bi bi-twitter" style={{ color: "black" }}></i></a>
                        <a href="#"><i className="bi bi-envelope" style={{ color: "black" }}></i></a>
                    </div>
                </div>
                <div style={{ flex: 1, minWidth: 120, marginLeft: 32 }}>
                    <div style={{ fontWeight: 700, marginBottom: 10 }}>Shop</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#222', fontSize: 15, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <li><a href="#" style={{ color: '#222', textDecoration: 'none' }}>My account</a></li>
                        <li><a href="#" style={{ color: '#222', textDecoration: 'none' }}>Login</a></li>
                        <li><a href="#" style={{ color: '#222', textDecoration: 'none' }}>Wishlist</a></li>
                        <li><a href="#" style={{ color: '#222', textDecoration: 'none' }}>Cart</a></li>
                    </ul>
                </div>
                <div style={{ flex: 1, minWidth: 120, marginLeft: 32 }}>
                    <div style={{ fontWeight: 700, marginBottom: 10 }}>Information</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#222', fontSize: 15, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <li><a href="#" style={{ color: '#222', textDecoration: 'none' }}>Shipping Policy</a></li>
                        <li><a href="#" style={{ color: '#222', textDecoration: 'none' }}>Returns & Refunds</a></li>
                        <li><a href="#" style={{ color: '#222', textDecoration: 'none' }}>Cookies Policy</a></li>
                        <li><a href="#" style={{ color: '#222', textDecoration: 'none' }}>Frequently asked</a></li>
                    </ul>
                </div>
                <div style={{ flex: 1, minWidth: 120, marginLeft: 32 }}>
                    <div style={{ fontWeight: 700, marginBottom: 10 }}>Company</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#222', fontSize: 15, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <li><a href="#" style={{ color: '#222', textDecoration: 'none' }}>About us</a></li>
                        <li><a href="#" style={{ color: '#222', textDecoration: 'none' }}>Privacy Policy</a></li>
                        <li><a href="#" style={{ color: '#222', textDecoration: 'none' }}>Terms & Conditions</a></li>
                        <li><a href="#" style={{ color: '#222', textDecoration: 'none' }}>Contact Us</a></li>
                    </ul>
                </div>
            </div>
            <hr className="footer-divider" style={{ margin: '32px 0 0 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1300, margin: '0 auto', padding: '18px 24px', flexWrap: 'wrap', fontSize: 15, color: '#222' }}>
                <div style={{ opacity: 0.7 }}>
                    © LacHong 2025 - 2026. All rights reserved.
                </div>

            </div>
        </footer>
    );
};

export default Footer;