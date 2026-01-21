import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productStoreService } from '../../services/product-store.service';
import '../../assets/styles/AddProduct.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Toast from '../../components/common/toast/Toast';
import { FiX } from 'react-icons/fi';
import Button from '../../components/common/buttons/Button';
import Icon from '../../components/common/icons/Icon';

function toPublicImageUrl(value?: string): string {
    if (!value) return '';
    if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
    const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '';
    if (!base) return value;
    return `${String(base).replace(/\/$/, '')}/${String(value).replace(/^\//, '')}`;
}

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [policy, setPolicy] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    const [stock, setStock] = useState<number | ''>('');
    const [discountPercent, setDiscountPercent] = useState<number | ''>('');
    const [category, setCategory] = useState('');
    const [material, setMaterial] = useState('');

    const [keptImages, setKeptImages] = useState<string[]>([]);
    type SelectedImage = { key: string; file: File; previewUrl: string };
    const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
    const [dragActive, setDragActive] = useState(false);

    const [categories, setCategories] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totalImages = useMemo(() => keptImages.length + selectedImages.length, [keptImages.length, selectedImages.length]);

    useEffect(() => {
        fetchMeta();
    }, []);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        productStoreService.getProductById(id)
            .then((res: any) => {
                const data = res?.data ?? res;
                const p = data?.product ?? data?.data ?? data;
                setProductName(p.productName || p.name || '');
                setDescription(p.description || '');
                setPolicy(p.policy || '');
                setPrice(p.price ?? '');
                setStock(p.stock ?? '');
                setDiscountPercent(p.discountPercent ?? '');
                setCategory(p.category?._id || p.category || '');
                setMaterial(p.material?._id || p.material || '');
                const images: string[] = Array.isArray(p.images)
                    ? p.images.filter(Boolean)
                    : (p.imageUrl ? [p.imageUrl] : []);
                setKeptImages(images);
                setSelectedImages((curr) => {
                    curr.forEach((it) => URL.revokeObjectURL(it.previewUrl));
                    return [];
                });
            })
            .catch((err: any) => {
                console.error('Load product for edit error', err);
                setError('Không tải được thông tin sản phẩm để sửa');
            })
            .finally(() => setLoading(false));
    }, [id]);

    const fetchMeta = async () => {
        try {
            const [catRes, matRes] = await Promise.all([
                productStoreService.getCategories(),
                productStoreService.getMaterials()
            ]);
            const cats = catRes?.data?.categories ?? catRes?.data ?? [];
            const mats = matRes?.data?.materials ?? matRes?.data ?? [];
            setCategories(Array.isArray(cats) ? cats : []);
            setMaterials(Array.isArray(mats) ? mats : []);
        } catch (err) {
            console.warn('Cannot load categories/materials', err);
        }
    };

    useEffect(() => {
        return () => {
            setSelectedImages((curr) => {
                curr.forEach((it) => URL.revokeObjectURL(it.previewUrl));
                return curr;
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const processFiles = (files: File[]) => {
        const MAX_SIZE = 5 * 1024 * 1024;
        const valid: File[] = [];

        for (const f of files) {
            if (!f.type.startsWith('image/')) {
                setError('Vui lòng chọn file ảnh hợp lệ');
                continue;
            }
            if (f.size > MAX_SIZE) {
                setError('Ảnh không được vượt quá 5MB');
                continue;
            }
            valid.push(f);
        }

        if (valid.length === 0) return;

        setError(null);
        setSelectedImages((curr) => {
            const existingKeys = new Set(curr.map((it) => it.key));
            const next = [...curr];
            for (const file of valid) {
                const key = `${file.name}-${file.size}-${file.lastModified}`;
                if (existingKeys.has(key)) continue;
                existingKeys.add(key);
                next.push({ key, file, previewUrl: URL.createObjectURL(file) });
            }
            return next;
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        e.target.value = '';
        if (files.length > 0) processFiles(files);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith('image/'));
        if (files.length === 0) {
            setError('Vui lòng chọn file ảnh hợp lệ');
            return;
        }
        processFiles(files);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!productName || price === '' || stock === '' || !category || !material) {
            setError('Vui lòng nhập đầy đủ tên, giá, số lượng, danh mục và chất liệu');
            return;
        }

        if (totalImages === 0) {
            setError('Vui lòng chọn ít nhất 1 ảnh sản phẩm');
            return;
        }
        const formData = new FormData();
        formData.append('productName', productName);
        formData.append('description', description);
        formData.append('policy', policy);
        formData.append('price', String(price));
        formData.append('stock', String(stock));
        formData.append('discountPercent', String(discountPercent === '' ? 0 : discountPercent));
        formData.append('category', category);
        formData.append('material', material);
        formData.append('keepImages', JSON.stringify(keptImages));
        selectedImages.forEach((it) => formData.append('images', it.file));

        try {
            setUploading(true);
            if (id) await productStoreService.updateProduct(id, formData);
            toast.success('Cập nhật sản phẩm thành công');
            setTimeout(() => navigate('/store/products/' + id), 700);
        } catch (err: any) {
            console.error('Update product error', err);
            const msg = err?.response?.data?.message || 'Cập nhật sản phẩm thất bại';
            setError(msg);
            toast.error(msg);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveKeptImage = (url: string) => {
        setKeptImages((prev) => prev.filter((x) => x !== url));
    };

    const handleRemoveSelectedImage = (key: string) => {
        setSelectedImages((prev) => {
            const found = prev.find((it) => it.key === key);
            if (found) URL.revokeObjectURL(found.previewUrl);
            return prev.filter((it) => it.key !== key);
        });
    };

    const handleClearAllImages = () => {
        setKeptImages([]);
        setSelectedImages((prev) => {
            prev.forEach((it) => URL.revokeObjectURL(it.previewUrl));
            return [];
        });
    };

    const handleClose = () => {
        navigate('/store/products');
    };

    if (loading) return <div className="store-status store-status-loading">Đang tải...</div>;
    if (error) return <div className="store-status store-status-error">{error}</div>;

    return (
        <div className="add-product-overlay">
            <div className="add-product-modal">
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">Sửa sản phẩm</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="modal-close-btn"
                        title="Đóng"
                    >
                        <FiX size={24} />
                        X
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="add-product-form" onDragEnter={handleDrag}>
                    <div className="form-group">
                        <label className="form-label">Tên sản phẩm <span className="required">*</span></label>
                        <input className="form-input" value={productName} onChange={e => setProductName(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mô tả</label>
                        <textarea className="form-textarea" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Chính sách sản phẩm</label>
                        <textarea
                            placeholder="Chính sách đổi trả, bảo hành..."
                            value={policy}
                            onChange={e => setPolicy(e.target.value)}
                            className="form-textarea"
                            rows={3}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Giá (VND) <span className="required">*</span></label>
                            <input
                                className="form-input"
                                type="text"
                                inputMode="numeric"
                                value={price === '' ? '' : Number(price).toLocaleString('vi-VN')}
                                onChange={e => {
                                    const raw = e.target.value.replace(/[^\d]/g, '');
                                    setPrice(raw === '' ? '' : Number(raw));
                                }}
                                onBlur={() => {
                                    if (price !== '' && !isNaN(Number(price))) {
                                        setPrice(Number(price));
                                    }
                                }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Số lượng <span className="required">*</span></label>
                            <input className="form-input" type="number" value={stock} onChange={e => setStock(e.target.value === '' ? '' : Number(e.target.value))} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Danh mục</label>
                        <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Chất liệu</label>
                        <select className="form-input" value={material} onChange={e => setMaterial(e.target.value)}>
                            <option value="">-- Chọn chất liệu --</option>
                            {materials.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Ảnh sản phẩm</label>
                        {totalImages === 0 ? (
                            <div className={`image-upload-area ${dragActive ? 'drag-active' : ''}`} onDragEnter={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
                                <p>Thả ảnh vào đây hoặc chọn file</p>
                                <label className="upload-btn">Chọn ảnh
                                    <input type="file" accept="image/*" multiple hidden onChange={handleFileChange} />
                                </label>
                            </div>
                        ) : (
                            <div className="image-preview-section-multi">
                                <div className="image-preview-list">
                                    {keptImages.map((src, idx) => (
                                        <div key={`kept-${src}-${idx}`} className="image-preview-item">
                                            <img
                                                src={toPublicImageUrl(src)}
                                                alt={`Preview ${idx + 1}`}
                                                className="image-preview-img"
                                            />
                                            <button
                                                type="button"
                                                className="btn-remove-thumb"
                                                onClick={() => handleRemoveKeptImage(src)}
                                            >
                                                <Icon name="trash" size={16} />
                                            </button>
                                        </div>
                                    ))}

                                    {selectedImages.map((it, idx) => (
                                        <div key={it.key} className="image-preview-item">
                                            <img
                                                src={it.previewUrl}
                                                alt={`New ${idx + 1}`}
                                                className="image-preview-img"
                                            />
                                            <button
                                                type="button"
                                                className="btn-remove-thumb"
                                                onClick={() => handleRemoveSelectedImage(it.key)}
                                            >
                                                <Icon name="trash" size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="upload-actions">
                                    <label>
                                        Thêm ảnh khác
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFileChange}
                                            hidden
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleClearAllImages}
                                    >
                                        Xóa tất cả
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="form-actions">
                        <button type="button" onClick={() => navigate('/store/products')} className="btn btn-secondary">Hủy</button>
                        <Button type="submit" variant='submit' disabled={uploading}>{uploading ? 'Đang cập nhật...' : 'Lưu thay đổi'}</Button>
                    </div>
                </form>
                <Toast />
            </div >
        </div >
    );
}
