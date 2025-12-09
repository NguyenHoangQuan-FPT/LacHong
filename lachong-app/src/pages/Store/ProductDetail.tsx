import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productStoreService } from '../../services/product-store.service';
import '../../assets/styles/ProductDetail.css';
import Icon from '../../assets/icons/Icon';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<any | null>(null);
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    // chuẩn bị list ảnh để render thumbnail
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
                {/* Top nav “back to list” */}
                <div className="detail-top-bar">
                    <button
                        type="button"
                        className="detail-back-btn"
                        onClick={() => navigate('/store/products')}
                    >
                        <Icon name="arrow-left" size={16} />
                        <span>Quay lại danh sách</span>
                    </button>
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
                        <h1 className="detail-title">
                            {product.productName || product.name}
                        </h1>

                        <div className="detail-meta-row">
                            <span className="detail-meta-category">
                                {product.category?.name || 'Danh mục'}
                            </span>

                            <span className="detail-meta-rating">
                                <span className="detail-stars">★★★★★</span>
                                <span className="detail-rating-text">
                                    4.9 (2,130 đánh giá)
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
                                    -{product.discountPercent}%
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
                                    {product.status ? 'Đang bán' : 'Ngừng bán'}
                                </li>
                            </ul>
                        </div>

                        {/* Hành động */}
                        <div className="detail-actions">
                            <button
                                className="detail-btn detail-btn-secondary"
                                type="button"
                                onClick={() => navigate(`/store/products/edit/${id}`)}
                            >
                                <Icon name="pencil" size={16} />
                                <span>Sửa sản phẩm</span>
                            </button>

                            <button
                                className="detail-btn detail-btn-danger"
                                type="button"
                                onClick={handleDelete}
                            >
                                <Icon name="trash" size={16} />
                                <span>Xóa sản phẩm</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}