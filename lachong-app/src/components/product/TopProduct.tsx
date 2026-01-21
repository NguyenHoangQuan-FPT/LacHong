import { productService } from "../../services/product.service";
import ProductCard from "../../components/product/ProductCard";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ProductItem } from "../../components/product/ProductCard";

export default function TopProduct() {

    const [newProducts, setNewProducts] = useState<ProductItem[]>([]);
    const [discountedProducts, setDiscountedProducts] = useState<ProductItem[]>([]);
    const [bestSellingProducts, setBestSellingProducts] = useState<ProductItem[]>([]);
    const [loadingSections, setLoadingSections] = useState(false);


    useEffect(() => {
        let mounted = true;
        const fetchSections = async () => {
            setLoadingSections(true);
            try {
                const [newRes, discountRes, bestRes] = await Promise.all([
                    productService.getNewProducts(),
                    productService.getDiscountedProducts(),
                    productService.getBestSellingProducts(),
                ]);

                const newList = newRes?.data?.newProducts ?? newRes?.data?.products ?? newRes?.data;
                const discountList = discountRes?.data?.discountedProducts ?? discountRes?.data?.products ?? discountRes?.data;
                const bestList = bestRes?.data?.bestSellingProducts ?? bestRes?.data?.products ?? bestRes?.data;

                if (!mounted) return;
                setNewProducts(Array.isArray(newList) ? newList : []);
                setDiscountedProducts(Array.isArray(discountList) ? discountList : []);
                setBestSellingProducts(Array.isArray(bestList) ? bestList : []);
            } catch (err) {
                if (!mounted) return;
                setNewProducts([]);
                setDiscountedProducts([]);
                setBestSellingProducts([]);
            } finally {
                if (mounted) setLoadingSections(false);
            }
        };
        fetchSections();
        return () => {
            mounted = false;
        };
    }, []);

    const newTop4 = useMemo(() => newProducts.slice(0, 5), [newProducts]);
    const discountedTop4 = useMemo(() => discountedProducts.slice(0, 5), [discountedProducts]);
    const bestTop4 = useMemo(() => bestSellingProducts.slice(0, 5), [bestSellingProducts]);


    return (
        <div className="home-sections">
            <section className="home-section">
                <h2 className="home-section-title">NEW ARRIVALS</h2>
                {loadingSections ? (
                    <div className="home-section-status">Đang tải...</div>
                ) : (
                    <div className="home-products-grid">
                        {newTop4.map((p) => (
                            <ProductCard key={p._id || p.name} product={p} />
                        ))}
                    </div>
                )}
                <div className="home-viewall-wrap">
                    <Link to="/product" className="home-viewall-btn">View All</Link>
                </div>
            </section>

            <section className="home-section">
                <h2 className="home-section-title">TOP DISCOUNT</h2>
                {loadingSections ? (
                    <div className="home-section-status">Đang tải...</div>
                ) : (
                    <div className="home-products-grid">
                        {discountedTop4.map((p) => (
                            <ProductCard key={p._id || p.name} product={p} />
                        ))}
                    </div>
                )}
                <div className="home-viewall-wrap">
                    <Link to="/product" className="home-viewall-btn">View All</Link>
                </div>
            </section>

            <section className="home-section">
                <h2 className="home-section-title">TOP SELLING</h2>
                {loadingSections ? (
                    <div className="home-section-status">Đang tải...</div>
                ) : (
                    <div className="home-products-grid">
                        {bestTop4.map((p) => (
                            <ProductCard key={p._id || p.name} product={p} />
                        ))}
                    </div>
                )}
                <div className="home-viewall-wrap">
                    <Link to="/product" className="home-viewall-btn">View All</Link>
                </div>
            </section>
        </div>
    );
}