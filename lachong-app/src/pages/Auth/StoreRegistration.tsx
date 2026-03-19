import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { storeService } from "../../services/store.service";
import { typeStoreService } from "../../services/typeStore.service";
import { productStoreService } from "../../services/product-store.service";
import categoryService from "../../services/category.service";
import materialService from "../../services/material.service";
import "../../assets/styles/StoreRegistration.css";
import Button from "../../components/common/buttons/Button";

type TypeStore = {
    _id: string;
    typeName?: string;
    name?: string;
};

type Province = {
    code: number;
    name: string;
};

type District = {
    code: number;
    name: string;
};

type Ward = {
    code: number;
    name: string;
};

type Category = {
    _id?: string;
    id?: string;
    name?: string;
};

type Material = {
    _id?: string;
    id?: string;
    name?: string;
};

const normalizeText = (value: string) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const pickByName = <T extends Record<string, any>>(
    items: T[],
    name: string,
    keys: Array<keyof T>
): T | undefined => {
    const target = normalizeText(name);
    if (!target) return undefined;

    // 1) exact match
    for (const it of items) {
        for (const k of keys) {
            if (normalizeText(String(it[k] ?? "")) === target) return it;
        }
    }

    // 2) contains match (fallback)
    for (const it of items) {
        for (const k of keys) {
            const v = normalizeText(String(it[k] ?? ""));
            if (v && (v.includes(target) || target.includes(v))) return it;
        }
    }
    return undefined;
};

const splitAddress = (raw: string) => {
    const parts = String(raw || "")
        .split(",")
        .map(p => p.trim())
        .filter(Boolean);
    if (parts.length < 2) {
        return { detail: raw || "", ward: "", district: "", province: "" };
    }
    const province = parts[parts.length - 1] || "";
    const district = parts[parts.length - 2] || "";
    const ward = parts.length >= 3 ? (parts[parts.length - 3] || "") : "";
    const detail = parts.slice(0, Math.max(0, parts.length - 3)).join(", ");
    return { detail, ward, district, province };
};

