import { useEffect, useState } from "react";
import { typeStoreService } from "../../services/typeStore.service";
import "../../assets/styles/Stores.css";
import Button from "../../components/common/buttons/Button";

interface TypeStore {
    _id: string;
    typeName: string;
    description: string;
    status: boolean;
}

const PAGE_SIZE = 15;

export default function TypeStore() {
    const [editModal, setEditModal] = useState<{ open: boolean, typeStore?: TypeStore }>({ open: false });
    const [editTypeName, setEditTypeName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editStatus, setEditStatus] = useState(true);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");

    const openEditModal = (typeStore: TypeStore) => {
        setEditTypeName(typeStore.typeName);
        setEditDescription(typeStore.description);
        setEditStatus(typeStore.status);
        setEditModal({ open: true, typeStore });
        setEditError("");
    };

    const handleEditType = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editModal.typeStore) return;
        setEditLoading(true);
        setEditError("");
        try {
            await typeStoreService.updateTypeStore(editModal.typeStore._id, editTypeName, editDescription, editStatus);
            setEditModal({ open: false });
            setLoading(true);
            const res: any = await typeStoreService.getAllTypeStores();
            setTypeStores(res?.data || []);
        } catch (err: any) {
            setEditError(err?.response?.data?.message || "Cập nhật loại cửa hàng thất bại");
        } finally {
            setEditLoading(false);
            setLoading(false);
        }
    };
    const [showModal, setShowModal] = useState(false);
    const [newTypeName, setNewTypeName] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState("");

    const handleAddType = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTypeName.trim()) return;
        setAddLoading(true);
        setAddError("");
        try {
            await typeStoreService.createTypeStore(newTypeName, newDescription);
            setShowModal(false);
            setNewTypeName("");
            setNewDescription("");
            setLoading(true);
            const res: any = await typeStoreService.getAllTypeStores();
            setTypeStores(res?.data || []);
        } catch (err: any) {
            setAddError(err?.response?.data?.message || "Thêm loại cửa hàng thất bại");
        } finally {
            setAddLoading(false);
            setLoading(false);
        }
    };
    const [typeStores, setTypeStores] = useState<TypeStore[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        setLoading(true);
        typeStoreService.getAllTypeStores()
            .then((res: any) => {
                setTypeStores(res?.data || []);
            })
            .finally(() => setLoading(false));
    }, []);

    const filteredTypeStores = typeStores.filter(typeStore => {
        const s = search.toLowerCase();
        return (
            typeStore.typeName.toLowerCase().includes(s) ||
            (typeStore.description && typeStore.description.toLowerCase().includes(s))
        );
    });

    const totalPages = Math.ceil(filteredTypeStores.length / PAGE_SIZE);
    const pagedTypeStores = filteredTypeStores.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    return (
        <>
            <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2>Danh sách loại cửa hàng</h2>
                </div>
                <input
                    className="search-store"
                    type="text"
                    placeholder="Tìm kiếm loại cửa hàng..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ marginBottom: 16, padding: 8, width: 300 }}
                />
                <span style={{ float: 'right' }}>
                    <Button variant="add" onClick={() => setShowModal(true)}>
                        Thêm loại cửa hàng
                    </Button>
                </span>
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Thêm loại cửa hàng mới</h3>
                            <form onSubmit={handleAddType}>
                                <div>
                                    <label>Tên loại cửa hàng</label>
                                    <input
                                        type="text"
                                        value={newTypeName}
                                        onChange={e => setNewTypeName(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: 8, marginBottom: 8 }}
                                    />
                                </div>
                                <div>
                                    <label>Mô tả</label>
                                    <textarea
                                        value={newDescription}
                                        onChange={e => setNewDescription(e.target.value)}
                                        style={{ width: '100%', padding: 8, marginBottom: 8 }}
                                    />
                                </div>
                                {addError && <div style={{ color: 'red', marginBottom: 8 }}>{addError}</div>}
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <Button variant="add" type="submit" disabled={addLoading}>{addLoading ? 'Đang thêm...' : 'Thêm'}</Button>
                                    <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Huỷ</Button>
                                </div>
                            </form>
                        </div>
                        <div className="modal-backdrop" onClick={() => setShowModal(false)} />
                    </div>
                )}
                {loading ? (
                    <div>Đang tải...</div>
                ) : (
                    <table className="stores-table">
                        <thead>
                            <tr>
                                <th>Tên loại</th>
                                <th>Mô tả</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagedTypeStores.length === 0 ? (
                                <tr>
                                    <td colSpan={3} style={{ textAlign: "center" }}>
                                        Không có loại cửa hàng
                                    </td>
                                </tr>
                            ) : (
                                pagedTypeStores.map(typeStore => (
                                    <tr key={typeStore._id}>
                                        <td>{typeStore.typeName}</td>
                                        <td>{typeStore.description}</td>
                                        <td>
                                            <span className={`status ${typeStore.status ? "active" : "locked"}`}>
                                                {typeStore.status ? "Hoạt động" : "Khoá"}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-secondary" onClick={() => openEditModal(typeStore)}>Sửa</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {editModal.open && (
                                <div className="modal-overlay">
                                    <div className="modal-content">
                                        <h3>Cập nhật loại cửa hàng</h3>
                                        <form onSubmit={handleEditType}>
                                            <div>
                                                <label>Tên loại cửa hàng</label>
                                                <input
                                                    type="text"
                                                    value={editTypeName}
                                                    onChange={e => setEditTypeName(e.target.value)}
                                                    required
                                                    style={{ width: '100%', padding: 8, marginBottom: 8 }}
                                                />
                                            </div>
                                            <div>
                                                <label>Mô tả</label>
                                                <textarea
                                                    value={editDescription}
                                                    onChange={e => setEditDescription(e.target.value)}
                                                    style={{ width: '100%', padding: 8, marginBottom: 8 }}
                                                />
                                            </div>
                                            <div>
                                                <label>Trạng thái</label>
                                                <select value={editStatus ? 'active' : 'locked'} onChange={e => setEditStatus(e.target.value === 'active')} style={{ width: '100%', padding: 8, marginBottom: 8 }}>
                                                    <option value="active">Hoạt động</option>
                                                    <option value="locked">Khoá</option>
                                                </select>
                                            </div>
                                            {editError && <div style={{ color: 'red', marginBottom: 8 }}>{editError}</div>}
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <Button variant="add" type="submit" disabled={editLoading}>{editLoading ? 'Đang cập nhật...' : 'Cập nhật'}</Button>
                                                <Button variant="secondary" type="button" onClick={() => setEditModal({ open: false })}>Huỷ</Button>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="modal-backdrop" onClick={() => setEditModal({ open: false })} />
                                </div>
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
