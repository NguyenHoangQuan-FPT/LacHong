
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../assets/styles/Homepage.css";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import TopProduct from "../../components/product/TopProduct";
import categoryService from "../../services/category.service";

type Category = { _id?: string; id?: string; name?: string };

export default function Homepage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);

    const slides = [
        {
            id: "main",
            kicker: "Lạc Hồng",
            title: "Ưu đãi đến 10%",
            subtitle: "Voucher",
            image: "/images/Banner/Banner.png",
            cta: { label: "Shop Now", to: "/product" },
        },
        {
            id: "login",
            kicker: "Sản phẩm thủ công",
            title: "Khám phá",
            subtitle: "Bộ sưu tập mới",
            image: "/images/Banner/login_banner.jpg",
            cta: { label: "Shop Now", to: "/product" },
        },
    ];

    useEffect(() => {
        let mounted = true;
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const res = await categoryService.getAllCategories();
                const data = res?.data?.categories ?? res?.data ?? [];
                const list = Array.isArray(data) ? data : (data?.data ?? []);
                if (mounted) setCategories(Array.isArray(list) ? list : []);
            } catch {
                if (mounted) setCategories([]);
            } finally {
                if (mounted) setLoadingCategories(false);
            }
        };
        fetchCategories();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        const t = window.setInterval(() => {
            setActiveSlide((i) => (i + 1) % slides.length);
        }, 5000);
        return () => window.clearInterval(t);
    }, [slides.length]);


    return (
        <div className="home-page">
            <div className="home-hero">
                <aside className="home-categories" aria-label="Danh mục sản phẩm">
                    <div className="home-categories__title">Danh mục</div>

                    {loadingCategories ? (
                        <div className="home-categories__status">Đang tải...</div>
                    ) : (
                        <ul className="home-categories__list">
                            {categories.map((c, idx) => {
                                const id = String(c._id ?? c.id ?? idx);
                                const name = String(c.name ?? "Danh mục");
                                return (
                                    <li key={id} className="home-categories__item">
                                        <Link
                                            to={`/product?category=${encodeURIComponent(String(c._id ?? c.id ?? ""))}`}
                                            className="home-categories__link"
                                            title={name}
                                        >
                                            <span className="home-categories__name">{name}</span>
                                            <span className="home-categories__arrow">›</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </aside>

                <section className="home-carousel" aria-label="Banner">
                    <div className="home-carousel__slide">
                        <div className="home-carousel__text">
                            <div className="home-carousel__kicker">{slides[activeSlide].kicker}</div>
                            <div className="home-carousel__title">{slides[activeSlide].title}</div>
                            <div className="home-carousel__subtitle">{slides[activeSlide].subtitle}</div>

                            <Link to={slides[activeSlide].cta.to} className="home-carousel__cta">
                                {slides[activeSlide].cta.label}
                                <span className="home-carousel__cta-arrow"></span>
                            </Link>
                        </div>

                        <img
                            className="home-carousel__image"
                            src={slides[activeSlide].image}
                            alt="Banner"
                            loading="lazy"
                        />
                    </div>

                    <div className="home-carousel__dots" role="tablist" aria-label="Chọn banner">
                        {slides.map((s, i) => (
                            <button
                                key={s.id}
                                type="button"
                                className={`home-carousel__dot${i === activeSlide ? " is-active" : ""}`}
                                onClick={() => setActiveSlide(i)}
                                aria-label={`Banner ${i + 1}`}
                                aria-pressed={i === activeSlide}
                            />
                        ))}
                    </div>
                </section>
            </div>

            <div>
                <TopProduct></TopProduct>
            </div>
        </div>
    );
}