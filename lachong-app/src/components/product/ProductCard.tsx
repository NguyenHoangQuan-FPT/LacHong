import { Link } from "react-router-dom";
import "../../assets/styles/ProductCard.css";

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

const resolveStoreName = (p: ProductItem): string => {
    if (p.storeName && String(p.storeName).trim()) return String(p.storeName);
    const store = p.store ?? p.storeId ?? null;
    if (store) {
        if (typeof store === "string") return "Lac Hong Store";
        const candidates = [
            store.storeName,
            store.name,
            store.title,
            store.store_name,
            store.fullName,
            store.displayName,
        ];
        for (const c of candidates) {
            if (c && String(c).trim()) return String(c);
        }
    }
    return "Lac Hong Store";
};

export default function ProductCard({ product }: { product: ProductItem }) {
    const priceVal = Number(product.price || 0);
    const discount = Number(product.discount ?? product.discountPercent ?? 0);
    const priceAfter = discount > 0 ? Math.round(priceVal * (1 - discount / 100)) : priceVal;
    const storeDisplay = resolveStoreName(product);

    return (
        <div className="product-card">
            {discount > 0 && <span className="product-badge">{discount}% off</span>}
            {!product.status && <span className="product-unavailable">Ngừng bán</span>}
            {product.stock === 0 && <span className="product-out">Hết hàng</span>}

            <Link to={`/product/detail?id=${product._id}`} className="product-image-wrap">
                <img src={normalizeImageUrl(product.imageUrl || product.image)} alt={product.productName || product.name} loading="lazy" />
            </Link>

            <div className="product-info">
                <Link to={`/product/detail?id=${product._id}`} className="product-name">{product.productName || product.name}</Link>
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
                <i className="bi bi-shop" /> {storeDisplay}
            </div>
        </div>
    );
}