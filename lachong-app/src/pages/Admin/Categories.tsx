import { useEffect, useState } from "react";
import categoryService from "../../services/category.service";
import "../../assets/styles/Categories.css";
import Button from "../../components/common/buttons/Button";
import { toast, ToastContainer } from "react-toastify";

interface Category {
    _id: string;
    name: string;
    description?: string;
    status?: boolean;
}

const PAGE_SIZE = 15;

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState("");
    const [editModal, setEditModal] = useState<{ open: boolean; category?: Category }>({ open: false });
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editStatus, setEditStatus] = useState(true);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");

    useEffect(() => {
        setLoading(true);
        categoryService.getCategories()
            .then((res: any) => {
                setCategories(res?.data?.categories || []);
            })
            .finally(() => setLoading(false));
    }, []);

    const openEditModal = (category: Category) => {
        setEditName(category.name);
        setEditDesc(category.description || "");
        setEditStatus(category.status ?? true);
        setEditModal({ open: true, category });
        setEditError("");
    };

    const handleEditCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editModal.category) return;
        setEditLoading(true);
        setEditError("");
        setLoading(true);
        try {
            await categoryService.updateCategory(editModal.category._id, editName, editDesc, editStatus);
            const res = await categoryService.getCategories();
            setCategories(res?.data?.categories || []);
            setEditModal({ open: false });
            toast.success("Cập nhật danh mục thành công");
        } catch (err: any) {
            setEditError(err?.response?.data?.message || "Cập nhật danh mục thất bại");
        } finally {
            setEditLoading(false);
            setLoading(false);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError("");
        try {
            await categoryService.createCategory(newName, newDesc);
            setShowModal(false);
            setNewName("");
            setNewDesc("");
            const res = await categoryService.getCategories();
            setCategories(res?.data?.categories || []);
            toast.success("Thêm danh mục thành công");
        } catch (err: any) {
            setAddError(err?.response?.data?.message || "Thêm danh mục thất bại");
        } finally {
            setAddLoading(false);
        }
    };

    const filteredCategories = categories.filter(cat => {
        const s = search.toLowerCase();
        return (
            cat.name.toLowerCase().includes(s) ||
            (cat.description && cat.description.toLowerCase().includes(s))
        );
    });

    const totalPages = Math.ceil(filteredCategories.length / PAGE_SIZE);
    const pagedCategories = filteredCategories.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    return (
        <>
            <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', }}>
                    <h2>Danh mục sản phẩm</h2>
                </div>
                <input
                    className="search-store"
                    type="text"
                    placeholder="Tìm kiếm danh mục..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ padding: 8, width: 300 }}
                />
                <span style={{ float: 'right' }}>
                    <Button variant="add" onClick={() => setShowModal(true)}>
                        Thêm danh mục
                    </Button>
                </span>
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Thêm danh mục mới</h3>
                            <form onSubmit={handleAddCategory}>
                                <div>
                                    <label>Tên danh mục</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: 8, marginBottom: 8 }}
                                    />
                                </div>
                                <div>
                                    <label>Mô tả</label>
                                    <textarea
                                        value={newDesc}
                                        onChange={e => setNewDesc(e.target.value)}
                                        className="description-textarea"
                                    />
                                </div>
                                {addError && <div style={{ color: 'red', marginBottom: 8 }}>{addError}</div>}
                                <div style={{ display: 'flex', gap: 8 }}>
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
                                <th>Tên danh mục</th>
                                <th>Mô tả</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagedCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: "center" }}>
                                        Không có danh mục
                                    </td>
                                </tr>
                            ) : (
                                pagedCategories.map(cat => (
                                    <tr key={cat._id}>
                                        <td style={{ maxWidth: '300px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{cat.name}</td>
                                        <td style={{ maxWidth: '300px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{cat.description}</td>
                                        <td>
                                            <span className={`status ${cat.status ? "active" : "locked"}`}>
                                                {cat.status ? "Hoạt động" : "Ngưng hoạt động"}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => openEditModal(cat)}
                                                >
                                                    Sửa
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table >
                )
                }
                {editModal.open && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Cập nhật danh mục</h3>
                            <form onSubmit={handleEditCategory}>
                                <div>
                                    <label>Tên danh mục</label>
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
                                        className="description-textarea" />
                                </div>
                                <div>
                                    <label>Trạng thái</label>
                                    <select
                                        value={editStatus ? 'active' : 'locked'}
                                        onChange={e => setEditStatus(e.target.value === 'active')}
                                        className="status-select"
                                        style={{ width: '100%', padding: 8, marginBottom: 8, fontFamily: 'inherit' }}
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
            </div >
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
            )
            }
        </>
    );
}
