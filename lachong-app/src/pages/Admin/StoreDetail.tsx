import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { storeService } from "../../services/store.service";
import { typeStoreService } from "../../services/typeStore.service";
import "../../assets/styles/StoreDetail.css";
import Icon from "../../components/common/icons/Icon";
import Button from "../../components/common/buttons/Button";
import { toast, ToastContainer } from "react-toastify";

interface Store {
    _id: string;
    storeName: string;
    emailStore: string;
    status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
    [key: string]: any;
}

type TypeStore = {
    _id: string;
    typeName?: string;
    name?: string;
};

export default function StoreDetail() {
    const { id } = useParams<{ id: string }>();
    const [store, setStore] = useState<Store | null>(null);
    const [typeStoreName, setTypeStoreName] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        storeService.getStoreById(id)
            .then((res: any) => {
                setStore(res?.data?.store || null);
            })
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        const run = async () => {
            if (!store) return;

            // If backend already populated typeStoreId, use it directly.
            const populatedName =
                typeof store.typeStoreId === "object"
                    ? String(store.typeStoreId?.typeName || store.typeStoreId?.name || "")
                    : "";
            if (populatedName) {
                setTypeStoreName(populatedName);
                return;
            }

            const typeStoreId =
                typeof store.typeStoreId === "object" ? String(store.typeStoreId?._id || "") : String(store.typeStoreId || "");
            if (!typeStoreId) {
                setTypeStoreName("");
                return;
            }

            try {
                const res: any = await typeStoreService.getAllTypeStores();
                const list: TypeStore[] = res?.data?.typeStores || res?.data?.data || res?.data || [];
                const found = Array.isArray(list) ? list.find(t => String(t._id) === typeStoreId) : undefined;
                setTypeStoreName(String(found?.typeName || found?.name || ""));
            } catch {
                setTypeStoreName("");
            }
        };

        run();
    }, [store]);

    const handleStatusChange = async (status: 'PENDING' | 'ACTIVE' | 'INACTIVE') => {
        if (!store) return;
        setUpdating(true);
        try {
            await storeService.updateStatusStore(store._id, status);
            setStore({ ...store, status });
            toast.success("Cập nhật thành công");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="loading">Đang tải thông tin cửa hàng...</div>;
    if (!store) return <div className="loading">Không tìm thấy cửa hàng.</div>;

    return (
        <div className="store-detail-page">

            <div className="store-card">
                <Link to="/admin/stores" className="back-link">
                    <Icon name="back" /> Back
                </Link>
                <h2 className="page-title">Chi tiết cửa hàng</h2>
                <div className="store-main">
                    <div className="store-avatar">
                        {store.avatar ? (
                            <img src={store.avatar} alt="avatar" />
                        ) : (
                            <span>{store.storeName.charAt(0)}</span>
                        )}
                    </div>

                    <div className="store-info">
                        <h3>{store.storeName}</h3>
                        <p>{store.emailStore}</p>

                        <span className={`status ${store.status.toLowerCase()}`}>
                            {store.status === 'PENDING' ? 'Chờ duyệt' : store.status === 'ACTIVE' ? 'Hoạt động' : 'Ngưng hoạt động'}
                        </span>
                    </div>
                </div>

                <div className="store-section">
                    <Detail label="Địa chỉ" value={store.address} />
                    <Detail label="Điện thoại" value={store.phone} />
                    <Detail label="Mô tả" value={store.description} />
                    <Detail label="Chính sách" value={store.policy} />
                    <Detail label="Loại cửa hàng" value={typeStoreName || (typeof store.typeStoreId === 'object' ? store.typeStoreId?._id : store.typeStoreId)} />
                    <Detail
                        label="Ngày tạo"
                        value={store.createdAt && new Date(store.createdAt).toLocaleString()}
                    />

                </div>

                <div className="store-section">
                    <h4>Mạng xã hội</h4>
                    <ul className="social-list">
                        {store.socialMedia?.facebook && (
                            <li><a href={store.socialMedia.facebook} target="_blank">Facebook</a></li>
                        )}
                        {store.socialMedia?.instagram && (
                            <li><a href={store.socialMedia.instagram} target="_blank">Instagram</a></li>
                        )}
                        {store.socialMedia?.twitter && (
                            <li><a href={store.socialMedia.twitter} target="_blank">Twitter</a></li>
                        )}
                    </ul>
                </div>

                <div className="store-actions" style={{ display: 'flex', gap: 8 }}>
                    <span >
                        <Button variant="secondary" >
                            <Link to={`/admin/store/product/${store._id}`} style={{ color: "#000000" }}>Xem sản phẩm</Link>
                        </Button>
                    </span>
                    <span>
                        {store.status === 'PENDING' && (
                            <>
                                <button className="btn success" disabled={updating} onClick={() => handleStatusChange('ACTIVE')}>Duyệt</button>
                                <button className="btn danger" disabled={updating} onClick={() => handleStatusChange('INACTIVE')}>Từ chối</button>
                            </>
                        )}
                        {store.status === 'ACTIVE' && (
                            <button className="btn danger" disabled={updating} onClick={() => handleStatusChange('INACTIVE')}>Ngưng hoạt động</button>
                        )}
                        {store.status === 'INACTIVE' && (
                            <button className="btn success" disabled={updating} onClick={() => handleStatusChange('ACTIVE')}>Hoạt động</button>
                        )}
                    </span>
                </div>
            </div>
            <ToastContainer
                toastStyle={{ color: "white" }}
                position="top-right"
                autoClose={3000}
            />
        </div >
    );
}

function Detail({ label, value }: { label: string; value?: any }) {
    return (
        <div className="detail-row">
            <span>{label}</span>
            <b>{value || "—"}</b>
        </div>
    );
}
