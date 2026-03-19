import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { productStoreService } from '../../services/product-store.service';
import { Link } from 'react-router-dom';
import '../../assets/styles/ProductStore.css';
import Icon from "../../components/common/icons/Icon";
import Button from "../../components/common/buttons/Button";

export default function StoreProducts() {
    const location = useLocation();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

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

        // Show toast if redirected after adding product
        if (location.state && location.state.productAdded) {
            toast.success('Sản phẩm đã được thêm thành công!');
        }
    }, [location.state]);

    const filteredProducts = products.filter((p) => {
        const name = (p.productName || p.name || "").toLowerCase();
        const searchMatch = name.includes(search.toLowerCase());
        return searchMatch;
    });

    return (
        <div className="store-pages">
            <div className="product-header">Sản phẩm của cửa hàng
                <span style={{ float: "right" }} >
                    <Link to="/store/products/new" className="button-link">
                        <Button variant="submit">
                            + Thêm sản phẩm
                        </Button>
                    </Link>
                </span>

            </div>
            <input
                className="search-store"
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ marginTop: 16, padding: 8, width: 300 }}
            />
            <div className="store-mainn">
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
                    </div>
                ) : (
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>ẢNH</th>
                                <th>TÊN SẢN PHẨM</th>
                                <th>GIÁ</th>
                                <th>GIẢM GIÁ</th>
                                <th>ĐÃ BÁN</th>
                                <th>TRẠNG THÁI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((p: any) => (
                                <tr key={p._id || p.id}>
                                    <td>
                                        <Link to={`/store/products/${p._id || p.id}`}>
                                            <img
                                                className="productpage-image"
                                                src={p.imageUrl}
                                                alt={p.productName || p.name}
                                            />
                                        </Link>
                                    </td>
                                    <td>
                                        <Link to={`/store/products/${p._id || p.id}`} className="productpage-name">
                                            {p.productName || p.name}
                                        </Link>
                                    </td>
                                    <td><span className="price">{Number(p.price).toLocaleString()} VND</span></td>
                                    <td>{Number(p.discountPercent) > 0 ? `${p.discountPercent}%` : '0%'}</td>
                                    <td>{p.sold}</td>
                                    <td>
                                        {p.status === false ? (
                                            <span style={{ color: '#e53935', fontWeight: 600, background: '#fee2e2', borderRadius: 12, padding: '2px 10px' }}>Ngừng bán</span>
                                        ) : p.status === true ? (
                                            <span style={{ color: '#16a34a', fontWeight: 600, background: "#d1fae5", borderRadius: 12, padding: "2px 10px" }}>Đang bán</span>
                                        ) : (
                                            <span style={{ color: '#6b7280', fontWeight: 500, background: '#f3f4f6', borderRadius: 12, padding: '2px 10px' }}>-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div >
    );
}