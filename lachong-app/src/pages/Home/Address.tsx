import { useEffect, useState } from "react";
import "../../assets/styles/Address.css";
import { addressService } from "../../services/address.service";
import Button from "../../components/common/buttons/Button";
import { toast } from "react-toastify";

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
    const [wards, setWards] = useState<any[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<any | null>(null);
    const [selectedWard, setSelectedWard] = useState<any | null>(null);
    const [pendingWardName, setPendingWardName] = useState<string | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

    const PROVINCE_API_BASE = "https://provinces.open-api.vn/api/v2";

    const extractArray = (data: any): any[] => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data?.results)) return data.results;
        if (Array.isArray(data?.data?.results)) return data.data.results;
        return [];
    };

    const findFirstArray = (obj: any, depth = 0): any[] => {
        if (!obj || depth > 3) return [];
        if (Array.isArray(obj)) return obj;
        if (typeof obj !== "object") return [];
        for (const val of Object.values(obj)) {
            const found = findFirstArray(val, depth + 1);
            if (found.length) return found;
        }
        return [];
    };

    const getCode = (item: any): string => {
        if (!item) return "";
        return String(
            item.code ??
            item.province_code ??
            item.district_code ??
            item.ward_code ??
            ""
        );
    };

    const getName = (item: any): string => {
        if (!item) return "";
        return (
            item.name ??
            item.full_name ??
            item.name_en ??
            item.name_with_type ??
            ""
        );
    };

    // Load addresses
    useEffect(() => {
        loadAddresses();
    }, []);

    // Load provinces on mount
    useEffect(() => {
        fetch(`${PROVINCE_API_BASE}/p/`)
            .then((res) => res.json())
            .then((data) => {
                const list = extractArray(data) || findFirstArray(data);
                setProvinces(list);
            })
            .catch((err) => {
                console.error("Load provinces error", err);
            });
    }, []);

    // Load wards when province changes
    useEffect(() => {
        const code = getCode(selectedProvince);
        if (!code) {
            setWards([]);
            setSelectedWard(null);
            return;
        }

        const matchesProvince = (w: any, provinceCode: string) => {
            const wardProvince = getCode({ code: w?.province_code ?? w?.p ?? w?.p_code ?? "" });
            return wardProvince === provinceCode;
        };

        const tryLoad = async () => {
            try {
                const res = await fetch(`${PROVINCE_API_BASE}/p/${code}?depth=2`);
                const data = await res.json();
                const districts =
                    extractArray(data?.districts) ||
                    extractArray(data?.data?.districts) ||
                    [];

                let flattenedWards = Array.isArray(districts)
                    ? districts.flatMap((d: any) => extractArray(d?.wards) || [])
                    : [];

                // Fallback: direct ward-by-province endpoint if flattening yields nothing
                if (!flattenedWards.length) {
                    try {
                        const resWard = await fetch(`${PROVINCE_API_BASE}/w/?p=${code}`);
                        const wardData = await resWard.json();
                        flattenedWards = extractArray(wardData) || findFirstArray(wardData);

                        if (!flattenedWards.length) {
                            const resWardAlt = await fetch(`${PROVINCE_API_BASE}/w/?province_code=${code}`);
                            const wardDataAlt = await resWardAlt.json();
                            flattenedWards = extractArray(wardDataAlt) || findFirstArray(wardDataAlt);
                        }
                    } catch (innerErr) {
                        console.error("Fallback wards fetch error", innerErr);
                    }
                }

                const scopedWards = flattenedWards.filter((w: any) => matchesProvince(w, code));

                setWards(scopedWards);
                setSelectedWard(null);
            } catch (err) {
                console.error("Load wards error", err);
                setWards([]);
                setSelectedWard(null);
            }
        };

        tryLoad();
    }, [selectedProvince]);

    const loadAddresses = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await addressService.getAddresses();
            const data = res?.data ?? res;
            const list = data?.addresses ?? data?.data ?? data;
            setAddresses(Array.isArray(list) ? list : []);
        } catch (err: any) {
            console.error("Load addresses error", err);
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
        // Parse address string (format: "detail, ward, province")
        const parts = addr.address.split(", ");
        if (parts.length >= 3) {
            setDetail(parts[0]);
            const provinceName = parts[parts.length - 1];
            const wardName = parts[parts.length - 2];

            const prov = provinces.find((p) => getName(p) === provinceName || getName(p) === provinceName?.trim());
            setSelectedProvince(prov || null);
            setPendingWardName(wardName || null);
        } else {
            setDetail(addr.address);
        }

        setEditingId(addr.id || addr._id || null);
        setShowForm(true);
    };

    useEffect(() => {
        if (!pendingWardName || wards.length === 0) return;
        const target = pendingWardName.trim().toLowerCase();
        const wrd = wards.find((x: any) => getName(x).trim().toLowerCase() === target);
        setSelectedWard(wrd || null);
        setPendingWardName(null);
    }, [wards, pendingWardName]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

        try {
            await addressService.deleteAddress(id);
            await loadAddresses();
            toast.success("Xóa địa chỉ thành công");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Xóa địa chỉ thất bại");
        }
    };

    const handleSubmit = async () => {
        if (!detail || !selectedProvince || !selectedWard) {
            toast.warn("Vui lòng điền đầy đủ thông tin địa chỉ");
            return;
        }

        setSubmitting(true);
        try {
            const fullAddress = [
                detail,
                getName(selectedWard),
                getName(selectedProvince)
            ].filter(Boolean).join(", ");

            const payload = {
                address: fullAddress
            };

            if (editingId) {
                await addressService.updateAddress(editingId, payload);
                toast.success("Cập nhật địa chỉ thành công");
            } else {
                await addressService.addAddress(payload);
                toast.success("Thêm địa chỉ thành công");
            }

            await loadAddresses();
            setShowForm(false);
            resetForm();
        } catch (err: any) {
            console.error("Save address error", err);
            toast.error(err?.response?.data?.message || "Lưu địa chỉ thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setDetail("");
        setSelectedProvince(null);
        setSelectedWard(null);
        setWards([]);
        setPendingWardName(null);
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
            toast.success("Cập nhật địa chỉ thành công");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Cập nhật địa chỉ mặc định thất bại");
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
                <h3>Địa chỉ của tôi</h3>
                <button className="add-address-btn" onClick={handleAddNew} >
                    <span>+ Thêm địa chỉ</span>
                </button>
            </div>
            {error && <div className="status error">{error}</div>}
            {
                !showForm && (
                    <div className="address-list">
                        {addresses.length === 0 ? (
                            <div className="empty-state">
                                <p>Chưa có địa chỉ nào</p>
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
                )
            }

            {
                showForm && (
                    <div
                        className="address-modal-overlay"
                        onClick={handleCancel}
                    >
                        <div
                            className="address-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="address-form-card">
                                <div className="address-modal-header">
                                    <h2>{editingId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}</h2>
                                    <button
                                        className="address-modal-close"
                                        onClick={handleCancel}
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="form-grid">
                                    <div className="form-item">
                                        <label>Tỉnh/Thành phố</label>
                                        <select
                                            value={getCode(selectedProvince)}
                                            onChange={(e) => {
                                                const code = e.target.value;
                                                const p = provinces.find(
                                                    (x) => getCode(x) === code
                                                );
                                                setSelectedProvince(p || null);
                                            }}
                                        >
                                            <option value="">-- Chọn tỉnh/thành --</option>
                                            {provinces.map((p) => (
                                                <option key={getCode(p)} value={getCode(p)}>
                                                    {getName(p)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-item">
                                        <label>Phường/Xã</label>
                                        <select
                                            value={getCode(selectedWard)}
                                            onChange={(e) => {
                                                const code = e.target.value;
                                                const w = wards.find(
                                                    (x) => getCode(x) === code
                                                );
                                                setSelectedWard(w || null);
                                            }}
                                            disabled={!selectedProvince}
                                        >
                                            <option value="">-- Chọn phường/xã --</option>
                                            {wards.map((w) => (
                                                <option key={getCode(w)} value={getCode(w)}>
                                                    {getName(w)}
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
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        variant={editingId ? "submit" : "submit"}
                                    >
                                        {submitting
                                            ? "Đang lưu..."
                                            : editingId
                                                ? "Cập nhật"
                                                : "Thêm mới"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}