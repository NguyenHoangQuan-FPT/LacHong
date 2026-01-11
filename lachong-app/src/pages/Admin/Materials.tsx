import { useEffect, useState } from "react";
import materialService from "../../services/material.service";
import "../../assets/styles/categories.css";
import Button from "../../components/common/buttons/Button";
import { toast, ToastContainer } from "react-toastify";

interface Material {
    _id: string;
    name: string;
    description?: string;
    status?: boolean;
}

const PAGE_SIZE = 15;

export default function Materials() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState("");

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const res = await materialService.getMaterials();
            setMaterials(res?.data?.materials || []);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: boolean) => {
        setLoading(true);
        try {
            await materialService.updateStatusMaterial(id, status);
            await fetchMaterials();
            toast.success("Cập nhật thành công");
        } finally {
            setLoading(false);
        }
    };

    const handleAddMaterial = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError("");
        try {
            await materialService.createMaterial(newName, newDesc);
            setShowModal(false);
            setNewName("");
            setNewDesc("");
            await fetchMaterials();
            toast.success("Thêm chất liệu thành công");
        } catch (err: any) {
            setAddError(err?.response?.data?.message || "Thêm chất liệu thất bại");
        } finally {
            setAddLoading(false);
        }
    };

    const filteredMaterials = materials.filter(mat => {
        const s = search.toLowerCase();
        return (
            mat.name.toLowerCase().includes(s) ||
            (mat.description && mat.description.toLowerCase().includes(s))
        );
    });

    const totalPages = Math.ceil(filteredMaterials.length / PAGE_SIZE);
    const pagedMaterials = filteredMaterials.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    return (
        <>
            <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Danh sách chất liệu</h2>
                </div>
                <input
                    className="search-store"
                    type="text"
                    placeholder="Tìm kiếm chất liệu..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ marginBottom: 16, padding: 8, width: 300 }}
                />
                <span style={{ float: 'right' }}>
                    <Button variant="add" onClick={() => setShowModal(true)}>
                        Thêm chất liệu
                    </Button>
                </span>
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Thêm chất liệu mới</h3>
                            <form onSubmit={handleAddMaterial}>
                                <div>
                                    <label>Tên chất liệu</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label>Mô tả</label>
                                    <textarea
                                        value={newDesc}
                                        onChange={e => setNewDesc(e.target.value)}
                                    />
                                </div>
                                {addError && <div style={{ color: 'red', marginBottom: 8 }}>{addError}</div>}
                                <div className="modal-actions" style={{ display: 'flex', gap: 8 }}>
                                    <Button type="submit" variant="add" disabled={addLoading}>
                                        {addLoading ? "Đang thêm..." : "Thêm"}
                                    </Button>
                                    <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                                        Huỷ
                                    </Button>
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
                                <th>Tên chất liệu</th>
                                <th>Mô tả</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagedMaterials.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: "center" }}>
                                        Không có chất liệu
                                    </td>
                                </tr>
                            ) : (
                                pagedMaterials.map(mat => (
                                    <tr key={mat._id}>
                                        <td>{mat.name}</td>
                                        <td>{mat.description}</td>
                                        <td>
                                            <span className={`status ${mat.status ? "active" : "locked"}`}>
                                                {mat.status ? "Hoạt động" : "Ngưng hoạt động"}
                                            </span>
                                        </td>
                                        <td>
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleUpdateStatus(mat._id, !mat.status)}
                                            >
                                                {mat.status ? "Ngưng hoạt động" : "Hoạt động"}
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
                <ToastContainer
                    toastStyle={{ color: "white" }}
                    position="top-right"
                    autoClose={3000}
                />
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
