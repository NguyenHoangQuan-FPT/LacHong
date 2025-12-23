import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { storeService } from "../../services/store.service";
import "../../assets/styles/Stores.css";
import Button from "../../assets/buttons/Button";

interface Store {
    _id: string;
    storeName: string;
    emailStore: string;
    phone?: string;
    status: boolean;
}


const PAGE_SIZE = 15;

export default function Stores() {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        setLoading(true);
        storeService.getAllStores()
            .then((res: any) => {
                setStores(res?.data?.stores || []);
            })
            .finally(() => setLoading(false));
    }, []);

    const filteredStores = stores.filter(store => {
        const s = search.toLowerCase();
        return (
            store.storeName.toLowerCase().includes(s) ||
            (store.emailStore && store.emailStore.toLowerCase().includes(s)) ||
            (store.phone && store.phone.toLowerCase().includes(s))
        );
    });

    const totalPages = Math.ceil(filteredStores.length / PAGE_SIZE);
    const pagedStores = filteredStores.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    return (
        <>
            <div style={{ padding: 24 }}>
                <h2>Danh sách cửa hàng</h2>
                <input
                    className="search-store"
                    type="text"
                    placeholder="Tìm kiếm cửa hàng..."
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
                                <th>Tên cửa hàng</th>
                                <th>Email</th>
                                <th>Số điện thoại</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagedStores.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: "center" }}>
                                        Không có cửa hàng
                                    </td>
                                </tr>
                            ) : (
                                pagedStores.map(store => (
                                    <tr key={store._id}>
                                        <td>{store.storeName}</td>
                                        <td>{store.emailStore}</td>
                                        <td>{store.phone || "Chưa cập nhật"}</td>
                                        <td>
                                            <span className={`status ${store.status ? "active" : "locked"}`}>
                                                {store.status ? "Hoạt động" : "Khoá"}
                                            </span>
                                        </td>
                                        <td>
                                            <Button variant="secondary">
                                                <Link to={`/admin/store/${store._id}`}>
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
