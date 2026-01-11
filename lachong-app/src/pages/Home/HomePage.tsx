
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

export default function Homepage() {
    const [bannerVisible, setBannerVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setBannerVisible(true), 100);
    }, []);



    return (
        <>
            <Header />
            <div className="banner">
                <div className="banner-img">
                    <img
                        className={`banner-image${bannerVisible ? ' visible' : ''}`}
                        src="../../images/Banner/Banner.png"
                        alt="Banner"
                    />
                    <Link to="/product" className="shop-now-btn">
                        SHOP NOW
                    </Link>
                </div>
            </div>
        </>
    );
}