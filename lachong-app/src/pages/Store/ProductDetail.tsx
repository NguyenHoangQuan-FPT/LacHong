import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productStoreService } from '../../services/product-store.service';
import { reviewService } from '../../services/review.service';
import '../../assets/styles/ProductDetail.css';
import Icon from "../../components/common/icons/Icon";
import Button from "../../components/common/buttons/Button";

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<any | null>(null);
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ratingInfo, setRatingInfo] = useState<{ avg: number; count: number }>({ avg: 0, count: 0 });

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        productStoreService
            .getProductById(id)
            .then((res: any) => {
                const data = res?.data ?? res;
                const p = data?.product ?? data?.data ?? data;
                setProduct(p);

                // chuẩn bị list ảnh: ưu tiên images, fallback imageUrl
                const imgs: string[] = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
                if (p.imageUrl && !imgs.includes(p.imageUrl)) {
                    imgs.unshift(p.imageUrl);
                }

                if (imgs.length > 0) {
                    setActiveImage(imgs[0]);
                } else {
                    setActiveImage('/images/Product/pro1.jpg');
                }
            })
            .catch((err: any) => {
                console.error('Load product detail error', err);
                setError('Không tải được thông tin sản phẩm');
            })
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        reviewService
            .getReviewsByProductId(id)
            .then((res: any) => {
                const raw = Array.isArray(res?.data?.reviews)
                    ? res.data.reviews
                    : Array.isArray(res?.data)
                        ? res.data
                        : [];

                const scores = raw
                    .map((r: any) => Number(r?.rating) || 0)
                    .filter((n: number) => !Number.isNaN(n));

                const count = scores.length;
                const avg = count > 0 ? scores.reduce((a, b) => a + b, 0) / count : 0;

                if (!cancelled) setRatingInfo({ avg, count });
            })
            .catch((err: any) => {
                console.error('Load reviews error', err);
                if (!cancelled) setRatingInfo({ avg: 0, count: 0 });
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    const handleDelete = async () => {
        if (!id) return;
        if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
        try {
            await productStoreService.deleteProduct(id);
            navigate('/store/products');
        } catch (err: any) {
            console.error('Delete product error', err);
            alert(err?.response?.data?.message || 'Xóa thất bại');
        }
    };

    // Update product status using storeService
    const [statusLoading, setStatusLoading] = useState(false);
    const handleUpdateStatus = async () => {
        if (!id || !product) return;
        setStatusLoading(true);
        try {
            // Toggle status
            const newStatus = !product.status;
            const res = await productStoreService.updateStatusProduct(id, newStatus);
            if (res?.data?.status !== undefined) {
                setProduct({ ...product, status: res.data.status });
            } else {
                setProduct({ ...product, status: newStatus });
            }
        } catch (err: any) {
            alert('Cập nhật trạng thái thất bại');
        } finally {
            setStatusLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="store-status store-status-loading">
                <Icon name="arrow-repeat" size={18} className="spin" /> Đang tải...
            </div>
        );
    }

    if (error) {
        return (
            <div className="store-status store-status-error">
                <Icon name="exclamation-circle" size={18} /> {error}
            </div>
        );
    }

    if (!product) {
        return (
            <div className="store-status store-status-empty">
                Không tìm thấy sản phẩm.
            </div>
        );
    }

    const allImages: string[] = (() => {
        const imgs: string[] = Array.isArray(product.images)
            ? product.images.filter(Boolean)
            : [];
        if (product.imageUrl && !imgs.includes(product.imageUrl)) {
            imgs.unshift(product.imageUrl);
        }
        if (imgs.length === 0) {
            imgs.push('/images/Product/pro1.jpg');
        }
        return imgs;
    })();

    return (
        <div className="store-page detail-page">
            <div className="detail-wrapper">
                <div >
                    <Link to="/store/products">
                        <Button variant="secondary" >
                            <Icon name="back" /> Quay lại
                        </Button>
                    </Link>
                </div>
                {/* Card bao cả ảnh + thông tin */}
                <div className="detail-card detail-card-with-image">
                    {/* Cột trái: gallery ảnh */}
                    <div className="detail-card-left">
                        <div className="detail-image-main-wrapper">
                            <div className="detail-image-bg">
                                <img
                                    className="detail-product-image"
                                    src={activeImage || allImages[0]}
                                    alt={product.productName || product.name}
                                />
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="detail-thumbnails">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className={
                                            'detail-thumb' +
                                            (img === activeImage ? ' detail-thumb-active' : '')
                                        }
                                        onClick={() => setActiveImage(img)}
                                    >
                                        <img src={img} alt={`Thumbnail ${idx + 1}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cột phải: thông tin */}
                    <div className="detail-card-right">
                        <div style={{ fontSize: 34, fontWeight: 600, marginBottom: 8 }}>
                            {product.productName || product.name}
                            <span style={{ float: 'right' }}>
                                <Button
                                    variant='secondary'
                                    onClick={handleDelete}
                                >
                                    <Icon name="trash" />
                                </Button>
                            </span>
                        </div>

                        <div className="detail-meta-row">
                            <span className="detail-meta-rating">
                                <span className="detail-stars">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <span
                                            key={i}
                                            style={{ color: i < Math.round(ratingInfo.avg) ? '#ffc107' : '#e4e5e9', paddingRight: 2 }}
                                        >
                                            <Icon name="start" size={14} />
                                        </span>
                                    ))}
                                </span>
                                <span className="detail-rating-text">
                                    {ratingInfo.count > 0
                                        ? `${ratingInfo.avg.toFixed(1)} (${ratingInfo.count} đánh giá)`
                                        : 'Chưa có đánh giá'}
                                </span>
                            </span>
                        </div>

                        {/* Giá + giảm giá */}
                        <div className="detail-price-row">
                            <div className="detail-price">
                                {Number(product.price).toLocaleString()} VND
                            </div>
                            {Number(product.discountPercent) > 0 && (
                                <span className="detail-discount-pill">
                                    {product.discountPercent}%
                                </span>
                            )}
                        </div>

                        {/* Mô tả */}
                        <div className="detail-section">
                            <div className="detail-section-title">Mô tả</div>
                            <ul className="detail-list">
                                {product.description ? (
                                    product.description
                                        .split('\n')
                                        .filter((line: string) => line.trim())
                                        .map((line: string, idx: number) => (
                                            <li key={idx}>{line}</li>
                                        ))
                                ) : (
                                    <li>Chưa có mô tả cho sản phẩm này.</li>
                                )}
                            </ul>
                        </div>

                        <div className="detail-section">
                            <div className="detail-section-title">Chính sách bảo hành</div>
                            <ul className="detail-list">
                                {product.policy ? (
                                    product.policy
                                        .split('\n')
                                        .filter((line: string) => line.trim())
                                        .map((line: string, idx: number) => (
                                            <li key={idx}>{line}</li>
                                        ))
                                ) : (
                                    <li>Chưa có chính sách bảo hành cho sản phẩm này.</li>
                                )}
                            </ul>
                        </div>
                        {/* Tồn kho */}
                        <div className="detail-section">
                            <div className="detail-section-title">Tồn kho</div>
                            <div className="detail-size-row">
                                <span className="detail-size-pill detail-size-pill-active">
                                    {product.stock ?? 0} sản phẩm
                                </span>
                            </div>
                        </div>

                        {/* Thông tin thêm */}
                        <div className="detail-section">
                            <div className="detail-section-title">Thông tin</div>
                            <ul className="detail-list">
                                <li>
                                    <strong>Danh mục:</strong>{' '}
                                    {product.category?.name || '—'}
                                </li>
                                <li>
                                    <strong>Chất liệu:</strong>{' '}
                                    {product.material?.name || '—'}
                                </li>
                                <li>
                                    <strong>Trạng thái:</strong>{' '}
                                    {product.status === false ?
                                        <span style={{ color: '#e53935', fontWeight: 600, background: "#ffcdd2", borderRadius: "12px", padding: "2px 6px" }}>Ngừng bán</span >
                                        :
                                        product.status === true ?
                                            <span style={{ color: '#16a34a', fontWeight: 600, background: "#d1fae5", borderRadius: "12px", padding: "2px 6px" }}>Đang bán</span>
                                            : '—'
                                    }
                                </li>
                            </ul>
                        </div>

                        <div className="detail-actions">
                            <Button
                                variant='secondary'
                                onClick={() => navigate(`/store/products/edit/${id}`)}
                            >
                                Sửa sản phẩm
                            </Button>
                            <Button
                                variant={product.status ? 'danger' : 'success'}
                                onClick={() => handleUpdateStatus()}
                            >
                                {statusLoading ? 'Đang cập nhật...' : (product.status ? 'Ngừng bán' : 'Mở bán')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}