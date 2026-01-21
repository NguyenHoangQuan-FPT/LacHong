import { useEffect, useMemo, useState } from "react";
import { storeService } from "../../services/store.service";
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import '../../assets/styles/Homestore.css';
import Icon from "../../components/common/icons/Icon";

interface Order {
    _id: string;
    totalAmount?: number;
    status?: string;
    createdAt?: string;
    products?: { quantity: number }[];
}

interface Product {
    _id: string;
    productName?: string;
    sold?: number;
}


export default function Homestore() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalPending, setTotalPending] = useState(0);

    useEffect(() => {
        setLoading(true);
        setError("");

        Promise.all([
            storeService.getProductsByStore(),
            storeService.getAllOrdersByStore(),
        ])
            .then(([productsRes, ordersRes]: any[]) => {
                const productsList: Product[] = productsRes?.data?.products || [];
                const orderList: Order[] = ordersRes?.data?.orders || [];

                setOrders(orderList);
                setTotalProducts(productsList.length);

                const revenue = orderList.reduce((sum: number, o: Order) => sum + (o.totalAmount || 0), 0);
                setTotalRevenue(revenue);

                const pending = orderList.filter((o: Order) => (o.status || '').toLowerCase() === 'pending').length;
                setTotalPending(pending);
            })
            .catch(() => setError("Không thể tải dữ liệu thống kê"))
            .finally(() => setLoading(false));
    }, []);

    // Chuẩn bị dữ liệu cho biểu đồ doanh thu theo tháng
    const chartData = () => {
        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        const revenueByMonth = months.map(month => {
            return orders.filter(o => {
                if (!o.createdAt) return false;
                const d = new Date(o.createdAt);
                return d.getMonth() + 1 === month;
            }).reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        });
        return {
            labels: months.map(m => `Tháng ${m}`),
            datasets: [
                {
                    label: 'Doanh thu',
                    data: revenueByMonth,
                    backgroundColor: '#2563eb',
                },
            ],
        };
    };

    const statCards = useMemo(() => ([
        {
            label: 'Tổng sản phẩm',
            value: totalProducts,
            icon: 'boxes',
            borderColor: '#4f46e5',
            iconBg: '#eef2ff',
        },
        {
            label: 'Tổng đơn hàng',
            value: orders.length,
            icon: 'cart-check',
            borderColor: '#f59e0b',
            iconBg: '#fff7ed',
        },
        {
            label: 'Tổng doanh thu',
            value: `${totalRevenue.toLocaleString('vi-VN')} VND`,
            icon: 'cash-stack',
            borderColor: '#10b981',
            iconBg: '#ecfdf3',
        },
        {
            label: 'Đơn hàng pending',
            value: totalPending,
            icon: 'clock-history',
            borderColor: '#f97316',
            iconBg: '#fff7ed',
        },
    ]), [orders.length, totalPending, totalProducts, totalRevenue]);

    const todayLabel = useMemo(() => {
        const now = new Date();
        return now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }, []);

    return (
        <div className="main-store">
            {loading ? (
                <div style={{ padding: 20 }}>Đang tải...</div>
            ) : error ? (
                <div style={{ padding: 20, color: 'red' }}>{error}</div>
            ) : (
                <>
                    {/* STAT CARDS */}
                    <div className="stats-section">
                        {statCards.map((card, idx) => (
                            <div
                                key={idx}
                                className="stat-card"
                                style={{ borderLeftColor: card.borderColor }}
                            >
                                <div className="stat-icon" style={{ backgroundColor: card.iconBg }}>
                                    <Icon name={card.icon} size={22} />
                                </div>
                                <div className="stat-content">
                                    <p className="stat-label">{card.label}</p>
                                    <p className="stat-value">{card.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="chart-section">
                        <div className="card">
                            <div className="card-header">
                                <h2>Doanh thu theo tháng</h2>
                            </div>
                            <div className="chart-wrapper">
                                <Bar data={chartData()} />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}