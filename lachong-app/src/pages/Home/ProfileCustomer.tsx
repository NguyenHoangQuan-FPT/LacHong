import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ReactCrop, {
    type Crop,
    type PixelCrop,
    centerCrop,
    makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import customerService from "../../services/customer.service";
import "../../assets/styles/ProfileCustomer.css";
import Button from "../../components/common/buttons/Button";

function normalizeImageUrl(url?: string | null): string | null {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || "";
    const assetBase = apiBase.replace(/\/api\/v\d+\/?$/, "").replace(/\/$/, "");
    return assetBase ? assetBase + "/" + String(url).replace(/^\//, "") : url;
}

function toDateInputValue(value?: string | Date | null): string {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    // Convert to local date (yyyy-mm-dd) without timezone shifting
    const tzOffsetMs = d.getTimezoneOffset() * 60_000;
    return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 10);
}

export default function ProfileCustomer() {
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
    const [avatarSaving, setAvatarSaving] = useState(false);
    const [avatarLoadError, setAvatarLoadError] = useState(false);

    const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
    const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

    // editable fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [dob, setDob] = useState("");
    // provinces API state
    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<any | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<any | null>(null);
    const [selectedWard, setSelectedWard] = useState<any | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        customerService
            .getProfileCustomer()
            .then((res: any) => {
                const data = res?.data ?? res;
                const c = data?.customer ?? data?.data ?? data;
                setProfile(c);
                setName(c?.name || c?.fullName || "");
                setEmail(c?.email || "");
                setPhone(c?.phone || c?.phoneNumber || "");
                setAddress(c?.address || "");
                setDob(toDateInputValue(c?.dob));
            })
            .catch((err: any) => {
                setError(
                    err?.response?.data?.message || "Không tải được thông tin khách hàng"
                );
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!avatarFile) {
            setAvatarPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(avatarFile);
        setAvatarPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [avatarFile]);

    useEffect(() => {
        if (!pendingAvatarFile) {
            setPendingAvatarUrl(null);
            return;
        }
        const url = URL.createObjectURL(pendingAvatarFile);
        setPendingAvatarUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [pendingAvatarFile]);

    useEffect(() => {
        // reset image error when profile avatar or preview changes
        setAvatarLoadError(false);
    }, [avatarPreviewUrl, profile?.avatar]);

    const shouldShowCropper = useMemo(() => {
        return Boolean(pendingAvatarUrl);
    }, [pendingAvatarUrl]);

    const onCropImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const image = e.currentTarget;
        imgRef.current = image;
        // Center a square crop at 90% of the smallest dimension
        const { width, height } = image;
        const cropWidthPercent = 90;
        const initial = centerCrop(
            makeAspectCrop(
                { unit: "%", width: cropWidthPercent },
                1,
                width,
                height
            ),
            width,
            height
        );
        setCrop(initial);
    };

    const getCroppedBlob = async (image: HTMLImageElement, pixelCrop: PixelCrop) => {
        const canvas = document.createElement("canvas");
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const cropWidth = Math.floor(pixelCrop.width * scaleX);
        const cropHeight = Math.floor(pixelCrop.height * scaleY);
        canvas.width = cropWidth;
        canvas.height = cropHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context không khả dụng");

        ctx.drawImage(
            image,
            Math.floor(pixelCrop.x * scaleX),
            Math.floor(pixelCrop.y * scaleY),
            cropWidth,
            cropHeight,
            0,
            0,
            cropWidth,
            cropHeight
        );

        return await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error("Tạo ảnh crop thất bại"));
                        return;
                    }
                    resolve(blob);
                },
                "image/jpeg",
                0.92
            );
        });
    };

    const handleApplyCrop = async () => {
        if (!pendingAvatarFile || !imgRef.current || !completedCrop) return;
        try {
            const blob = await getCroppedBlob(imgRef.current, completedCrop);
            const croppedFile = new File([blob], "avatar.jpg", { type: blob.type });
            setAvatarFile(croppedFile);
            setPendingAvatarFile(null);
            setCrop(undefined);
            setCompletedCrop(undefined);
        } catch (err: any) {
            setError(err?.message || "Không thể cắt ảnh");
        }
    };

    const handleCancelCrop = () => {
        setPendingAvatarFile(null);
        setCrop(undefined);
        setCompletedCrop(undefined);
    };

    // load provinces on mount
    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/p/")
            .then(res => res.json())
            .then(data => {
                setProvinces(Array.isArray(data) ? data : []);
            })
            .catch(err => {
                console.error("Load provinces error", err);
            });
    }, []);

    // when province changes, load districts
    useEffect(() => {
        const code = selectedProvince?.code;
        if (!code) {
            setDistricts([]);
            setSelectedDistrict(null);
            return;
        }
        fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`)
            .then(res => res.json())
            .then(data => {
                const d = data?.districts || [];
                setDistricts(Array.isArray(d) ? d : []);
                setSelectedDistrict(null);
                setWards([]);
                setSelectedWard(null);
            })
            .catch(err => {
                console.error("Load districts error", err);
            });
    }, [selectedProvince]);

    // when district changes, load wards
    useEffect(() => {
        const code = selectedDistrict?.code;
        if (!code) {
            setWards([]);
            setSelectedWard(null);
            return;
        }
        fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`)
            .then(res => res.json())
            .then(data => {
                const w = data?.wards || [];
                setWards(Array.isArray(w) ? w : []);
                setSelectedWard(null);
            })
            .catch(err => {
                console.error("Load wards error", err);
            });
    }, [selectedDistrict]);

    const handleSave = async () => {
        if (saving) return;
        setSaving(true);
        setError(null);
        try {
            // compose address from selections + detail
            const addressParts = [
                address?.trim(),
                selectedWard?.name,
                selectedDistrict?.name,
                selectedProvince?.name,
            ].filter(Boolean);

            const payload = {
                fullName: name,
                phone,
                address: addressParts.join(", "),
            };

            const formData = new FormData();
            formData.append("fullName", payload.fullName || "");
            formData.append("phone", payload.phone || "");
            formData.append("address", payload.address || "");
            formData.append("dob", dob || "");

            const res = await customerService.updateProfileCustomer(formData);
            const data = res?.data ?? res;
            const c = data?.customer ?? data?.data ?? data;
            setProfile(c);
            // reflect changes in local form state if backend normalizes fields
            setName(c?.name || c?.fullName || name);
            setEmail(c?.email || email);
            setPhone(c?.phone || c?.phoneNumber || phone);
            setAddress(c?.address || addressParts.join(", ") || address);
            setDob(c?.dob ? toDateInputValue(c.dob) : dob);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Lưu thay đổi thất bại");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateAvatar = async () => {
        if (!avatarFile || avatarSaving) return;
        setAvatarSaving(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("avatar", avatarFile);
            const res = await customerService.updateProfileCustomer(formData);
            const data = res?.data ?? res;
            const c = data?.customer ?? data?.data ?? data;
            setProfile(c);
            setAvatarFile(null);
            setAvatarPreviewUrl(null);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Cập nhật avatar thất bại");
        } finally {
            setAvatarSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-customer-page">
                <div className="status">Đang tải thông tin...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-customer-page">
                <div className="status error">{error}</div>
            </div>
        );
    }

    return (
        <div className="profile-customer-page">
            <div className="profile-card">
                <h1>Thông tin của tôi</h1>
                <p className="subtitle">Cập nhật hồ sơ của tôi</p>

                <div className="avatar-section">
                    <div className="avatar-preview">
                        {!avatarLoadError && (avatarPreviewUrl || profile?.avatar) ? (
                            <img
                                className="avatar-img"
                                src={avatarPreviewUrl || normalizeImageUrl(profile?.avatar) || ""}
                                alt="avatar"
                                onError={() => setAvatarLoadError(true)}
                            />
                        ) : (
                            <div className="avatar-fallback" />
                        )}
                    </div>

                    <div className="avatar-actions">
                        <label className="btn secondary" style={{ margin: 0 }}>
                            Chọn ảnh
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    setError(null);
                                    setAvatarFile(null);
                                    setPendingAvatarFile(file);
                                }}
                                style={{ display: "none" }}
                                disabled={avatarSaving}
                            />
                        </label>

                        <Button
                            variant="add"
                            onClick={handleUpdateAvatar}
                            disabled={avatarSaving || !avatarFile}
                        >
                            {avatarSaving ? "Đang cập nhật..." : "Cập nhật avatar"}
                        </Button>
                    </div>
                </div>

                {shouldShowCropper && createPortal(
                    <div className="avatar-crop-modal-overlay">
                        <div className="avatar-crop-modal">
                            <div className="avatar-crop-title">Cắt ảnh avatar</div>
                            <div className="avatar-crop-body">
                                <ReactCrop
                                    crop={crop}
                                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={1}
                                    circularCrop
                                    keepSelection
                                >
                                    <img
                                        src={pendingAvatarUrl || ""}
                                        alt="Crop avatar"
                                        onLoad={onCropImageLoad}
                                        className="avatar-crop-image"
                                    />
                                </ReactCrop>
                            </div>
                            <div className="avatar-crop-actions">
                                <button
                                    type="button"
                                    className="btn secondary"
                                    onClick={handleCancelCrop}
                                    disabled={avatarSaving}
                                >
                                    Hủy
                                </button>
                                <Button
                                    variant="submit"
                                    onClick={handleApplyCrop}
                                    disabled={avatarSaving || !completedCrop?.width || !completedCrop?.height}
                                >
                                    Áp dụng cắt
                                </Button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                <div className="form-grid">
                    <div className="form-item">
                        <label>Họ và tên</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nhập họ tên"
                        />
                    </div>

                    <div className="form-item">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Nhập email"
                            readOnly
                            style={{ background: "#d3d3d3", color: "black" }}
                        />
                    </div>
                    <div className="form-item">
                        <label>Số điện thoại</label>
                        <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Nhập số điện thoại"
                        />
                    </div>
                    <div className="form-item">
                        <label>Ngày sinh</label>
                        <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            placeholder="Nhập ngày sinh"
                            max={toDateInputValue(new Date())}
                        />
                    </div>
                </div>

                <Button variant="submit" onClick={handleSave} disabled={saving}>
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
            </div>
        </div >
    );
}
