import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../assets/styles/Homepage.css";
import Header from "../../components/layout/Header";

export type ProductItem = {
    _id?: string;
    name?: string;
    productName?: string;
    price?: number;
    discount?: number;
    discountPercent?: number;
    image?: string;
    imageUrl?: string;
    storeName?: string;
    store?: any;
    storeId?: any;
    stock?: number;
    status?: boolean;
    category?: any;
    material?: any;
    [key: string]: any;
};
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
    const [bannerIdx, setBannerIdx] = useState(0);
    const [isBannerVisible, setIsBannerVisible] = useState(false);


    useEffect(() => {
        // Trigger CSS transition after first paint
        const raf = requestAnimationFrame(() => setIsBannerVisible(true));
        return () => cancelAnimationFrame(raf);
    }, []);


    const handlePrevBanner = () => {
        setBannerIdx(idx => (idx === 0 ? BANNERS.length - 1 : idx - 1));
    };
    const handleNextBanner = () => {
        setBannerIdx(idx => (idx === BANNERS.length - 1 ? 0 : idx + 1));
    };



    return (
        <>
            <Header />
            <div className="banner">
                <button onClick={handlePrevBanner} className="custom-carousel-arrow left" type="button" aria-label="Previous">
                    &#8592;
                </button>
                <div className="banner-img">
                    <img
                        className={isBannerVisible ? "banner-photo is-visible" : "banner-photo"}
                        src={BANNERS[bannerIdx].img}
                        alt="Banner"
                    />
                    <Link to="/product" className="shop-now-btn">Shop Now</Link>
                </div>
                <button onClick={handleNextBanner} className="custom-carousel-arrow right" type="button" aria-label="Next">
                    &#8594;
                </button>
            </div>
        </>
    );
}