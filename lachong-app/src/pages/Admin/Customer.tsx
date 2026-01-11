import { useEffect, useState } from "react";
import customerService from "../../services/customer.service";
import "../../assets/styles/Stores.css";
import Button from "../../components/common/buttons/Button";
import { Link } from "react-router";

interface Customer {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    status: boolean;
}

const PAGE_SIZE = 15;

export default function Customer() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        setLoading(true);
        customerService.getAllCustomers()
            .then((res: any) => {
                setCustomers(res?.data?.customers || []);
            })
            .finally(() => setLoading(false));
    }, []);

    const filteredCustomers = customers.filter(customer => {
        const s = search.toLowerCase();
        return (
            customer.fullName.toLowerCase().includes(s) ||
            (customer.email && customer.email.toLowerCase().includes(s))
        );
    });

    const totalPages = Math.ceil(filteredCustomers.length / PAGE_SIZE);
    const pagedCustomers = filteredCustomers.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    return (
        <>
            <div style={{ padding: 24 }}>
                <h2>Danh sách khách hàng</h2>
                <input
                    className="search-store"
                    type="text"
                    placeholder="Tìm kiếm khách hàng..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ marginBottom: 16, padding: 8, width: 300 }}
                />
                {loading ? (
                    <div>Đang tải...</div>
                ) : (
                    <table className="stores-table">
                        <thead>
                            <tr>
                                <th>Họ tên</th>
                                <th>Email</th>
                                <th>Số điện thoại</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagedCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: "center" }}>
                                        Không có khách hàng
                                    </td>
                                </tr>
                            ) : (
                                pagedCustomers.map(customer => (
                                    <tr key={customer._id}>
                                        <td>{customer.fullName}</td>
                                        <td>{customer.email}</td>
                                        <td>{customer.phone}</td>
                                        <td>
                                            <span className={`status ${customer.status ? "active" : "locked"}`}>
                                                {customer.status ? "Hoạt động" : "Khoá"}
                                            </span>
                                        </td>
                                        <td>
                                            <Button variant="secondary">
                                                <Link to={`/admin/customer/${customer._id}`}>
                                                    Xem chi tiết
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        ‹
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            className={page === i + 1 ? "active" : ""}
                            onClick={() => setPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        ›
                    </button>
                </div>
            )}
        </>
    );
}