export default function StoreRegistration() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [step, setStep] = useState<1 | 2 | 3>(1);

    const [typeStores, setTypeStores] = useState<TypeStore[]>([]);
    const [typeStoreId, setTypeStoreId] = useState("");

    const [storeName, setStoreName] = useState("");
    const [emailStore, setEmailStore] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [policy, setPolicy] = useState("");
    const [description, setDescription] = useState("");

    const [facebook, setFacebook] = useState("");
    const [instagram, setInstagram] = useState("");
    const [twitter, setTwitter] = useState("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarRemoteUrl, setAvatarRemoteUrl] = useState<string>("");
    const [avatarPreview, setAvatarPreview] = useState<string>("");

    const [storeStatus, setStoreStatus] = useState<string>("");

    // Product step
    const [productSaving, setProductSaving] = useState(false);
    const [productError, setProductError] = useState<string | null>(null);
    const [productSuccess, setProductSuccess] = useState<string | null>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);

    const [productName, setProductName] = useState("");
    const [productPrice, setProductPrice] = useState<string>("");
    const [productStock, setProductStock] = useState<string>("");
    const [productDiscountPercent, setProductDiscountPercent] = useState<string>("");
    const [productCategoryId, setProductCategoryId] = useState("");
    const [productMaterialId, setProductMaterialId] = useState("");
    const [productDescription, setProductDescription] = useState("");
    const [productPolicy, setProductPolicy] = useState("");
    const [productImages, setProductImages] = useState<File[]>([]);
    const [productImagePreviews, setProductImagePreviews] = useState<string[]>([]);

    useEffect(() => {
        const urls = productImages.map(f => URL.createObjectURL(f));
        setProductImagePreviews(urls);
        return () => {
            for (const u of urls) URL.revokeObjectURL(u);
        };
    }, [productImages]);

    const addProductImages = (files: File[]) => {
        setProductError(null);
        if (!files.length) return;

        const isImage = (f: File) => f.type?.startsWith("image/");
        const valid = files.filter(isImage);
        if (!valid.length) {
            setProductError("Vui lòng chọn file ảnh hợp lệ");
            return;
        }

        const fileKey = (f: File) => `${f.name}-${f.size}-${f.lastModified}`;
        setProductImages(prev => {
            const existing = new Set(prev.map(fileKey));
            const next = [...prev];
            for (const f of valid) {
                if (next.length >= 4) break;
                const k = fileKey(f);
                if (existing.has(k)) continue;
                existing.add(k);
                next.push(f);
            }
            if (prev.length + valid.length > 4 && next.length === 4) {
                setProductError("Chỉ được thêm tối đa 4 ảnh");
            }
            return next;
        });
    };

    const fetchHasProducts = async (): Promise<boolean> => {
        try {
            const productsRes = await storeService.getProductsByStore();
            const productsList = (productsRes as any)?.data?.products;
            const list = Array.isArray(productsList)
                ? productsList
                : Array.isArray((productsRes as any)?.data)
                    ? (productsRes as any).data
                    : [];
            const has = Array.isArray(list) && list.length > 0;
            return has;
        } catch {
            return false;
        }
    };

    // Address via provinces.open-api.vn
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [provinceCode, setProvinceCode] = useState<number | "">("");
    const [districtCode, setDistrictCode] = useState<number | "">("");
    const [wardCode, setWardCode] = useState<number | "">("");
    const [detailAddress, setDetailAddress] = useState("");

    const selectedProvince = provinces.find(p => p.code === provinceCode);
    const selectedDistrict = districts.find(d => d.code === districtCode);
    const selectedWard = wards.find(w => w.code === wardCode);
    const computedAddress = [
        detailAddress.trim(),
        selectedWard?.name,
        selectedDistrict?.name,
        selectedProvince?.name
    ].filter(Boolean).join(", ");

    useEffect(() => {
        if (!avatarFile) return;
        const url = URL.createObjectURL(avatarFile);
        setAvatarPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [avatarFile]);

    useEffect(() => {
        let alive = true;
        const run = async () => {
            try {
                const [typeRes, storeRes] = await Promise.all([
                    typeStoreService.getTypeStoreTrue(),
                    storeService.getStoreInfo()
                ]);

                const typeData = (typeRes as any)?.data ?? typeRes;
                if (alive) setTypeStores(typeData?.data || typeData || []);

                const s = (storeRes as any)?.data?.store || (storeRes as any)?.data || {};
                if (alive) {
                    setStoreName(s.storeName || "");
                    setEmailStore(s.emailStore || "");
                    setPhone(s.phone || "");
                    setAddress(s.address || "");
                    setPolicy(s.policy || "");
                    setDescription(s.description || "");
                    setFacebook(s?.socialMedia?.facebook || "");
                    setInstagram(s?.socialMedia?.instagram || "");
                    setTwitter(s?.socialMedia?.twitter || "");
                    setAvatarFile(null);
                    const remote = String(s?.avatar || s?.avatarUrl || "");
                    setAvatarRemoteUrl(remote);
                    setAvatarPreview(remote);
                    setTypeStoreId(String(s.typeStoreId || ""));
                    const status = String(s.status || "");
                    setStoreStatus(status);

                    const parsed = splitAddress(String(s.address || ""));
                    setDetailAddress(parsed.detail || "");

                    // If the shop already submitted enough info and is still pending,
                    // show the Product/Finish screen on next login.
                    const isPending = status.toUpperCase() === "PENDING";
                    const isProfileCompleted = Boolean(
                        String(s.storeName || "").trim() &&
                        String(s.emailStore || "").trim() &&
                        String(s.address || "").trim() &&
                        String(s.description || "").trim() &&
                        String(s.policy || "").trim() &&
                        s.typeStoreId
                    );
                    if ((isPending || Boolean(status)) && isProfileCompleted) {
                        const hasProducts = await fetchHasProducts();
                        if (!alive) return;
                        setStep(hasProducts ? 3 : 2);
                    }
                }
            } catch (err: any) {
                setError("Không tải được thông tin cửa hàng");
            } finally {
                if (alive) setLoading(false);
            }
        };
        run();
        return () => {
            alive = false;
        };
    }, []);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const f = e.target.files?.[0];
        if (!f) return;
        if (!f.type?.startsWith("image/")) {
            setError("Vui lòng chọn file ảnh hợp lệ");
            return;
        }
        setAvatarFile(f);
        e.currentTarget.value = "";
    };

    // Load categories/materials for product step
    useEffect(() => {
        if (step !== 2) return;
        let alive = true;
        const run = async () => {
            try {
                const [catRes, matRes] = await Promise.all([
                    categoryService.getAllCategories(),
                    materialService.getAllMaterials()
                ]);

                const catData = (catRes as any)?.data?.categories ?? (catRes as any)?.data ?? [];
                const catList = Array.isArray(catData) ? catData : (catData?.data ?? []);

                const matData = (matRes as any)?.data?.materials ?? (matRes as any)?.data ?? [];
                const matList = Array.isArray(matData) ? matData : (matData?.data ?? []);

                if (!alive) return;
                setCategories(Array.isArray(catList) ? catList : []);
                setMaterials(Array.isArray(matList) ? matList : []);
            } catch {
                if (!alive) return;
                setCategories([]);
                setMaterials([]);
            }
        };
        run();
        return () => {
            alive = false;
        };
    }, [step]);

    // Load provinces list
    useEffect(() => {
        const controller = new AbortController();
        const run = async () => {
            try {
                const res = await fetch('https://provinces.open-api.vn/api/p/', { signal: controller.signal });
                const data = await res.json();
                if (Array.isArray(data)) {
                    setProvinces(data.map((p: any) => ({ code: Number(p.code), name: String(p.name) })));
                }
            } catch {
                // ignore: keep manual address as fallback
            }
        };
        run();
        return () => controller.abort();
    }, []);

    // Attempt to preselect province/district/ward from existing address once provinces are loaded.
    useEffect(() => {
        if (!provinces.length) return;
        if (provinceCode !== "") return;

        const parsed = splitAddress(address);
        if (!parsed.province) return;
        const p = pickByName(provinces, parsed.province, ["name"]);
        if (p) setProvinceCode(p.code);
    }, [provinces, address, provinceCode]);

    // Load districts when province changes
    useEffect(() => {
        const controller = new AbortController();
        const run = async () => {
            if (provinceCode === "") {
                setDistricts([]);
                setDistrictCode("");
                setWards([]);
                setWardCode("");
                return;
            }
            try {
                const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`, { signal: controller.signal });
                const data = await res.json();
                const ds: District[] = Array.isArray(data?.districts)
                    ? data.districts.map((d: any) => ({ code: Number(d.code), name: String(d.name) }))
                    : [];
                setDistricts(ds);

                // try preselect district from existing address
                const parsed = splitAddress(address);
                if (districtCode === "" && parsed.district) {
                    const match = pickByName(ds, parsed.district, ["name"]);
                    if (match) setDistrictCode(match.code);
                }
            } catch {
                setDistricts([]);
            }
        };
        run();
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provinceCode]);

    // Load wards when district changes
    useEffect(() => {
        const controller = new AbortController();
        const run = async () => {
            if (districtCode === "") {
                setWards([]);
                setWardCode("");
                return;
            }
            try {
                const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`, { signal: controller.signal });
                const data = await res.json();
                const ws: Ward[] = Array.isArray(data?.wards)
                    ? data.wards.map((w: any) => ({ code: Number(w.code), name: String(w.name) }))
                    : [];
                setWards(ws);

                // try preselect ward from existing address
                const parsed = splitAddress(address);
                if (wardCode === "" && parsed.ward) {
                    const match = pickByName(ws, parsed.ward, ["name"]);
                    if (match) setWardCode(match.code);
                }
            } catch {
                setWards([]);
            }
        };
        run();
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [districtCode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!storeName.trim()) return setError("Vui lòng nhập tên cửa hàng");
        if (!emailStore.trim()) return setError("Vui lòng nhập email cửa hàng");
        if (!typeStoreId) return setError("Vui lòng chọn loại cửa hàng");
        if (!computedAddress) return setError("Vui lòng nhập địa chỉ cửa hàng");
        if (phone && !/^[0-9()+-\s]+$/.test(phone.trim())) {
            return setError("Số điện thoại không hợp lệ");
        }
        if (!/\S+@\S+\.\S+/.test(emailStore.trim())) {
            return setError("Email không hợp lệ");
        }
        if (!storeName.trim()) return setError("Vui lòng nhập tên cửa hàng");
        if (!description.trim()) return setError("Vui lòng nhập mô tả cửa hàng");
        if (!policy.trim()) return setError("Vui lòng nhập chính sách cửa hàng");

        setSaving(true);
        try {
            const form = new FormData();
            form.append("storeName", storeName.trim());
            form.append("emailStore", emailStore.trim().toLowerCase());
            if (phone) form.append("phone", phone);
            const finalAddress = computedAddress || address;
            if (finalAddress) form.append("address", finalAddress);
            if (policy) form.append("policy", policy);
            if (description) form.append("description", description);
            if (typeStoreId) form.append("typeStoreId", typeStoreId);

            const fb = facebook.trim();
            const ig = instagram.trim();
            const tw = twitter.trim();
            if (fb) form.append("facebook", fb);
            if (ig) form.append("instagram", ig);
            if (tw) form.append("twitter", tw);
            if (avatarFile) form.append("avatar", avatarFile);

            await storeService.updateProfile(form);

            try {
                const storeRes = await storeService.getStoreInfo();
                const s = (storeRes as any)?.data?.store || (storeRes as any)?.data || {};
                setAddress(String(s.address || finalAddress || ""));
                setStoreStatus(String(s.status || ""));
            } catch {
                // ignore
            }

            setSuccess("Cập nhật hồ sơ cửa hàng thành công");

            const hasProducts = await fetchHasProducts();
            setStep(hasProducts ? 3 : 2);
        } catch {
            setError("Cập nhật thất bại");
        } finally {
            setSaving(false);
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setProductError(null);
        setProductSuccess(null);

        if (!productName.trim()) return setProductError("Vui lòng nhập tên sản phẩm");
        if (!productPrice.trim()) return setProductError("Vui lòng nhập giá sản phẩm");
        if (!productStock.trim()) return setProductError("Vui lòng nhập số lượng tồn");
        if (!productCategoryId) return setProductError("Vui lòng chọn danh mục");
        if (!productMaterialId) return setProductError("Vui lòng chọn chất liệu");
        if (productImages.length > 4) return setProductError("Chỉ được thêm tối đa 4 ảnh");

        const priceNum = Number(productPrice);
        const stockNum = Number(productStock);
        const discountNum = productDiscountPercent.trim() ? Number(productDiscountPercent) : NaN;

        if (Number.isNaN(priceNum) || priceNum < 0) return setProductError("Giá sản phẩm không hợp lệ");
        if (Number.isNaN(stockNum) || stockNum < 0) return setProductError("Số lượng tồn không hợp lệ");
        if (productDiscountPercent.trim()) {
            if (Number.isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
                return setProductError("Giảm giá phải từ 0 đến 100");
            }
        }

        setProductSaving(true);
        try {
            const form = new FormData();
            form.append("productName", productName.trim());
            form.append("price", String(priceNum));
            form.append("stock", String(stockNum));
            form.append("category", productCategoryId);
            form.append("material", productMaterialId);
            if (productDiscountPercent.trim()) form.append("discountPercent", String(discountNum));
            if (productDescription.trim()) form.append("description", productDescription.trim());
            if (productPolicy.trim()) form.append("policy", productPolicy.trim());
            for (const f of productImages) form.append("images", f);

            await productStoreService.addProduct(form);

            setProductSuccess("Thêm sản phẩm thành công");
            setStep(3);
        } catch {
            setProductError("Thêm sản phẩm thất bại");
        } finally {
            setProductSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="store-loading">
                <h2>Thiết lập cửa hàng</h2>
                <p>Đang tải...</p>
            </div>
        );
    }

    return (
        <div className="store-registration-page">
            <div className="store-registration">
                <div className="store-steps" style={{ ['--progress' as any]: step === 1 ? 0 : step === 2 ? 0.5 : 1 }}>
                    <div className={`store-step ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`}>
                        <div className="store-step-dot" aria-hidden="true" />
                        <div className="store-step-label">Thông tin Shop</div>
                    </div>
                    <div className={`store-step ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}>
                        <div className="store-step-dot" aria-hidden="true" />
                        <div className="store-step-label">Sản phẩm</div>
                    </div>
                    <div className={`store-step ${step === 3 ? 'active' : ''}`}>
                        <div className="store-step-dot" aria-hidden="true" />
                        <div className="store-step-label">Hoàn tất</div>
                    </div>
                </div>

                <h2>Thiết lập cửa hàng</h2>

                {error && <div className="alert error">{error}</div>}
                {success && <div className="alert success">{success}</div>}

                {step === 1 ? (
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="store-form">
                            <div className="form-group full">
                                <label>Avatar cửa hàng</label>
                                <div className="store-avatar-row">
                                    <div className="store-avatar-preview" aria-label="Xem trước avatar">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="avatar" />
                                        ) : (
                                            <div className="store-avatar-fallback">
                                                {(storeName || "S").trim().charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="store-avatar-actions">
                                        <input type="file" accept="image/*" onChange={handleAvatarChange} />
                                        {avatarFile ? (
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    setAvatarFile(null);
                                                    setAvatarPreview(avatarRemoteUrl);
                                                }}
                                                variant="secondary"
                                                size="sm"
                                            >
                                                Xóa ảnh đã chọn
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Tên cửa hàng</label>
                                <input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label>Email cửa hàng</label>
                                <input
                                    type="email"
                                    value={emailStore}
                                    onChange={(e) => setEmailStore(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label>Loại cửa hàng</label>
                                <select value={typeStoreId} onChange={(e) => setTypeStoreId(e.target.value)}>
                                    <option value="">-- Chọn loại --</option>
                                    {typeStores.map((t) => (
                                        <option key={t._id} value={t._id}>
                                            {t.typeName || t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group full">
                                <label>Địa chỉ</label>
                                <input
                                    placeholder="Số nhà, tên đường..."
                                    value={detailAddress}
                                    onChange={(e) => setDetailAddress(e.target.value)}
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
                                    <select
                                        value={provinceCode}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setProvinceCode(v ? Number(v) : "");
                                            setDistrictCode("");
                                            setWardCode("");
                                        }}
                                    >
                                        <option value="">-- Chọn Tỉnh/Thành --</option>
                                        {provinces.map(p => (
                                            <option key={p.code} value={p.code}>{p.name}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={districtCode}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setDistrictCode(v ? Number(v) : "");
                                            setWardCode("");
                                        }}
                                        disabled={provinceCode === ""}
                                    >
                                        <option value="">-- Chọn Quận/Huyện --</option>
                                        {districts.map(d => (
                                            <option key={d.code} value={d.code}>{d.name}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={wardCode}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setWardCode(v ? Number(v) : "");
                                        }}
                                        disabled={districtCode === ""}
                                        style={{ gridColumn: '1 / span 2' }}
                                    >
                                        <option value="">-- Chọn Phường/Xã --</option>
                                        {wards.map(w => (
                                            <option key={w.code} value={w.code}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ marginTop: 10, fontSize: 13, opacity: 0.8 }}>
                                    Địa chỉ hiện tại: {computedAddress || address || "(chưa có)"}
                                </div>
                            </div>

                            <div className="form-group full">
                                <label>Mô tả</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>

                            <div className="form-group full">
                                <label>Chính sách</label>
                                <textarea value={policy} onChange={(e) => setPolicy(e.target.value)} />
                            </div>
                            <div className="form-group full">
                                <label>Mạng xã hội</label>
                                <div className="store-social-grid">
                                    Facebook
                                    <input
                                        placeholder="https://facebook.com/..."
                                        value={facebook}
                                        onChange={(e) => setFacebook(e.target.value)}
                                    />
                                    Instagram
                                    <input
                                        placeholder="https://instagram.com/..."
                                        value={instagram}
                                        onChange={(e) => setInstagram(e.target.value)}
                                    />
                                    Twitter/X
                                    <input
                                        placeholder="https://x.com/..."
                                        value={twitter}
                                        onChange={(e) => setTwitter(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="store-actions">
                            <Button variant="submit" type="submit" disabled={saving}>
                                {saving ? "Đang lưu..." : "Lưu thông tin"}
                            </Button>
                            <Button variant="secondary" onClick={() => navigate("/login")} >
                                Bỏ qua
                            </Button>
                        </div>
                    </form>
                ) : step === 2 ? (
                    <form onSubmit={handleAddProduct}>
                        {productError && <div className="alert error">{productError}</div>}
                        {productSuccess && <div className="alert success">{productSuccess}</div>}

                        <div className="store-form">
                            <div className="form-group full">
                                <label>Tên sản phẩm</label>
                                <input value={productName} onChange={(e) => setProductName(e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label>Giá (VND)</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={productPrice}
                                    onChange={(e) => setProductPrice(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Số lượng tồn</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={productStock}
                                    onChange={(e) => setProductStock(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Danh mục</label>
                                <select value={productCategoryId} onChange={(e) => setProductCategoryId(e.target.value)}>
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map((c, idx) => {
                                        const id = String(c._id ?? c.id ?? idx);
                                        return (
                                            <option key={id} value={String(c._id ?? c.id ?? "")}>
                                                {String(c.name ?? "")}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Chất liệu</label>
                                <select value={productMaterialId} onChange={(e) => setProductMaterialId(e.target.value)}>
                                    <option value="">-- Chọn chất liệu --</option>
                                    {materials.map((m, idx) => {
                                        const id = String(m._id ?? m.id ?? idx);
                                        return (
                                            <option key={id} value={String(m._id ?? m.id ?? "")}>
                                                {String(m.name ?? "")}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Giảm giá (%)</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={productDiscountPercent}
                                    onChange={(e) => setProductDiscountPercent(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Ảnh sản phẩm</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        addProductImages(files);
                                        e.currentTarget.value = "";
                                    }}
                                />
                                <div className="store-image-hint">
                                    Đã chọn <b>{productImages.length}</b>/4 ảnh
                                </div>
                                {productImages.length > 0 && (
                                    <div className="store-image-grid" aria-label="Ảnh đã chọn">
                                        {productImages.map((f, idx) => (
                                            <div key={`${f.name}-${f.size}-${f.lastModified}`} className="store-image-card">
                                                <div className="store-image-thumb">
                                                    {productImagePreviews[idx] ? (
                                                        <img src={productImagePreviews[idx]} alt={f.name} />
                                                    ) : null}
                                                </div>
                                                <div className="store-image-name" title={f.name}>
                                                    {f.name}
                                                </div>
                                                <button
                                                    type="button"
                                                    className="cancel"
                                                    style={{ width: '100%' }}
                                                    onClick={() => {
                                                        setProductImages(prev => prev.filter((_, i) => i !== idx));
                                                    }}
                                                >
                                                    Xóa ảnh
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="form-group full">
                                <label>Mô tả sản phẩm</label>
                                <textarea value={productDescription} onChange={(e) => setProductDescription(e.target.value)} />
                            </div>

                            <div className="form-group full">
                                <label>Chính sách sản phẩm</label>
                                <textarea value={productPolicy} onChange={(e) => setProductPolicy(e.target.value)} />
                            </div>
                        </div>

                        <div className="store-actions">
                            <Button variant="submit" type="submit" disabled={productSaving}>
                                {productSaving ? "Đang thêm..." : "Thêm sản phẩm"}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setProductError(null);
                                    setProductSuccess(null);
                                    setStep(1);
                                }}
                            >
                                Quay lại
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="store-finish">
                        {String(storeStatus || "").toUpperCase() === 'PENDING' ? (
                            <>
                                <div className="store-finish-title">Đang chờ duyệt</div>
                                <div className="store-finish-desc">
                                    Thông tin cửa hàng đã được gửi. Tài khoản của bạn đang chờ admin duyệt trước khi có thể bán hàng.
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="store-finish-title">Hoàn tất</div>
                                <div className="store-finish-desc">
                                    Thông tin cửa hàng đã được lưu. Bạn có thể bắt đầu quản lý cửa hàng ngay bây giờ.
                                </div>
                            </>
                        )}
                        <div className="store-actions">
                            <button type="button" className="cancel" onClick={() => setStep(1)}>
                                Chỉnh sửa lại
                            </button>
                            <button type="button" className="cancel" onClick={() => navigate("/login")}>
                                Quay lại
                            </button>
                        </div>
                    </div>

                )}
            </div>
        </div >

    );
}
