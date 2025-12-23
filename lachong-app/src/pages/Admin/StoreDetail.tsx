import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { storeService } from "../../services/store.service";
import "../../assets/styles/StoreDetail.css";
import Icon from "../../assets/icons/Icon";

interface Store {
    _id: string;
    storeName: string;
    emailStore: string;
    status: boolean;
    [key: string]: any;
}

export default function StoreDetail() {
    const { id } = useParams<{ id: string }>();
    const [store, setStore] = useState<Store | null>(null);
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

    const handleStatusChange = async (status: boolean) => {
        if (!store) return;
        setUpdating(true);
        try {
            await storeService.updateStatusStore(store._id, status);
            setStore({ ...store, status });
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

                        <span className={`status ${store.status ? "active" : "locked"}`}>
                            {store.status ? "Hoạt động" : "Ngưng hoạt động"}
                        </span>
                    </div>
                </div>

                <div className="store-section">
                    <Detail label="Địa chỉ" value={store.address} />
                    <Detail label="Điện thoại" value={store.phone} />
                    <Detail label="Chính sách" value={store.policy} />
                    <Detail label="Loại cửa hàng" value={store.typeStoreId} />
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

                <div className="store-actions">
                    <button
                        className={`btn ${store.status ? "danger" : "success"}`}
                        disabled={updating}
                        onClick={() => handleStatusChange(!store.status)}
                    >
                        {store.status ? "Ngưng hoạt động" : "Hoạt động"}
                    </button>
                </div>
            </div>
        </div>
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
