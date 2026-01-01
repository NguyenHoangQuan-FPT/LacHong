import { useEffect, useState } from "react";
import { storeService } from "../../services/store.service";
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

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

    useEffect(() => {
        setLoading(true);

        storeService.getProductsByStore()
            .then((res: any) => {
                const productsList = res?.data?.products || [];
                // Tổng số sản phẩm đã bán = tổng sold của tất cả sản phẩm
                const totalSold = productsList.reduce((sum: number, p: Product) => sum + (typeof p.sold === 'number' ? p.sold : 0), 0);
                setTotalProducts(totalSold);
            })
            .catch(() => setError("Không thể tải dữ liệu thống kê sản phẩm"));

        storeService.getAllOrdersByStore()
            .then((res: any) => {
                const orderList = res?.data?.orders || [];
                setOrders(orderList);
                // Tính tổng doanh thu
                const revenue = orderList.reduce((sum: number, o: Order) => sum + (o.totalAmount || 0), 0);
                setTotalRevenue(revenue);
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

    return (
        <div className="orders-container">
            <div className="orders-header">Thống kê tổng quan cửa hàng</div>
            {loading ? (
                <div>Đang tải...</div>
            ) : error ? (
                <div style={{ color: 'red' }}>{error}</div>
            ) : (
                <>
                    <div style={{ margin: '16px 0', fontWeight: 600, display: 'flex', gap: 32 }}>
                        <div>Tổng đơn hàng: <span style={{ color: '#2563eb' }}>{orders.length}</span></div>
                        <div>Tổng sản phẩm đã bán: <span style={{ color: '#16a34a' }}>{totalProducts}</span></div>
                        <div>Tổng doanh thu: <span style={{ color: '#eab308' }}>{totalRevenue.toLocaleString()} VND</span></div>
                    </div>
                    <div style={{ maxWidth: 700, margin: '0 auto' }}>
                        <Bar data={chartData()} />
                    </div>
                </>
            )}
        </div>
    );
}
