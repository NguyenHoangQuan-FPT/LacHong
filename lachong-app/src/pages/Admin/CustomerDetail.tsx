import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import customerService from "../../services/customer.service";
import "../../assets/styles/StoreDetail.css";
import Icon from "../../components/common/icons/Icon";
import { toast, ToastContainer } from "react-toastify";

interface Customer {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    addresses?: string[];
    address?: string;
    status: boolean;
    dob: string;
    avatar?: string;
    createdAt: string;
    [key: string]: any;
}

export default function CustomerDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        customerService.getCustomerById(id)
            .then((res: any) => {
                setCustomer(res?.data?.customer || null);
                setError("");
            })
            .catch(() => setError("Không tìm thấy khách hàng."))
            .finally(() => setLoading(false));
    }, [id]);

    const handleStatusChange = async (status: boolean) => {
        if (!customer) return;
        setUpdating(true);
        try {
            await customerService.updateStatusCustomer(customer._id, status);
            const res = await customerService.getCustomerById(customer._id);
            setCustomer(res?.data?.customer || { ...customer, status });
            toast.success("Cập nhật thành công");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="loading">Đang tải thông tin khách hàng...</div>;
    if (error) return <div className="loading">{error}</div>;
    if (!customer) return <div className="loading">Không tìm thấy khách hàng.</div>;

    return (
        <div className="store-detail-page">
            <div className="store-card">
                <Link to="/admin/customers" className="back-link">
                    <Icon name="back" /> Back
                </Link>
                <h2 className="page-title">Chi tiết khách hàng</h2>
                <div className="store-main">
                    <div className="store-avatar">
                        <img src={customer.avatar} alt="avatar" />
                    </div>
                    <div className="store-info">
                        <h3>{customer.fullName}</h3>
                        <span className={`status ${customer.status ? "active" : "locked"}`}>
                            {customer.status ? "Hoạt động" : "Khoá"}
                        </span>
                    </div>
                </div>
                <div className="store-section">
                    <Detail label="Số điện thoại" value={customer.phone} />
                    <Detail label="Email" value={customer.email} />
                    <Detail label="Ngày sinh" value={formatDate(customer.dob)} />
                    {Array.isArray(customer.addresses) && customer.addresses.length > 0 ? (
                        <div className="detail-row">
                            <span>Địa chỉ</span>
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {customer.addresses.map((a: any, i: number) => (
                                    <div key={i}>{a.address}</div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <Detail label="Địa chỉ" value={customer.address} />
                    )}
                    <Detail label="Ngày tạo" value={formatDate(customer.createdAt)} />
                </div>
                <div className="store-actions">
                    <button
                        className={`btn ${customer.status ? "danger" : "success"}`}
                        disabled={updating}
                        onClick={() => handleStatusChange(!customer.status)}
                    >
                        {customer.status ? "Khoá tài khoản" : "Mở khoá tài khoản"}
                    </button>
                </div>
            </div>
            <ToastContainer
                toastStyle={{ color: "white" }}
                position="top-right"
                autoClose={3000}
            />
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

function formatDate(date: string | Date) {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";
    return d.toISOString().slice(0, 10);
}
