import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import orderService from "../../services/order.service";
import Footer from "../../components/layout/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/styles/Order.css";

const ORDER_STATUSES = [
    { value: "", label: "Tất cả đơn hàng" },
    { value: "Pending", label: "Chờ xử lý" },
    { value: "Processing", label: "Đang xử lý" },
    { value: "Shipped", label: "Đã gửi" },
    { value: "Delivered", label: "Đã giao" },
    { value: "Cancelled", label: "Đã hủy" },
];

const getStatusLabel = (status: string) => {
    const found = ORDER_STATUSES.find((s) => s.value === status);
    return found?.label || status;
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "Pending":
            return "#f59e0b";
        case "Processing":
            return "#3b82f6";
        case "Shipped":
            return "#8b5cf6";
        case "Delivered":
            return "#10b981";
        case "Cancelled":
            return "#ef4444";
        default:
            return "#6b7280";
    }
};

export default function Order() {
    const [orders, setOrders] = useState<any[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const PAGE_SIZE = 2;
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await orderService.getOrders();
                const ordersList = res?.data?.orders ?? res?.data ?? [];
                setOrders(Array.isArray(ordersList) ? ordersList : []);
            } catch (err: any) {
                console.error("Error fetching orders:", err);
                setError(err?.response?.data?.message || "Không tải được danh sách đơn hàng");
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    useEffect(() => {
        let result = [...orders];
        if (statusFilter) {
            result = result.filter((order) => order.status === statusFilter);
        }
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            result = result.filter((order) => {
                const orderId = order._id?.toLowerCase() || "";
                const totalAmount = order.totalAmount?.toString() || "";
                return orderId.includes(search) || totalAmount.includes(search);
            });
        }
        setFilteredOrders(result);
    }, [orders, statusFilter, searchTerm]);

    useEffect(() => {
        setPage(1);
    }, [statusFilter, searchTerm, orders.length]);

    const totalPages = useMemo(() => {
        const pages = Math.ceil(filteredOrders.length / PAGE_SIZE);
        return pages <= 0 ? 1 : pages;
    }, [filteredOrders.length]);

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const pagedOrders = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredOrders.slice(start, start + PAGE_SIZE);
    }, [filteredOrders, page]);

    if (loading) {
        return (
            <div className="order-page">
                <div className="order-status">Đang tải danh sách đơn hàng...</div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-page">
                <div className="order-status error">{error}</div>
                <Link to="/product" className="order-back">← Quay lại mua sắm</Link>
                <Footer />
            </div>
        );
    }

    return (
        <div className="order-page">
            <div className="order-shell">
                <h1 className="order-title">Đơn hàng của tôi</h1>

                <div className="order-filters">
                    <div className="order-filter">
                        <label className="order-label">Trạng thái đơn hàng</label>
                        <select
                            className="order-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            {ORDER_STATUSES.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="order-filter">
                        <label className="order-label">Tìm kiếm theo ID hoặc số tiền</label>
                        <input
                            className="order-input"
                            type="text"
                            placeholder="Nhập mã đơn hàng hoặc số tiền..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="order-empty">
                        <h3>Không có đơn hàng nào</h3>
                        <p>Hãy quay lại mua sắm để tạo đơn hàng mới.</p>
                        <Link to="/product" className="order-btn order-btn-primary">Quay lại mua sắm</Link>
                    </div>
                ) : (
                    <div className="order-list">
                        {pagedOrders.map((order) => (
                            <div
                                key={order._id}
                                className="order-card"
                            >
                                <div className="order-card__header">
                                    <div>
                                        <div className="order-card__sub">Mã đơn hàng</div>
                                        <div className="order-card__id">{order._id}</div>
                                    </div>
                                    <div
                                        className="order-badge"
                                        style={{
                                            color: getStatusColor(order.status),
                                            backgroundColor: `${getStatusColor(order.status)}20`,
                                        }}
                                    >
                                        {getStatusLabel(order.status)}
                                    </div>
                                </div>

                                <div className="order-card__meta">
                                    {order.products?.length || 0} sản phẩm
                                </div>

                                <div className="order-card__footer">
                                    <div>
                                        <div className="order-card__sub">Tổng cộng</div>
                                        <div className="order-card__total">
                                            {(order.totalAmount || 0).toLocaleString()} VND
                                        </div>
                                    </div>
                                    <div>
                                        <div className="order-card__sub">Ngày đặt hàng</div>
                                        <div className="order-card__date">
                                            {order.createdAt
                                                ? new Date(order.createdAt).toLocaleDateString("vi-VN")
                                                : "N/A"}
                                        </div>
                                    </div>
                                    <Link to={`/order/${order._id}`} className="order-btn order-btn-primary">
                                        Chi tiết
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {filteredOrders.length > PAGE_SIZE && (
                            <div className="order-pagination">
                                <button
                                    type="button"
                                    className="order-btn order-btn-ghost"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                >
                                    Trước
                                </button>
                                <div className="order-page-indicator">
                                    Trang {page} / {totalPages}
                                </div>
                                <button
                                    type="button"
                                    className="order-btn order-btn-ghost"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {orders.length > 0 && (
                    <div className="order-summary">
                        Hiển thị <strong>{pagedOrders.length}</strong> / <strong>{filteredOrders.length}</strong> đơn hàng (tổng {orders.length})
                    </div>
                )}
            </div>

            <ToastContainer position="top-right" autoClose={2000} />
        </div>
    );
}