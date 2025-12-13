import React, { useEffect, useState } from "react";
import "../../assets/styles/Address.css";
import { addressService } from "../../services/address.service";

interface Address {
    id?: string;
    _id?: string;
    address: string;
    isDefault?: boolean;
}

export default function Address() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [detail, setDetail] = useState("");
    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<any | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<any | null>(null);
    const [selectedWard, setSelectedWard] = useState<any | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

    // Load addresses
    useEffect(() => {
        loadAddresses();
    }, []);

    // Load provinces on mount
    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/p/")
            .then((res) => res.json())
            .then((data) => {
                setProvinces(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                console.error("Load provinces error", err);
            });
    }, []);

    // When province changes, load districts
    useEffect(() => {
        const code = selectedProvince?.code;
        if (!code) {
            setDistricts([]);
            setSelectedDistrict(null);
            return;
        }
        fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`)
            .then((res) => res.json())
            .then((data) => {
                const d = data?.districts || [];
                setDistricts(Array.isArray(d) ? d : []);
                setSelectedDistrict(null);
                setWards([]);
                setSelectedWard(null);
            })
            .catch((err) => {
                console.error("Load districts error", err);
            });
    }, [selectedProvince]);

    useEffect(() => {
        const code = selectedDistrict?.code;
        if (!code) {
            setWards([]);
            setSelectedWard(null);
            return;
        }
        fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`)
            .then((res) => res.json())
            .then((data) => {
                const w = data?.wards || [];
                setWards(Array.isArray(w) ? w : []);
                setSelectedWard(null);
            })
            .catch((err) => {
                console.error("Load wards error", err);
            });
    }, [selectedDistrict]);

    const loadAddresses = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await addressService.getAddresses();
            console.log("Address response:", res);
            const data = res?.data ?? res;
            console.log("Extracted data:", data);
            const list = data?.addresses ?? data?.data ?? data;
            console.log("Final list:", list);
            setAddresses(Array.isArray(list) ? list : []);
        } catch (err: any) {
            console.error("Load addresses error:", err);
            setError(err?.response?.data?.message || err?.message || "Không tải được danh sách địa chỉ");
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        resetForm();
        setEditingId(null);
        setShowForm(true);
    };

    const handleEdit = (addr: Address) => {
        // Parse address string (format: "detail, ward, district, province")
        const parts = addr.address.split(", ");
        if (parts.length >= 4) {
            setDetail(parts[0]);
            // Try to find and select province/district/ward from the address string
            const provinceName = parts[parts.length - 1];
            const districtName = parts[parts.length - 2];
            const wardName = parts[parts.length - 3];

            const prov = provinces.find((p) => p.name === provinceName);
            setSelectedProvince(prov || null);

            if (prov) {
                fetch(`https://provinces.open-api.vn/api/p/${prov.code}?depth=2`)
                    .then((res) => res.json())
                    .then((data) => {
                        const d = data?.districts || [];
                        setDistricts(Array.isArray(d) ? d : []);
                        const dist = d.find((x: any) => x.name === districtName);
                        setSelectedDistrict(dist || null);

                        if (dist) {
                            fetch(`https://provinces.open-api.vn/api/d/${dist.code}?depth=2`)
                                .then((res) => res.json())
                                .then((data) => {
                                    const w = data?.wards || [];
                                    setWards(Array.isArray(w) ? w : []);
                                    const wrd = w.find((x: any) => x.name === wardName);
                                    setSelectedWard(wrd || null);
                                });
                        }
                    });
            }
        } else {
            // If can't parse, just set the whole thing as detail
            setDetail(addr.address);
        }

        setEditingId(addr.id || addr._id || null);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

        try {
            await addressService.deleteAddress(id);
            await loadAddresses();
        } catch (err: any) {
            alert(err?.response?.data?.message || "Xóa địa chỉ thất bại");
        }
    };

    const handleSubmit = async () => {
        if (!detail || !selectedProvince || !selectedDistrict || !selectedWard) {
            alert("Vui lòng điền đầy đủ thông tin địa chỉ");
            return;
        }

        setSubmitting(true);
        try {
            // Compose full address string
            const fullAddress = [
                detail,
                selectedWard.name,
                selectedDistrict.name,
                selectedProvince.name
            ].filter(Boolean).join(", ");

            const payload = {
                address: fullAddress
            };

            if (editingId) {
                await addressService.updateAddress(editingId, payload);
            } else {
                await addressService.addAddress(payload);
            }

            await loadAddresses();
            setShowForm(false);
            resetForm();
        } catch (err: any) {
            console.error("Save address error:", err);
            alert(err?.response?.data?.message || "Lưu địa chỉ thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setDetail("");
        setSelectedProvince(null);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts([]);
        setWards([]);
    };

    const handleCancel = () => {
        setShowForm(false);
        resetForm();
        setEditingId(null);
    };

    const handleSetDefault = async (id: string) => {
        if (settingDefaultId) return;
        setSettingDefaultId(id);
        try {
            await addressService.setDefaultAddress(id);
            await loadAddresses();
        } catch (err: any) {
            alert(err?.response?.data?.message || "Cập nhật địa chỉ mặc định thất bại");
        } finally {
            setSettingDefaultId(null);
        }
    };

    if (loading && addresses.length === 0) {
        return (
            <div className="address-page">
                <div className="status">Đang tải danh sách địa chỉ...</div>
            </div>
        );
    }

    return (
        <div className="address-page">
            <div className="address-header">
                <h1>Địa chỉ của tôi</h1>
                <button className="btn-add" onClick={handleAddNew}>
                    + Thêm địa chỉ mới
                </button>
            </div>

            {error && <div className="status error">{error}</div>}

            {/* Address List */}
            {!showForm && (
                <div className="address-list">
                    {addresses.length === 0 ? (
                        <div className="empty-state">
                            <p>Chưa có địa chỉ nào</p>
                            <button className="btn-primary" onClick={handleAddNew}>
                                Thêm địa chỉ đầu tiên
                            </button>
                        </div>
                    ) : (
                        addresses.map((addr) => {
                            const id = addr.id || addr._id || "";
                            return (
                                <div key={id} className="address-card">
                                    <div className="address-info">
                                        <div className="address-full">{addr.address}</div>
                                        {addr.isDefault && <span className="badge-default">Mặc định</span>}
                                    </div>
                                    <div className="address-actions">
                                        {!addr.isDefault && (
                                            <button
                                                className="btn-default"
                                                onClick={() => handleSetDefault(id)}
                                                disabled={settingDefaultId === id}
                                            >
                                                {settingDefaultId === id ? "Đang đặt..." : "Đặt mặc định"}
                                            </button>
                                        )}
                                        <button className="btn-edit" onClick={() => handleEdit(addr)}>
                                            Sửa
                                        </button>
                                        <button className="btn-delete" onClick={() => handleDelete(id)}>
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <div className="address-form-card">
                    <h2>{editingId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}</h2>

                    <div className="form-grid">
                        <div className="form-item">
                            <label>Tỉnh/Thành phố</label>
                            <select
                                value={selectedProvince?.code || ""}
                                onChange={(e) => {
                                    const code = e.target.value;
                                    const p = provinces.find((x) => String(x.code) === String(code));
                                    setSelectedProvince(p || null);
                                }}
                            >
                                <option value="">-- Chọn tỉnh/thành --</option>
                                {provinces.map((p) => (
                                    <option key={p.code} value={p.code}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-item">
                            <label>Quận/Huyện</label>
                            <select
                                value={selectedDistrict?.code || ""}
                                onChange={(e) => {
                                    const code = e.target.value;
                                    const d = districts.find((x) => String(x.code) === String(code));
                                    setSelectedDistrict(d || null);
                                }}
                                disabled={!selectedProvince}
                            >
                                <option value="">-- Chọn quận/huyện --</option>
                                {districts.map((d) => (
                                    <option key={d.code} value={d.code}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-item">
                            <label>Phường/Xã</label>
                            <select
                                value={selectedWard?.code || ""}
                                onChange={(e) => {
                                    const code = e.target.value;
                                    const w = wards.find((x) => String(x.code) === String(code));
                                    setSelectedWard(w || null);
                                }}
                                disabled={!selectedDistrict}
                            >
                                <option value="">-- Chọn phường/xã --</option>
                                {wards.map((w) => (
                                    <option key={w.code} value={w.code}>
                                        {w.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-item span-2">
                            <label>Địa chỉ chi tiết</label>
                            <input
                                value={detail}
                                onChange={(e) => setDetail(e.target.value)}
                                placeholder="Số nhà, tên đường"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button className="btn-cancel" onClick={handleCancel}>
                            Hủy
                        </button>
                        <button className="btn-submit" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm mới"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
