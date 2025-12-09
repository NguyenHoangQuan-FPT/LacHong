import React, { useEffect, useState } from 'react';
import { storeService } from '../../services/store.service';
import '../../assets/styles/ProfileStore.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ProfileStore() {
    const [store, setStore] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // editable fields
    const [storeName, setStoreName] = useState('');
    const [emailStore, setEmailStore] = useState('');
    const [phone, setPhone] = useState('');
    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);

    const [selectedProvince, setSelectedProvince] = useState<any | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<any | null>(null);
    const [selectedWard, setSelectedWard] = useState<any | null>(null);

    // địa chỉ chi tiết: số nhà + tên đường
    const [addressDetail, setAddressDetail] = useState(''); const [policy, setPolicy] = useState('');
    const [facebook, setFacebook] = useState('');
    const [instagram, setInstagram] = useState('');
    const [twitter, setTwitter] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        fetch('https://provinces.open-api.vn/api/p/')
            .then(res => res.json())
            .then((data) => {
                setProvinces(data || []);
            })
            .catch(err => {
                console.error('Load provinces error', err);
            });
    }, []);

    const load = () => {
        setLoading(true);
        storeService.getStoreInfo()
            .then((res: any) => {
                const data = res?.data ?? res;
                const s = data?.store ?? data?.data ?? data;
                setStore(s);
                setStoreName(s?.storeName || '');
                setEmailStore(s?.emailStore || s?.email || '');
                setPhone(s?.phone || '');
                setAddressDetail(s?.address || '');
                setSelectedProvince(null);
                setSelectedDistrict(null);
                setSelectedWard(null);
                setDistricts([]);
                setWards([]); setPolicy(s?.policy || '');
                setFacebook(s?.socialMedia?.facebook || '');
                setInstagram(s?.socialMedia?.instagram || '');
                setTwitter(s?.socialMedia?.twitter || '');
                setAvatarPreview(s?.avatar || s?.avatarUrl || '');
            })
            .catch((err: any) => {
                console.error('Load store profile error', err);
                setError('Không tải được thông tin cửa hàng');
            })
            .finally(() => setLoading(false));
    };

    const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const p = provinces.find(x => String(x.code) === code) || null;
        setSelectedProvince(p);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts([]);
        setWards([]);

        if (!code) return;

        try {
            const res = await fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`);
            const data = await res.json();
            setDistricts(data?.districts || []);
        } catch (err) {
            console.error('Load districts error', err);
        }
    };

    const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const d = districts.find(x => String(x.code) === code) || null;
        setSelectedDistrict(d);
        setSelectedWard(null);
        setWards([]);

        if (!code) return;

        try {
            const res = await fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`);
            const data = await res.json();
            setWards(data?.wards || []);
        } catch (err) {
            console.error('Load wards error', err);
        }
    };

    const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const w = wards.find(x => String(x.code) === code) || null;
        setSelectedWard(w);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setAvatarFile(f);
        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(f);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const form = new FormData();
        form.append('storeName', storeName);
        form.append('emailStore', emailStore);
        form.append('phone', phone);
        const parts = [
            addressDetail?.trim(),
            selectedWard?.name,
            selectedDistrict?.name,
            selectedProvince?.name
        ].filter(Boolean);
        const fullAddress = parts.join(', ');
        form.append('address', fullAddress);
        form.append('policy', policy);
        form.append('facebook', facebook);
        form.append('instagram', instagram);
        form.append('twitter', twitter);
        if (avatarFile) form.append('avatar', avatarFile);

        try {
            const res = await storeService.updateProfile(form);
            toast.success(res?.data?.message || 'Cập nhật hồ sơ cửa hàng thành công');
            setTimeout(() => load(), 700);
        } catch (err: any) {
            console.error('Update profile error', err);
            const msg = err?.response?.data?.message || 'Cập nhật thất bại';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: 24 }}>Đang tải...</div>;
    if (error) return <div style={{ padding: 24, color: 'red' }}>{error}</div>;
    if (!store) return <div style={{ padding: 24 }}>Không có thông tin cửa hàng.</div>;

    return (
        <div className="profile-store-page">
            <form className="profile-card" onSubmit={handleSubmit} encType="multipart/form-data">
                <div style={{ display: 'flex', gap: 18 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                        <div className="profile-avatar" style={{ width: 120, height: 120, borderRadius: 12, overflow: 'hidden' }}>
                            {avatarPreview ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (store.storeName || 'S').charAt(0).toUpperCase()}
                        </div>
                        <input type="file" accept="image/*" onChange={handleAvatarChange} />
                    </div>

                    <div className="profile-body" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ flex: 1 }}>
                                <label className="form-label">Tên cửa hàng</label>
                                <input className="form-input" value={storeName} onChange={e => setStoreName(e.target.value)} />
                            </div>
                            <div style={{ width: 300 }}>
                                <label className="form-label">Email cửa hàng</label>
                                <input className="form-input" value={emailStore} onChange={e => setEmailStore(e.target.value)} />
                            </div>
                        </div>


                        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                            <div style={{ flex: 1 }}>
                                <label className="form-label">Địa chỉ chi tiết</label>
                                <input
                                    className="form-input"
                                    placeholder="Số nhà, tên đường..."
                                    value={addressDetail}
                                    onChange={e => setAddressDetail(e.target.value)}
                                />
                            </div>
                            <div style={{ width: 220 }}>
                                <label className="form-label">Số điện thoại</label>
                                <input
                                    className="form-input"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                            <div style={{ flex: 1 }}>
                                <label className="form-label">Tỉnh / Thành phố</label>
                                <select
                                    className="form-input"
                                    value={selectedProvince?.code || ''}
                                    onChange={handleProvinceChange}
                                >
                                    <option value="">-- Chọn tỉnh / thành phố --</option>
                                    {provinces.map((p) => (
                                        <option key={p.code} value={p.code}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ flex: 1 }}>
                                <label className="form-label">Quận / Huyện</label>
                                <select
                                    className="form-input"
                                    value={selectedDistrict?.code || ''}
                                    onChange={handleDistrictChange}
                                    disabled={!selectedProvince}
                                >
                                    <option value="">-- Chọn quận / huyện --</option>
                                    {districts.map((d) => (
                                        <option key={d.code} value={d.code}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ flex: 1 }}>
                                <label className="form-label">Phường / Xã</label>
                                <select
                                    className="form-input"
                                    value={selectedWard?.code || ''}
                                    onChange={handleWardChange}
                                    disabled={!selectedDistrict}
                                >
                                    <option value="">-- Chọn phường / xã --</option>
                                    {wards.map((w) => (
                                        <option key={w.code} value={w.code}>
                                            {w.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'block', gap: 12, marginTop: 12 }}>
                            <div style={{ width: 220 }}>
                                <label className="form-label">Số điện thoại</label>
                                <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} />
                            </div>
                        </div>

                        <div style={{ marginTop: 12 }}>
                            <label className="form-label">Mô tả / Chính sách</label>
                            <textarea className="form-textarea" rows={4} value={policy} onChange={e => setPolicy(e.target.value)} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12 }}>
                            <div>
                                <label className="form-label">Facebook</label>
                                <input className="form-input" value={facebook} onChange={e => setFacebook(e.target.value)} />
                            </div>
                            <div>
                                <label className="form-label">Instagram</label>
                                <input className="form-input" value={instagram} onChange={e => setInstagram(e.target.value)} />
                            </div>
                            <div>
                                <label className="form-label">Twitter</label>
                                <input className="form-input" value={twitter} onChange={e => setTwitter(e.target.value)} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'space-between', alignItems: 'center' }}>

                            <div style={{ display: 'flex', gap: 8 }}>
                                <button type="button" className="btn btn-secondary" onClick={() => load()}>Hủy</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </form >
            <ToastContainer position="top-right" autoClose={3000} />
        </div >
    );
}
