import React, { useState } from 'react';
import '../../assets/styles/Homestore.css';
import { FiPackage, FiShoppingCart, FiTrendingUp, FiStar, FiMoreHorizontal } from 'react-icons/fi';

export default function Homestore() {
    const [activeTab, setActiveTab] = useState('overview');

    // Sample data
    const stats = [
        { icon: FiPackage, label: 'Sản phẩm', value: '24', change: '+2.5%', color: '#f59e0b' },
        { icon: FiShoppingCart, label: 'Đơn hàng', value: '156', change: '+12.3%', color: '#10b981' },
        { icon: FiTrendingUp, label: 'Doanh thu', value: '45.2M', change: '+8.1%', color: '#3b82f6' },
        { icon: FiStar, label: 'Đánh giá', value: '4.8', change: '+0.2', color: '#ec4899' },
    ];

    const recentOrders = [
        { id: '#ORD001', customer: 'Nguyễn Văn A', amount: '2.5M VND', status: 'Completed', date: '2025-12-02' },
        { id: '#ORD002', customer: 'Trần Thị B', amount: '1.8M VND', status: 'Processing', date: '2025-12-01' },
        { id: '#ORD003', customer: 'Phạm Văn C', amount: '3.2M VND', status: 'Pending', date: '2025-11-30' },
        { id: '#ORD004', customer: 'Lê Thị D', amount: '1.5M VND', status: 'Completed', date: '2025-11-29' },
        { id: '#ORD005', customer: 'Hoàng Văn E', amount: '2.9M VND', status: 'Cancelled', date: '2025-11-28' },
    ];

    const topProducts = [
        { id: 1, name: 'Tranh dệt thủ công', sales: 45, image: '🎨', revenue: '22.5M VND' },
        { id: 2, name: 'Gốm sứ truyền thống', sales: 38, image: '🏺', revenue: '19M VND' },
        { id: 3, name: 'Vải lụa Hà Đông', sales: 32, image: '🧵', revenue: '16M VND' },
        { id: 4, name: 'Sản phẩm gỗ mỹ nghệ', sales: 28, image: '🪵', revenue: '14M VND' },
    ];

    return (
        <div className="store-layout">
            <main className="store-main">
                {/* Header */}
                <div className="store-header">
                    <div className="store-header-content">
                        <div>
                            <h1>Dashboard Cửa Hàng</h1>
                            <p>Quản lý đơn hàng, sản phẩm và theo dõi doanh thu</p>
                        </div>
                        <div className="header-date">
                            📅 {new Date().toLocaleDateString('vi-VN')}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <section className="stats-section">
                    {stats.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div key={idx} className="stat-card" style={{ borderLeftColor: stat.color }}>
                                <div className="stat-icon" style={{ backgroundColor: `${stat.color}20` }}>
                                    <Icon size={24} color={stat.color} />
                                </div>
                                <div className="stat-content">
                                    <p className="stat-label">{stat.label}</p>
                                    <div className="stat-value-row">
                                        <h3 className="stat-value">{stat.value}</h3>
                                        <span className="stat-change positive">↑ {stat.change}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </section>

                {/* Main Content */}
                <div className="store-content">
                    {/* Left Column */}
                    <div className="content-left">
                        {/* Recent Orders */}
                        <div className="card">
                            <div className="card-header">
                                <h2>Đơn hàng gần đây</h2>
                                <a href="#" className="view-all">Xem tất cả →</a>
                            </div>
                            <div className="orders-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Mã đơn</th>
                                            <th>Khách hàng</th>
                                            <th>Số tiền</th>
                                            <th>Trạng thái</th>
                                            <th>Ngày</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map((order, idx) => (
                                            <tr key={idx}>
                                                <td><span className="order-id">{order.id}</span></td>
                                                <td>{order.customer}</td>
                                                <td><strong>{order.amount}</strong></td>
                                                <td>
                                                    <span className={`status-badge status-${order.status.toLowerCase()}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td>{order.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Chart Section */}
                        <div className="card" style={{ marginTop: 20 }}>
                            <div className="card-header">
                                <h2>Doanh thu 7 ngày gần đây</h2>
                            </div>
                            <div className="chart-placeholder">
                                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                    📊 Kết nối API để hiển thị biểu đồ
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="content-right">
                        {/* Top Products */}
                        <div className="card">
                            <div className="card-header">
                                <h2>Sản phẩm bán chạy</h2>
                            </div>
                            <div className="products-list">
                                {topProducts.map((product) => (
                                    <div key={product.id} className="product-item">
                                        <div className="product-emoji">{product.image}</div>
                                        <div className="product-info">
                                            <p className="product-name">{product.name}</p>
                                            <p className="product-sales">{product.sales} đơn</p>
                                        </div>
                                        <div className="product-revenue">
                                            <p className="revenue-value">{product.revenue}</p>
                                            <p className="revenue-label">Doanh thu</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="card" style={{ marginTop: 20 }}>
                            <div className="card-header">
                                <h2>Hành động nhanh</h2>
                            </div>
                            <div className="quick-actions">
                                <button className="action-btn action-btn-primary">➕ Thêm sản phẩm</button>
                                <button className="action-btn action-btn-secondary">📦 Quản lý kho</button>
                                <button className="action-btn action-btn-secondary">💬 Tin nhắn khách</button>
                                <button className="action-btn action-btn-secondary">⚙️ Cài đặt</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}