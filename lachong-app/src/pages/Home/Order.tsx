import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import orderService from "../../services/order.service";
import Footer from "../../components/layout/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/styles/Order.css";
import Icon from "../../components/common/icons/Icon";
import Button from "../../components/common/buttons/Button";

type OrderDto = {
    _id: string;
    code?: string;
    status?: string;
    products?: Array<any>;
    totalAmount?: number;
    createdAt?: string;
    orderItems?: Array<any>;
    store?: any;
    paymentMethod?: any;
    address?: string;
};

const extractOrdersFromResponse = (data: any): OrderDto[] => {
    if (data && Array.isArray(data.orders)) return data.orders;
    if (Array.isArray(data)) return data;
    if (data?.data && Array.isArray(data.data.orders)) return data.data.orders;
    return [];
};

const extractOrderFromResponse = (data: any): OrderDto | null => {
    if (data && data.order) return data.order as OrderDto;
    if (data && data._id) return data as OrderDto;
    if (data?.data && data.data.order) return data.data.order as OrderDto;
    return null;
};

const ORDER_STATUSES = [
    { value: "", label: "Tất cả đơn hàng" },
    { value: "Pending", label: "Chờ xử lý" },
    { value: "Processing", label: "Đang chuẩn bị hàng" },
    { value: "Completed", label: "Đã nhận" },
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
        case "Completed":
            return "#14ac28";
        case "Cancelled":
            return "#ef4444";
        default:
            return "#6b7280";
    }
};

