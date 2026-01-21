import { useEffect, useState } from "react";
import materialService from "../../services/material.service";
import "../../assets/styles/Categories.css";
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
    const [editModal, setEditModal] = useState<{ open: boolean; material?: Material }>({ open: false });
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editStatus, setEditStatus] = useState(true);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");

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

    const openEditModal = (material: Material) => {
        setEditName(material.name);
        setEditDesc(material.description || "");
        setEditStatus(material.status ?? true);
        setEditModal({ open: true, material });
        setEditError("");
    };

    const handleEditMaterial = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editModal.material) return;
        setEditLoading(true);
        setEditError("");
        setLoading(true);
        try {
            await materialService.updateMaterial(editModal.material._id, editName, editDesc, editStatus);
            await fetchMaterials();
            setEditModal({ open: false });
            toast.success("Cập nhật chất liệu thành công");
        } catch (err: any) {
            const msg = err?.response?.data?.message;
            setEditError(typeof msg === "string" ? msg : "Cập nhật chất liệu thất bại");
        } finally {
            setEditLoading(false);
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
            const msg = err?.response?.data?.message;
            setAddError(typeof msg === "string" ? msg : "Thêm chất liệu thất bại");
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
                                        <td style={{ maxWidth: '300px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{mat.name}</td>
                                        <td style={{ maxWidth: '300px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{mat.description}</td>
                                        <td>
                                            <span className={`status ${mat.status ? "active" : "locked"}`}>
                                                {mat.status ? "Hoạt động" : "Ngưng hoạt động"}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => openEditModal(mat)}
                                                >
                                                    Sửa
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
                {editModal.open && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Cập nhật chất liệu</h3>
                            <form onSubmit={handleEditMaterial}>
                                <div>
                                    <label>Tên chất liệu</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: 8, marginBottom: 8 }}
                                    />
                                </div>
                                <div>
                                    <label>Mô tả</label>
                                    <textarea
                                        value={editDesc}
                                        onChange={e => setEditDesc(e.target.value)}
                                        className="description-textarea"
                                    />
                                </div>
                                <div>
                                    <label>Trạng thái</label>
                                    <select
                                        value={editStatus ? 'active' : 'locked'}
                                        onChange={e => setEditStatus(e.target.value === 'active')}
                                        className="description-textarea"
                                    >
                                        <option value="active">Hoạt động</option>
                                        <option value="locked">Ngưng hoạt động</option>
                                    </select>
                                </div>
                                {editError && <div style={{ color: 'red', marginBottom: 8 }}>{editError}</div>}
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <Button variant="add" type="submit" disabled={editLoading}>
                                        {editLoading ? "Đang cập nhật..." : "Cập nhật"}
                                    </Button>
                                    <Button variant="secondary" type="button" onClick={() => setEditModal({ open: false })}>
                                        Huỷ
                                    </Button>
                                </div>
                            </form>
                        </div>
                        <div className="modal-backdrop" onClick={() => setEditModal({ open: false })} />
                    </div>
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
