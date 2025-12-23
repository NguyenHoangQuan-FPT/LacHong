import "../../assets/styles/Dashboard.css";

export default function Dashboard() {
    return (
        <div className="admin-dashboard">
            <h2 className="page-title">Dashboard</h2>

            {/* STAT CARDS */}
            <div className="dashboard-stats">
                <div className="stat-card">
                    <p>Tổng người dùng</p>
                    <h3>1,240</h3>
                </div>

                <div className="stat-card">
                    <p>Tổng cửa hàng</p>
                    <h3>132</h3>
                </div>

                <div className="stat-card">
                    <p>Đơn hàng</p>
                    <h3>3,580</h3>
                </div>

                <div className="stat-card highlight">
                    <p>Doanh thu</p>
                    <h3>₫245,000,000</h3>
                </div>
            </div>

            {/* TABLE */}
            <div className="dashboard-box">
                <h3>Cửa hàng mới</h3>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Tên cửa hàng</th>
                                <th>Email</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Shop ABC</td>
                                <td>abc@gmail.com</td>
                                <td className="active">Hoạt động</td>
                            </tr>
                            <tr>
                                <td>Shop XYZ</td>
                                <td>xyz@gmail.com</td>
                                <td className="locked">Khoá</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
