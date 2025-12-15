import { useEffect, useState } from "react";
import customerService from "../../services/customer.service";
import "../../assets/styles/ProfileCustomer.css";

function normalizeImageUrl(url?: string | null): string | null {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || "";
    const assetBase = apiBase.replace(/\/api\/v\d+\/?$/, "").replace(/\/$/, "");
    return assetBase ? assetBase + "/" + String(url).replace(/^\//, "") : url;
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

    // editable fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
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
        // reset image error when profile avatar or preview changes
        setAvatarLoadError(false);
    }, [avatarPreviewUrl, profile?.avatar]);

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

            const res = await customerService.updateProfileCustomer(formData);
            const data = res?.data ?? res;
            const c = data?.customer ?? data?.data ?? data;
            setProfile(c);
            // reflect changes in local form state if backend normalizes fields
            setName(c?.name || c?.fullName || name);
            setEmail(c?.email || email);
            setPhone(c?.phone || c?.phoneNumber || phone);
            setAddress(c?.address || addressParts.join(", ") || address);
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
                <h1>Thông tin khách hàng</h1>
                <p className="subtitle">Cập nhật hồ sơ của bạn</p>

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
                                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                                style={{ display: "none" }}
                                disabled={avatarSaving}
                            />
                        </label>

                        <button
                            type="button"
                            className="btn primary"
                            onClick={handleUpdateAvatar}
                            disabled={avatarSaving || !avatarFile}
                        >
                            {avatarSaving ? "Đang cập nhật..." : "Cập nhật avatar"}
                        </button>
                    </div>
                </div>

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

                </div>

                <div className="actions">
                    <button className="btn primary" onClick={handleSave} disabled={saving}>
                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </div>
        </div>
    );
}