export default function Order() {
    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<OrderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showAllOrders, setShowAllOrders] = useState(false);

    const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await orderService.getOrders();
                const ordersList = extractOrdersFromResponse(res?.data);
                setOrders(ordersList);
            } catch (err: any) {
                console.error("Error fetching orders:", err);
                const status = err?.response?.status;
                const message = err?.response?.data?.message;
                if (status === 401) {
                    setError("Bạn cần đăng nhập để xem đơn hàng.");
                } else {
                    setError(message || "Không tải được danh sách đơn hàng");
                }
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleOpenDetail = async (id: string) => {
        setDetailLoading(true);
        setDetailError(null);
        try {
            const res = await orderService.getOrderById(id);
            const order = extractOrderFromResponse(res?.data);
            if (!order) {
                setDetailError("Không tải được chi tiết đơn hàng");
                setSelectedOrder(null);
                return;
            }
            setSelectedOrder(order);
        } catch (err: any) {
            console.error("Error fetching order detail:", err);
            const status = err?.response?.status;
            const message = err?.response?.data?.message;
            if (status === 401) {
                setDetailError("Bạn cần đăng nhập để xem chi tiết đơn hàng.");
            } else {
                setDetailError(message || "Không tải được chi tiết đơn hàng");
            }
            setSelectedOrder(null);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCloseDetail = () => {
        setSelectedOrder(null);
        setDetailError(null);
    };

    useEffect(() => {
        let result = [...orders];
        if (statusFilter) {
            result = result.filter((order) => order.status === statusFilter);
        }
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            result = result.filter((order) => {
                const orderId = order.code?.toLowerCase() || "";
                const totalAmount = order.totalAmount?.toString() || "";
                return orderId.includes(search) || totalAmount.includes(search);
            });
        }
        setFilteredOrders(result);
        setShowAllOrders(false);
    }, [orders, statusFilter, searchTerm]);

    const getOrderCreatedAtMs = (order: OrderDto) => {
        const value = order.createdAt ? Date.parse(order.createdAt) : 0;
        return Number.isFinite(value) ? value : 0;
    };

    const sortedFilteredOrders = [...filteredOrders].sort(
        (a, b) => getOrderCreatedAtMs(b) - getOrderCreatedAtMs(a)
    );
    const visibleOrders = showAllOrders ? sortedFilteredOrders : sortedFilteredOrders.slice(0, 4);

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

                {detailLoading && (
                    <div className="order-status">Đang tải chi tiết đơn hàng...</div>
                )}

                {detailError && (
                    <div className="order-status error">{detailError}</div>
                )}

                {selectedOrder && !detailLoading && (
                    <div className="order-list">
                        <div className="order-card">
                            <div className="order-card__header">
                                <button
                                    type="button"
                                    className="order-btn order-btn-ghost"
                                    onClick={handleCloseDetail}
                                >
                                    <Icon name="back"></Icon>Quay lại
                                </button>
                                <div
                                    className="order-badge"
                                    style={{
                                        color: getStatusColor(selectedOrder.status || ""),
                                        backgroundColor: `${getStatusColor(selectedOrder.status || "")}20`,
                                    }}
                                >
                                    {getStatusLabel(selectedOrder.status || "")}
                                </div>
                            </div>
                            <div className="order-card__meta">
                                <div>
                                    <div className="order-card__sub">• Mã đơn hàng: {selectedOrder.code}</div>
                                </div>
                                {selectedOrder.address ? (
                                    <div>• Địa chỉ: {selectedOrder.address}</div>
                                ) : null}
                                {selectedOrder.paymentMethod?.name ? ` • Thanh toán: ${selectedOrder.paymentMethod.name}` : ""}
                                <div>
                                    <Link to={selectedOrder.store ? `/store/${selectedOrder.store._id}` : "#"}
                                        style={{ color: "inherit", textDecoration: "none" }}>
                                        {selectedOrder.store.storeName ? ` • Cửa hàng: ${selectedOrder.store.storeName}` : ""}
                                    </Link>
                                </div>
                            </div>
                            <div className="order-card__footer">
                                <div>
                                    <div className="order-card__sub">Tổng cộng</div>
                                    <div className="order-card__total">
                                        {(selectedOrder.totalAmount || 0).toLocaleString()} VND
                                    </div>
                                </div>
                                <div>
                                    <div className="order-card__sub">Ngày đặt hàng</div>
                                    <div className="order-card__date">
                                        {selectedOrder.createdAt
                                            ? new Date(selectedOrder.createdAt).toLocaleDateString("vi-VN")
                                            : "N/A"}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {Array.isArray(selectedOrder.orderItems) && selectedOrder.orderItems.length > 0 && selectedOrder.orderItems.map((orderItem: any, idx: number) => (
                            orderItem.products && orderItem.products.length > 0 && orderItem.products.map((p: any, pidx: number) => {
                                const productObj = typeof p?.productId === "object" ? p.productId : null;
                                const productLabel = productObj?.productName || productObj?._id || (typeof p?.productId === "string" ? p.productId : "Sản phẩm");
                                const productImage: string | null =
                                    (productObj?.imageUrl as string) ||
                                    (Array.isArray(productObj?.images) && productObj.images.length > 0 ? productObj.images[0] : null);
                                return (
                                    <div key={`${selectedOrder._id}-${idx}-${pidx}`} className="order-card">
                                        <div className="order-card__header">
                                            <div>
                                                <div className="order-card__sub">Sản phẩm</div>
                                                <div className="order-card__id">{productLabel}</div>
                                            </div>
                                            <Link to={productObj ? `/product/detail/?id=${productObj._id}` : "#"}>
                                                {productImage && (
                                                    <img
                                                        className="order-product-thumb"
                                                        src={productImage}
                                                        alt={productLabel}
                                                    />
                                                )}
                                            </Link>
                                        </div>
                                        <div className="order-card__meta">
                                            Số lượng: {p.quantity || 1} &nbsp;|&nbsp; Giá: {p.price ? p.price.toLocaleString() + ' VND' : '-'}
                                        </div>
                                    </div>
                                );
                            })
                        ))}
                    </div>
                )}

                {!selectedOrder && (
                    <>

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
                                <label className="order-label">Tìm kiếm</label>
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
                                {visibleOrders.map((order) => (
                                    <div
                                        key={order._id}
                                        className="order-card"
                                    >
                                        <div className="order-card__header">
                                            <div>
                                                <div className="order-card__sub">Mã đơn hàng</div>
                                                <div className="order-card__id">{order.code}</div>
                                            </div>
                                            <div
                                                className="order-badge"
                                                style={{
                                                    color: getStatusColor(order.status || ""),
                                                    backgroundColor: `${getStatusColor(order.status || "")}20`,
                                                }}
                                            >
                                                {getStatusLabel(order.status || "")}
                                            </div>
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
                                            <Button onClick={() => handleOpenDetail(order._id)}
                                                variant="secondary">
                                                Chi tiết
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {orders.length > 0 && (
                            <div className="order-summary">
                                Hiển thị <strong>{visibleOrders.length}</strong>/{filteredOrders.length} đơn hàng (tổng {orders.length})
                            </div>
                        )}

                        {filteredOrders.length > 4 && (
                            <div className="order-viewall">
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowAllOrders((v) => !v)}
                                >
                                    {showAllOrders ? "View less" : "View all"}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <ToastContainer position="top-right" autoClose={2000} />
        </div>
    );
}