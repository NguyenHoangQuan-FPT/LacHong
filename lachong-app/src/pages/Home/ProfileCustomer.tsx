import React, { useEffect, useState } from "react";
import customerService from "../../services/customer.service";
import "../../assets/styles/ProfileCustomer.css";

export default function ProfileCustomer() {
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

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
                // common fields
                name,
                fullName: name,
                email,
                phone,
                phoneNumber: phone,
                address: addressParts.join(", "),
            };
            const res = await customerService.updateProfileCustomer(payload);
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
