import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productStoreService } from '../../services/product-store.service';
import '../../assets/styles/AddProduct.css';
import { FiX, FiUploadCloud, FiCheck } from 'react-icons/fi';
import Button from '../../components/common/buttons/Button';

export default function AddProduct() {
    const navigate = useNavigate();

    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [policy, setPolicy] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    const [stock, setStock] = useState<number | ''>('');
    const [discountPercent, setDiscountPercent] = useState<number | ''>('');
    const [category, setCategory] = useState('');
    const [material, setMaterial] = useState('');

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [dragActive, setDragActive] = useState(false);

    // Data states
    const [categories, setCategories] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);

    // UI states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchCategoriesAndMaterials();
    }, []);

    const fetchCategoriesAndMaterials = async () => {
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
            console.error('Lỗi tải category/material:', err);
        }
    };

    const handleClose = () => {
        navigate('/store/products');
    };

    // ====== IMAGE HANDLING (MULTIPLE) ======
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        processFiles(files);
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

        const files = Array.from(e.dataTransfer.files || []);
        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        if (imageFiles.length === 0) {
            setError('Vui lòng chọn file ảnh hợp lệ');
            return;
        }
        processFiles(imageFiles);
    };

    const processFiles = (files: File[]) => {
        const MAX_SIZE = 5 * 1024 * 1024;

        const validFiles: File[] = [];
        const newPreviews: string[] = [];

        files.forEach(file => {
            if (!file.type.startsWith('image/')) {
                setError('Vui lòng chọn file ảnh');
                return;
            }
            if (file.size > MAX_SIZE) {
                setError('Ảnh không được vượt quá 5MB');
                return;
            }
            validFiles.push(file);
        });

        if (!validFiles.length) return;

        // Cộng thêm vào danh sách cũ
        const mergedFiles = [...imageFiles, ...validFiles];
        setImageFiles(mergedFiles);
        setError(null);

        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveImageAt = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleClearAllImages = () => {
        setImageFiles([]);
        setImagePreviews([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (
            !productName ||
            price === '' ||
            stock === '' ||
            !category ||
            !material ||
            imageFiles.length === 0
        ) {
            setError('Vui lòng điền đầy đủ thông tin và chọn ít nhất 1 ảnh');
            return;
        }

        const formData = new FormData();
        formData.append('productName', productName);
        formData.append('description', description);
        formData.append('policy', policy);
        formData.append('price', String(price));
        formData.append('stock', String(stock));
        formData.append(
            'discountPercent',
            String(discountPercent === '' ? 0 : discountPercent)
        );
        formData.append('category', category);
        formData.append('material', material);

        imageFiles.forEach(file => {
            formData.append('images', file);
        });

        for (let pair of formData.entries()) {
            console.log(`  ${pair[0]}:`, pair[1]);
        }

        try {
            setLoading(true);
            await productStoreService.addProduct(formData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/store/products');
            }, 1500);
        } catch (err: any) {
            console.error('Add product error', err);
            const msg = err?.response?.data?.message || 'Thêm sản phẩm thất bại';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-product-overlay">
            <div className="add-product-modal">
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">Thêm sản phẩm mới</h2>
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

                {/* Success Message */}
                {success && (
                    <div className="success-message">
                        <FiCheck size={20} />
                        <span>Sản phẩm đã được thêm thành công!</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="add-product-form">
                    {/* Product Name */}
                    <div className="form-group">
                        <label className="form-label">
                            Tên sản phẩm <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            value={productName}
                            onChange={e => setProductName(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">Mô tả sản phẩm</label>
                        <textarea
                            placeholder="Mô tả chi tiết về sản phẩm..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="form-textarea"
                            rows={3}
                        />
                    </div>
                    {/* Policy */}
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
                    {/* Category & Material */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Danh mục <span className="required">*</span>
                            </label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="form-input"
                                required
                            >
                                <option value="">-- Chọn danh mục --</option>
                                {categories.map((cat: any) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Chất liệu <span className="required">*</span>
                            </label>
                            <select
                                value={material}
                                onChange={e => setMaterial(e.target.value)}
                                className="form-input"
                                required
                            >
                                <option value="">-- Chọn chất liệu --</option>
                                {materials.map((mat: any) => (
                                    <option key={mat._id} value={mat._id}>
                                        {mat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Price & Stock */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Giá bán (VND) <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="1.000.000"
                                value={
                                    price === '' ? '' : Number(price).toLocaleString('vi-VN')
                                }
                                onChange={e => {
                                    const raw = e.target.value.replace(/[^\d]/g, '');
                                    setPrice(raw === '' ? '' : Number(raw));
                                }}
                                onBlur={e => {
                                    if (price !== '' && !isNaN(Number(price))) {
                                        setPrice(Number(price));
                                    }
                                }}
                                className="form-input"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Số lượng <span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                placeholder="10"
                                value={stock}
                                onChange={e =>
                                    setStock(
                                        e.target.value === ''
                                            ? ''
                                            : Number(e.target.value)
                                    )
                                }
                                className="form-input"
                                min="0"
                                max="100"
                                required
                            />
                        </div>
                    </div>

                    {/* Discount */}
                    <div className="form-group">
                        <label className="form-label">Khuyến mãi (%)</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={discountPercent}
                            onChange={e =>
                                setDiscountPercent(
                                    e.target.value === ''
                                        ? ''
                                        : Number(e.target.value)
                                )
                            }
                            className="form-input"
                            min="0"
                            max="100"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Ảnh sản phẩm <span className="required">*</span>
                        </label>

                        {imagePreviews.length === 0 ? (
                            <div
                                className={`image-upload-area ${dragActive ? 'drag-active' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <FiUploadCloud size={32} className="upload-icon" />
                                <label className="upload-btn">
                                    Chọn ảnh
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        hidden
                                    />
                                </label>
                                <p className="upload-hint">
                                    PNG, JPG, GIF (tối đa 5MB mỗi ảnh, có thể chọn nhiều ảnh)
                                </p>
                            </div>
                        ) : (
                            <div className="image-preview-section-multi">
                                <div className="image-preview-list">
                                    {imagePreviews.map((src, idx) => (
                                        <div key={idx} className="image-preview-item">
                                            <img
                                                src={src}
                                                alt={`Preview ${idx + 1}`}
                                                className="image-preview-img"
                                            />
                                            <button
                                                type="button"
                                                className="btn-remove-thumb"
                                                onClick={() => handleRemoveImageAt(idx)}
                                            >
                                                <FiX size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="upload-actions">
                                    <label className="upload-btn">
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
                                        className="btn-remove"
                                    >
                                        Xóa tất cả
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && <div className="error-message">❌ {error}</div>}

                    {/* Action Buttons */}
                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn btn-secondary"
                        >
                            Hủy
                        </button>
                        <Button
                            variant='add'
                            type="submit"
                            disabled={loading || imageFiles.length === 0}
                        >
                            {loading ? 'Đang thêm...' : 'Thêm sản phẩm'}
                        </Button>
                    </div>
                </form>
            </div >
        </div >
    );
}