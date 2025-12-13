import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import orderService from "../../services/order.service";
import Footer from "../../components/layout/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/styles/Cart.css";

const ORDER_STATUSES = [
    { value: "", label: "Tất cả đơn hàng" },
    { value: "Pending", label: "Chờ xử lý" },
    { value: "Processing", label: "Đang xử lý" },
    { value: "Shipped", label: "Đã gửi" },
    { value: "Delivered", label: "Đã giao" },
    { value: "Cancelled", label: "Đã hủy" },
];

const getStatusLabel = (status: string) => {
    const found = ORDER_STATUSES.find(s => s.value === status);
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

    // Fetch orders on mount
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

    // Apply filters and search
    useEffect(() => {
        let result = [...orders];

        // Filter by status
        if (statusFilter) {
            result = result.filter(order => order.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            result = result.filter(order => {
                const orderId = order._id?.toLowerCase() || "";
                const totalAmount = order.totalAmount?.toString() || "";
                return orderId.includes(search) || totalAmount.includes(search);
            });
        }

        setFilteredOrders(result);
    }, [orders, statusFilter, searchTerm]);

    if (loading) {
        return (
            <div className="cart-page">
                <div className="cart-status">Đang tải danh sách đơn hàng...</div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="cart-page">
                <div className="cart-status error">{error}</div>
                <Link to="/product" className="cart-back">← Quay lại mua sắm</Link>
                <Footer />
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-container">
                <h1 className="cart-title">Đơn hàng của tôi</h1>

                {/* Filters and Search */}
                <div style={{ marginBottom: 24, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                    {/* Status Filter */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                            Trạng thái đơn hàng
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                borderRadius: 6,
                                border: "1px solid #d0d7de",
                                fontSize: 14,
                                cursor: "pointer",
                            }}
                        >
                            {ORDER_STATUSES.map(status => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Search */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                            Tìm kiếm theo ID hoặc số tiền
                        </label>
                        <input
                            type="text"
                            placeholder="Nhập mã đơn hàng hoặc số tiền..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                borderRadius: 6,
                                border: "1px solid #d0d7de",
                                fontSize: 14,
                            }}
                        />
                    </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "40px 20px",
                        backgroundColor: "#f8fafc",
                        borderRadius: 8,
                        color: "#64748b",
                    }}>
                        <h3 style={{ marginBottom: 8 }}>Không có đơn hàng nào</h3>
                        <p>Hãy quay lại mua sắm để tạo đơn hàng mới.</p>
                        <Link to="/product" className="cart-shop-btn" style={{ marginTop: 16 }}>
                            Quay lại mua sắm
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {filteredOrders.map(order => (
                            <div
                                key={order._id}
                                style={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: 8,
                                    padding: 16,
                                    transition: "box-shadow 0.2s",
                                    cursor: "pointer",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                                }}
                            >
                                {/* Order Header */}
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    marginBottom: 12,
                                    flexWrap: "wrap",
                                    gap: 16,
                                }}>
                                    <div>
                                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                                            Mã đơn hàng
                                        </div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: "#000" }}>
                                            {order._id}
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: "6px 12px",
                                        borderRadius: 4,
                                        backgroundColor: getStatusColor(order.status) + "20",
                                        color: getStatusColor(order.status),
                                        fontWeight: 600,
                                        fontSize: 13,
                                    }}>
                                        {getStatusLabel(order.status)}
                                    </div>
                                </div>

                                {/* Order Items Count */}
                                <div style={{
                                    fontSize: 13,
                                    color: "#64748b",
                                    marginBottom: 12,
                                }}>
                                    {order.products?.length || 0} sản phẩm
                                </div>

                                {/* Order Total */}
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    paddingTop: 12,
                                    borderTop: "1px solid #e2e8f0",
                                }}>
                                    <div>
                                        <div style={{ fontSize: 12, color: "#64748b" }}>Tổng cộng</div>
                                        <div style={{ fontSize: 18, fontWeight: 700, color: "#000" }}>
                                            {(order.totalAmount || 0).toLocaleString()} VND
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, color: "#64748b" }}>Ngày đặt hàng</div>
                                        <div style={{ fontSize: 14, color: "#000" }}>
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : "N/A"}
                                        </div>
                                    </div>
                                    <Link
                                        to={`/order/${order._id}`}
                                        style={{
                                            padding: "8px 16px",
                                            backgroundColor: "#3b82f6",
                                            color: "#fff",
                                            borderRadius: 4,
                                            textDecoration: "none",
                                            fontSize: 13,
                                            fontWeight: 600,
                                            transition: "background-color 0.2s",
                                        }}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLElement).style.backgroundColor = "#2563eb";
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLElement).style.backgroundColor = "#3b82f6";
                                        }}
                                    >
                                        Chi tiết
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Summary */}
                {orders.length > 0 && (
                    <div style={{
                        marginTop: 32,
                        padding: 16,
                        backgroundColor: "#f8fafc",
                        borderRadius: 8,
                        textAlign: "center",
                        color: "#64748b",
                        fontSize: 13,
                    }}>
                        Hiển thị <strong>{filteredOrders.length}</strong> / <strong>{orders.length}</strong> đơn hàng
                    </div>
                )}
            </div>

            <ToastContainer position="top-right" autoClose={2000} />
        </div>
    );
}
