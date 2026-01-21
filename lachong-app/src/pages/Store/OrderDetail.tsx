import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { storeService } from "../../services/store.service";
import "../../assets/styles/Orderdetail.css";
import Icon from "../../components/common/icons/Icon";
import Button from "../../components/common/buttons/Button";
import { toast, ToastContainer } from "react-toastify";

interface Product {
    productId: {
        _id: string;
        productName: string;
        imageUrl?: string;
        images?: string[];
    };
    quantity?: number;
    price?: number;
}

interface Customer {
    _id: string;
    fullName: string;
    email?: string;
    phone?: string;
}

interface OrderDetail {
    _id: string;
    customer: Customer;
    products: Product[];
    address?: string;
    totalAmount?: number;
    status?: string;
    createdAt?: string;
}

type OrderStatus = "Pending" | "Processing" | "Completed" | "Cancelled";

function normalizeStatus(raw?: string | null): OrderStatus {
    const v = String(raw || "").trim().toLowerCase();
    if (v === "processing") return "Processing";
    if (v === "completed") return "Completed";
    if (v === "cancelled" || v === "canceled") return "Cancelled";
    return "Pending";
}

function getAllowedNextStatuses(current: OrderStatus): OrderStatus[] {
    switch (current) {
        case "Pending":
            return ["Processing", "Completed", "Cancelled"];
        case "Processing":
            return ["Completed", "Cancelled"];
        case "Completed":
        case "Cancelled":
        default:
            return [];
    }
}

export default function OrderDetail() {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [updating, setUpdating] = useState(false);
    const [statusValue, setStatusValue] = useState<string>("");

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        storeService.getOrderById(id)
            .then((res: any) => {
                let order = res?.data?.order || null;
                if (order && Array.isArray(order.orderItems) && !order.products) {
                    order.products = order.orderItems.flatMap((oi: any) =>
                        Array.isArray(oi.products) ? oi.products : []
                    );
                }
                setOrder(order);
                setStatusValue(normalizeStatus(order?.status));
            })
            .catch(() => setError("Không thể tải chi tiết đơn hàng"))
            .finally(() => setLoading(false));
    }, [id]);

    const statusLabels: Record<OrderStatus, string> = {
        Pending: "Chờ xác nhận",
        Processing: "Chuẩn bị hàng",
        Completed: "Hoàn thành",
        Cancelled: "Đã hủy",
    };

    const currentStatus = normalizeStatus(order?.status);
    const allowedNext = getAllowedNextStatuses(currentStatus);
    const statusOptions: Array<{ value: OrderStatus; label: string }> = [
        { value: currentStatus, label: statusLabels[currentStatus] },
        ...allowedNext
            .filter((s) => s !== currentStatus)
            .map((s) => ({ value: s, label: statusLabels[s] })),
    ];

    const isStatusLocked = currentStatus === "Completed" || currentStatus === "Cancelled";

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = normalizeStatus(e.target.value);
        if (!order?._id) return;
        if (isStatusLocked) {
            setStatusValue(currentStatus);
            toast.info("Đơn hàng đã kết thúc, không thể cập nhật trạng thái");
            return;
        }

        if (newStatus === currentStatus) {
            setStatusValue(currentStatus);
            return;
        }

        if (!allowedNext.includes(newStatus)) {
            setStatusValue(currentStatus);
            toast.info("Không thể chuyển sang trạng thái này");
            return;
        }

        setStatusValue(newStatus);
        setUpdating(true);
        storeService.updateStatusOrder(order._id, newStatus)
            .then(() => {
                setOrder({ ...order, status: newStatus });
                toast.success("Cập nhật trạng thái thành công");
            })
            .catch(() => {
                setStatusValue(currentStatus);
                toast.error("Cập nhật trạng thái thất bại");
            })
            .finally(() => setUpdating(false));
    };

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!order) return <div>Không tìm thấy đơn hàng</div>;

    return (

        <div className="orderdetail-container">
            <div className="orderdetail-header">Chi tiết đơn hàng</div>
            <div style={{ background: "white", padding: 24 }}>
                <Link to="/store/orders" style={{ marginBottom: 16, display: "inline-block" }}>
                    <Button variant="secondary">
                        <Icon name="back" />Quay lại
                    </Button>
                </Link>

                <div className="orderdetail-info">
                    <div><strong>Khách hàng:</strong> {order.customer?.fullName || "-"}</div>
                    {order.customer?.email && <div><strong>Email:</strong> {order.customer.email}</div>}
                    {order.customer?.phone && <div><strong>Điện thoại:</strong> {order.customer.phone}</div>}
                    {order?.address && <div><strong>Địa chỉ:</strong> {order?.address}</div>}

                    <div>
                        <strong>Trạng thái:</strong>
                        <select
                            value={statusValue}
                            onChange={handleStatusChange}
                            disabled={updating || isStatusLocked}
                            className="update-status"
                        >
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        {updating && <span style={{ marginLeft: 8 }}>Đang cập nhật...</span>}
                    </div>
                    <div><strong>Ngày mua:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'} </div>
                    <div><strong>Tổng tiền:</strong> {order.totalAmount ? order.totalAmount.toLocaleString() + ' VND' : '-'} </div>
                </div>
                <div className="orderdetail-products-title">Sản phẩm</div>
                <table className="orderdetail-table">
                    <thead>
                        <tr>
                            <th>Ảnh</th>
                            <th>Tên sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Giá</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.products && order.products.length > 0 ? (
                            order.products.map((p, idx) => (
                                <tr key={p.productId._id + idx}>
                                    <td>{(p.productId.imageUrl || (p.productId.images && p.productId.images[0])) && (
                                        <Link to={`/store/products/${p.productId._id}`}>
                                            <img className="orderdetail-img" src={p.productId.imageUrl || p.productId.images?.[0]} alt={p.productId.productName} />
                                        </Link>
                                    )}</td>
                                    <td>{p.productId.productName}</td>
                                    <td>{p.quantity || 1}</td>
                                    <td className="price">{p.price ? p.price.toLocaleString() + ' VND' : '-'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={4} className="orderdetail-empty">Không có sản phẩm</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <ToastContainer
                toastStyle={{ color: "white" }}
                autoClose={3000} />
        </div>


    );
}
