import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productStoreService } from '../../services/product-store.service';
import '../../assets/styles/AddProduct.css';
import Icon from '../../assets/icons/Icon';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    const [stock, setStock] = useState<number | ''>('');
    const [discountPercent, setDiscountPercent] = useState<number | ''>('');
    const [category, setCategory] = useState('');
    const [material, setMaterial] = useState('');

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const [categories, setCategories] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                setPrice(p.price ?? '');
                setStock(p.stock ?? '');
                setDiscountPercent(p.discountPercent ?? '');
                setCategory(p.category?._id || p.category || '');
                setMaterial(p.material?._id || p.material || '');
                setImagePreview(p.imageUrl || '');
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

    const processFile = (image: File) => {
        if (!image.type.startsWith('image/')) {
            setError('Vui lòng chọn file ảnh');
            return;
        }
        if (image.size > 5 * 1024 * 1024) {
            setError('Ảnh không được vượt quá 5MB');
            return;
        }
        setImageFile(image);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(image);
        setError(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const image = e.target.files?.[0];
        if (image) processFile(image);
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
        const image = e.dataTransfer.files?.[0];
        if (image) processFile(image);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!productName || price === '' || stock === '') {
            setError('Vui lòng nhập tên, giá và số lượng');
            return;
        }
        const formData = new FormData();
        formData.append('productName', productName);
        formData.append('description', description);
        formData.append('price', String(price));
        formData.append('stock', String(stock));
        formData.append('discountPercent', String(discountPercent === '' ? 0 : discountPercent));
        formData.append('category', category);
        formData.append('material', material);
        if (imageFile) formData.append('imageUrl', imageFile);

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

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview('');
    };

    if (loading) return <div className="store-status store-status-loading">Đang tải...</div>;
    if (error) return <div className="store-status store-status-error">{error}</div>;

    return (
        <div className="add-product-overlay">
            <div className="add-product-modal">
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">✏️ Sửa sản phẩm</h2>
                        <p className="modal-subtitle">Sửa thông tin sản phẩm</p>
                    </div>
                    <button className="modal-close-btn" onClick={() => navigate('/store/products')}><Icon name="x" size={18} /></button>
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

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Giá (VND) <span className="required">*</span></label>
                            <div className="input-with-icon">
                                <span className="currency">₫</span>
                                <input className="form-input" type="number" value={price} onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))} />
                            </div>
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
                        {!imagePreview ? (
                            <div className={`image-upload-area ${dragActive ? 'drag-active' : ''}`} onDragEnter={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
                                <p>Thả ảnh vào đây hoặc chọn file</p>
                                <label className="upload-btn">Chọn ảnh
                                    <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                                </label>
                            </div>
                        ) : (
                            <div className="image-preview-section">
                                <img src={imagePreview} alt="preview" className="image-preview-img" />
                                <div className="upload-actions"><button type="button" className="btn-remove" onClick={handleRemoveImage}>Chọn lại</button></div>
                            </div>
                        )}
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="form-actions">
                        <button type="button" onClick={() => navigate('/store/products')} className="btn btn-secondary">Hủy</button>
                        <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? 'Đang cập nhật...' : 'Lưu thay đổi'}</button>
                    </div>
                </form>
                <ToastContainer position="top-right" autoClose={3000} />
            </div>
        </div>
    );
}
