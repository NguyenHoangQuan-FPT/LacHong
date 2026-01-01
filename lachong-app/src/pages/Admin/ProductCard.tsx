import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { reviewService } from "../../services/review.service";
import "../../assets/styles/ProductCard.css";
import { storeService } from "../../services/store.service";

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

const normalizeImageUrl = (url?: string) => {
    if (!url) return "https://via.placeholder.com/320x240?text=No+Image";
    if (/^https?:\/\//i.test(url)) return url;
    const base = (import.meta.env.VITE_API_BASE_URL as string) || "";
    return base ? base.replace(/\/$/, "") + "/" + url.replace(/^\//, "") : url;
};


export default function ProductCard({ product }: { product: ProductItem }) {
    const priceVal = Number(product.price || 0);
    const discount = Number(product.discount ?? product.discountPercent ?? 0);
    const priceAfter = discount > 0 ? Math.round(priceVal * (1 - discount / 100)) : priceVal;

    // State cho rating trung bình và số lượng review
    const [avgRating, setAvgRating] = useState<number>(0);
    const [reviewCount, setReviewCount] = useState<number>(0);

    useEffect(() => {
        let ignore = false;
        async function fetchRating() {
            if (!product._id) return;
            try {
                const res = await reviewService.getReviewsByProductId(product._id);
                const reviews = Array.isArray(res?.data?.reviews)
                    ? res.data.reviews
                    : Array.isArray(res?.data)
                        ? res.data
                        : [];
                if (!ignore && reviews.length > 0) {
                    const sum = reviews.reduce((acc: number, r: any) => acc + (Number(r.rating) || 0), 0);
                    setAvgRating(sum / reviews.length);
                    setReviewCount(reviews.length);
                } else if (!ignore) {
                    setAvgRating(0);
                    setReviewCount(0);
                }
            } catch {
                if (!ignore) {
                    setAvgRating(0);
                    setReviewCount(0);
                }
            }
        }
        fetchRating();
        return () => { ignore = true; };
    }, [product._id]);

    // Render sao
    const renderStars = (rating: number) => {
        const val = Math.max(0, Math.min(5, Number(rating) || 0));
        return Array.from({ length: 5 }).map((_, i) => (
            <span key={i} style={{ color: i < val ? '#ffc107' : '#e4e5e9', fontSize: 16 }}>
                ★
            </span>
        ));
    };

    // State cho tên cửa hàng
    const [storeName, setStoreName] = useState<string>("");

    useEffect(() => {
        const resolveStoreName = async (p: ProductItem) => {
            if (p.storeName && String(p.storeName).trim()) return setStoreName(String(p.storeName));
            const extractName = (storeObj: any): string | undefined => {
                if (!storeObj || typeof storeObj !== "object") return undefined;
                const candidates = [
                    storeObj.storeName,
                    storeObj.name,
                    storeObj.title,
                    storeObj.store_name,
                    storeObj.fullName,
                    storeObj.displayName,
                ];
                for (const c of candidates) {
                    if (c && String(c).trim()) return String(c);
                }
                return undefined;
            };
            let name = extractName(p.store);
            if (name) return setStoreName(name);
            name = extractName(p.storeId);
            if (name) return setStoreName(name);
            const storeId = typeof p.store === "string" && p.store.trim() ? p.store : (typeof p.storeId === "string" && p.storeId.trim() ? p.storeId : null);
            if (storeId) {
                try {
                    const res = await storeService.getStoreById(storeId);
                    const storeObj = res?.data?.store || res?.data;
                    const apiName = extractName(storeObj) || storeObj?.storeName || storeObj?.name;
                    if (apiName && String(apiName).trim()) return setStoreName(String(apiName));
                } catch {
                    return setStoreName(`Cửa hàng #${storeId}`);
                }
            }
            setStoreName("Lac Hong Store");
        };
        resolveStoreName(product);
    }, [product.storeName, product.store, product.storeId]);

    return (
        <div className="product-card">
            {discount > 0 && <span className="product-badge">{discount}% off</span>}
            {!product.status && <span className="product-unavailable">Ngừng bán</span>}
            {product.stock === 0 && <span className="product-out">Hết hàng</span>}

            <Link to={`/admin/store/product/detail/${product._id}`} className="product-image-wrap">
                <img src={normalizeImageUrl(product.imageUrl || product.image)} alt={product.productName || product.name} loading="lazy" />
            </Link>

            <div className="product-info">
                <Link to={`/admin/store/product/detail/${product._id}`} className="product-name">{product.productName || product.name}</Link>
                {/* Hiển thị rating trung bình */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, margin: '4px 0' }}>
                    {renderStars(avgRating)}
                    <span style={{ fontSize: 13, color: '#888' }}>{avgRating > 0 ? avgRating.toFixed(1) : "Chưa có"}</span>
                    <span style={{ fontSize: 12, color: '#aaa' }}>({reviewCount})</span>
                </div>
                <div className="product-prices">
                    {discount > 0 ? (
                        <>
                            <span className="price-old">{priceVal.toLocaleString()} VND</span>
                            <span className="price-card">{priceAfter.toLocaleString()} VND</span>
                        </>
                    ) : (
                        <span className="price-card">{priceVal.toLocaleString()} VND</span>
                    )}
                </div>
            </div>
            <div className="product-store">
                {storeName}
            </div>
        </div>
    );
}