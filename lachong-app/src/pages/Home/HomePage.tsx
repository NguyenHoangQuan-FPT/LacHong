import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../assets/styles/HomePage.css";
import { productService } from "../../services/product.service";

const BANNERS = [
    {
        img: "/images/Banner/Banner.jpg",
        text: <>'Are you ready to '<span>embrace tradition?</span></>,
    },
    {
        img: "/images/Banner/Banner1.jpg",
        text: <>Discover <span>Vietnamese Craft</span></>,
    },
    {
        img: "/images/Banner/Banner2.jpg",
        text: <>Handmade <span>with Love</span></>,
    },
];

export default function Homepage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [bannerIdx, setBannerIdx] = useState(0);

    const handlePrevBanner = () => {
        setBannerIdx(idx => (idx === 0 ? BANNERS.length - 1 : idx - 1));
    };
    const handleNextBanner = () => {
        setBannerIdx(idx => (idx === BANNERS.length - 1 ? 0 : idx + 1));
    };

    useEffect(() => {
        setLoading(true);
        productService
            .getAllProducts()
            .then((res: any) => {
                const data = res?.data ?? res;
                const list = data?.products ?? data?.data ?? (Array.isArray(data) ? data : []);
                setProducts(list);
            })
            .catch((err: any) => {
                console.error("Lỗi khi tải sản phẩm:", err);
                setError("Không tải được sản phẩm");
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <div className="banner">
                <button onClick={handlePrevBanner} className="custom-carousel-arrow left" type="button" aria-label="Previous">
                    &#8592;
                </button>
                <div className="banner-img">
                    <img src={BANNERS[bannerIdx].img} alt="Banner" />
                </div>
                <div className="banner-content">
                    <div className="banner-text">
                        <h2>{BANNERS[bannerIdx].text}</h2>
                    </div>
                    <Link to="/product" className="explore-btn">Explore</Link>
                    <div className="banner-products">
                        <img src=".." alt="p1" />
                        <img src="./images/Banner/product2.jpg" alt="p2" />
                        <img src="./images/Banner/product3.jpg" alt="p3" />
                    </div>
                </div>
                <button onClick={handleNextBanner} className="custom-carousel-arrow right" type="button" aria-label="Next">
                    &#8594;
                </button>
            </div>
            <div className="homepage-container">
                <div className="section-title">
                    <div className="line" />
                    <h3>Best Selling</h3>
                    <div className="line" />
                </div>

                {loading ? (
                    <div style={{ padding: 40, textAlign: "center" }}>Đang tải sản phẩm...</div>
                ) : error ? (
                    <div style={{ padding: 40, textAlign: "center", color: "red" }}>{error}</div>
                ) : products.length === 0 ? (
                    <div className="productpage-empty">Không có sản phẩm nào.</div>
                ) : (
                    <div className="productpage-grid">
                        {products.map((p: any, idx: number) => (
                            <div className="productpage-card" key={p._id || p.id || idx}>
                                {Number(p.discountPercent) > 0 && (
                                    <div className="productpage-discount">{p.discountPercent}% off</div>
                                )}
                                {!p.status && <div className="productpage-unavailable">Unavailable</div>}
                                {p.stock === 0 && <div className="productpage-outofstock">Out of stock</div>}
                                <Link style={{ textDecoration: "none" }} to={`/product/detail?id=${p._id || p.id}`}>
                                    <img src={p.imageUrl || "/images/Product/pro1.jpg"} alt={p.productName || p.name} />
                                </Link>
                                <div className="productpage-name">{p.productName || p.name}</div>
                                <div className="productpage-spacer" />
                                <div className="productpage-bottom">
                                    <div className="productpage-prices">
                                        {Number(p.discountPercent) && Number(p.discountPercent) > 0 ? (
                                            <>
                                                <span className="productpage-price" style={{ textDecoration: "line-through", color: "#888" }}>
                                                    {Number(p.price).toLocaleString()}.000 VND
                                                </span>
                                                <span className="price" style={{ color: "#000000" }}>
                                                    {Math.round(Number(p.price) * (1 - (Number(p.discountPercent) || 0) / 100)).toLocaleString()}.000 VND
                                                </span>
                                            </>
                                        ) : (
                                            <span className="price">{Number(p.price).toLocaleString()}.000 VND</span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="productpage-ad">Ad by Lac Hong seller</span>
                                        <div className="productpage-stock">{p.stock ?? 0} in stock</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>

    );
}