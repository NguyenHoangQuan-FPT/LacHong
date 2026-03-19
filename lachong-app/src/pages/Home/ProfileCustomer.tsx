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
import { toast } from "react-toastify";

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

function firstInitial(value?: string | null): string {
    const trimmed = String(value || "").trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

export default function ProfileCustomer() {
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
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
    const [dob, setDob] = useState("");

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
        setAvatarLoadError(false);
    }, [avatarPreviewUrl, profile?.avatar]);

    const shouldShowCropper = useMemo(() => {
        return Boolean(pendingAvatarUrl);
    }, [pendingAvatarUrl]);

    const avatarInitial = useMemo(() => {
        const displayName = name || profile?.name || profile?.fullName || profile?.email || "";
        return firstInitial(displayName);
    }, [name, profile]);

    const onCropImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const image = e.currentTarget;
        imgRef.current = image;
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

    const handleSave = async () => {
        if (saving) return;
        setSaving(true);
        setError(null);
        try {
            const payload = {
                fullName: name,
                phone,
            };

            const formData = new FormData();
            formData.append("fullName", payload.fullName || "");
            formData.append("phone", payload.phone || "");
            formData.append("dob", dob || "");
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            const res = await customerService.updateProfileCustomer(formData);
            const data = res?.data ?? res;
            const c = data?.customer ?? data?.data ?? data;
            setProfile(c);
            toast.success(avatarFile ? "Cập nhật thông tin & avatar thành công" : "Cập nhật thông tin thành công");
            setName(c?.name || c?.fullName || name);
            setEmail(c?.email || email);
            setPhone(c?.phone || c?.phoneNumber || phone);
            setDob(c?.dob ? toDateInputValue(c.dob) : dob);

            if (avatarFile) {
                setAvatarFile(null);
                setAvatarPreviewUrl(null);
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Lưu thay đổi thất bại";
            setError(msg);
            toast.error(msg);
        } finally {
            setSaving(false);
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
                <h3 >Thông tin của tôi</h3>
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
                            <div className="avatar-fallback" aria-label="Avatar placeholder">
                                {avatarInitial}
                            </div>
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
                                disabled={saving}
                            />
                        </label>
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
                                    disabled={saving}
                                >
                                    Hủy
                                </button>
                                <Button
                                    variant="submit"
                                    onClick={handleApplyCrop}
                                    disabled={saving || !completedCrop?.width || !completedCrop?.height}
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
            </div>
            <div className="submit-profile">
                <Button variant="submit" onClick={handleSave} disabled={saving}>
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
            </div>
        </div>
    );
}
