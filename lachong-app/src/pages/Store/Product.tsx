import { useEffect, useState } from 'react';
import { productStoreService } from '../../services/product-store.service';
import { Link } from 'react-router-dom';
import '../../assets/styles/ProductStore.css';
import Icon from '../../assets/icons/Icon';

export default function StoreProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const storeRaw = localStorage.getItem('store') || localStorage.getItem('user');
    let storeId: string | null = null;
    try {
        const obj = storeRaw ? JSON.parse(storeRaw) : null;
        storeId = obj?._id || obj?.id || obj?.storeId || null;
    } catch (e) {
        storeId = null;
    }

    useEffect(() => {
        setLoading(true);
        productStoreService.getStoreProducts()
            .then((res: any) => {
                const data = res?.data ?? res;
                const list = data?.products ?? data?.data ?? (Array.isArray(data) ? data : []);
                setProducts(list);
            })
            .catch((err: any) => {
                console.error('Load store products error', err);
                setError('Không tải được sản phẩm của cửa hàng');
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="store-page">
            <div className="store-main">
                {/* Header */}
                <header className="store-header">
                    <div className="store-header-left">
                        <h2>Quản lý sản phẩm</h2>
                        <p>Danh sách sản phẩm của cửa hàng</p>
                    </div>
                    <div className="store-header-action">
                        <Link to="/store/products/new" className="store-add-btn">
                            <Icon name="plus" size={16} />
                            <span>Thêm sản phẩm</span>
                        </Link>
                    </div>
                </header>

                {/* Content */}
                {loading ? (
                    <div className="store-status store-status-loading">
                        <Icon name="arrow-repeat" size={18} className="spin" /> Đang tải...
                    </div>
                ) : error ? (
                    <div className="store-status store-status-error">
                        <Icon name="exclamation-circle" size={18} /> {error}
                    </div>
                ) : products.length === 0 ? (
                    <div className="store-status store-status-empty">
                        <Icon name="box" size={20} /> Không có sản phẩm nào.
                        <br />
                        <Link to="/store/products/new" className="store-empty-link">
                            Thêm sản phẩm đầu tiên
                        </Link>
                    </div>
                ) : (
                    <div className="productpage-grid">
                        {products.map((p: any) => (
                            <Link
                                key={p._id || p.id}
                                to={`/store/products/${p._id || p.id}`}
                                className="productpage-link"
                                title="Xem chi tiết"
                            >
                                <div className="productpage-card">
                                    {Number(p.discountPercent) > 0 && (
                                        <div className="productpage-discount">
                                            {p.discountPercent}% OFF
                                        </div>
                                    )}
                                    <img
                                        className="productpage-image"
                                        src={p.imageUrl}
                                        alt={p.productName || p.name}
                                    />
                                    <div className="productpage-name">
                                        {p.productName || p.name}
                                    </div>
                                    <div className="productpage-spacer" />
                                    <div className="productpage-bottom">
                                        <div className="productpage-prices">
                                            <span className="price">
                                                {Number(p.price).toLocaleString()} VND
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}