import { useEffect, useState } from "react";
import { storeService } from "../../services/store.service";
import Button from "../../assets/buttons/Button";
import { Link } from "react-router-dom";
import "../../assets/styles/Orders.css";

interface Order {
    _id: string;
    code?: string;
    customerName?: string;
    totalAmount?: number;
    status?: string;
    createdAt?: string;
}

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    useEffect(() => {
        setLoading(true);
        storeService.getAllOrdersByStore()
            .then((res: any) => {
                setOrders(res?.data?.orders || []);
            })
            .catch(() => setError("Không thể tải đơn hàng"))
            .finally(() => setLoading(false));
    }, []);


    const filteredOrders = orders.filter((order) => {
        const code = (order.code || "").toLowerCase();
        const searchMatch = code.includes(search.toLowerCase());
        const orderStatus = (order.status || "").toLowerCase().trim();
        const filterStatus = statusFilter.toLowerCase().trim();
        const statusMatch = filterStatus === "all" || orderStatus === filterStatus;
        return searchMatch && statusMatch;
    });

    return (
        <div className="orders-container">
            <div className="orders-header">Danh sách đơn hàng của cửa hàng </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <input
                    className="search-store"
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select
                    className="status-filter"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ xác nhận</option>
                    <option value="processing">Chuẩn bị hàng</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                </select>
            </div>
            <div>
                {loading ? (
                    <div>Đang tải...</div>
                ) : error ? (
                    <div style={{ color: 'red' }}>{error}</div>
                ) : (
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th>Ngày mua</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center" }}>Không có đơn hàng</td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order._id}>
                                        <td>{order.code}</td>
                                        <td>{order.totalAmount?.toLocaleString() || "-"}</td>
                                        <td>{order.status || "-"}</td>
                                        <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}</td>
                                        <td className="orders-action">
                                            <Link to={`/store/order/${order._id}`}>
                                                <Button variant="secondary">Xem chi tiết</Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
