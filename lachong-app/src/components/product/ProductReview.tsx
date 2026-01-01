import React, { useEffect, useMemo, useState } from "react";
import { reviewService } from "../../services/review.service";
import customerService from "../../services/customer.service";
import { toast } from "react-toastify";
import "../../assets/styles/ProductReview.css";
import Icon from "../../assets/icons/Icon";

type ReviewItem = {
    _id?: string;
    id?: string;
    product?: string;
    rating?: number;
    comment?: string;
    createdAt?: string;
    customer?: {
        _id?: string;
        id?: string;
        fullName?: string;
    };
};

type ProductReviewProps = {
    productId?: string | null;
};

function extractId(value: any): string | null {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object") return value._id || value.id || null;
    return null;
}

export default function ProductReview({ productId }: ProductReviewProps) {
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ rating: 5, comment: "" });
    const [showModal, setShowModal] = useState(false);
    const [viewerCustomerId, setViewerCustomerId] = useState<string | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const PAGE_SIZE = 5;
    const [page, setPage] = useState(1);

    const currentUser = useMemo(() => {
        const raw = localStorage.getItem("user");
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }, []);

    useEffect(() => {
        const fromLocal = extractId(currentUser?.customer);
        if (fromLocal) {
            setViewerCustomerId(fromLocal);
            return;
        }

        let cancelled = false;
        customerService
            .getProfileCustomer()
            .then((res: any) => {
                if (cancelled) return;
                const profile = res?.data?.customer ?? res?.data;
                const id = extractId(profile);
                if (!id) return;
                setViewerCustomerId(id);

                try {
                    const raw = localStorage.getItem("user");
                    if (!raw) return;
                    const u = JSON.parse(raw);
                    u.customer = profile;
                    localStorage.setItem("user", JSON.stringify(u));
                } catch {
                    // ignore
                }
            })
            .catch(() => {
                // no customer context -> keep null (buttons will stay hidden)
            });

        return () => {
            cancelled = true;
        };
    }, [currentUser]);

    useEffect(() => {
        if (!openMenuId) return;

        const onDocClick = () => setOpenMenuId(null);
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpenMenuId(null);
        };

        document.addEventListener("click", onDocClick);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("click", onDocClick);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [openMenuId]);

    const canSubmit = useMemo(() => form.rating >= 1 && form.rating <= 5 && form.comment.trim().length > 0, [form]);

    const averageRating = useMemo(() => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, rev) => acc + (Number(rev.rating) || 0), 0);
        return sum / reviews.length;
    }, [reviews]);

    const totalPages = useMemo(() => {
        const pages = Math.ceil(reviews.length / PAGE_SIZE);
        return pages <= 0 ? 1 : pages;
    }, [reviews.length]);

    const pagedReviews = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return reviews.slice(start, start + PAGE_SIZE);
    }, [reviews, page]);

    const fetchReviews = async () => {
        if (!productId) return;
        setLoading(true);
        try {
            const res = await reviewService.getReviewsByProductId(productId);
            const raw: ReviewItem[] = Array.isArray(res?.data?.reviews)
                ? res.data.reviews
                : Array.isArray(res?.data)
                    ? res.data
                    : [];

            const seen = new Set<string>();
            const unique: ReviewItem[] = [];
            for (const item of raw) {
                const rid = (item?._id || (item as any)?.id || "") as string;
                if (!rid || seen.has(rid)) continue;
                seen.add(rid);
                unique.push(item);
            }

            unique.sort((a, b) => {
                const ta = new Date(a?.createdAt || 0).getTime();
                const tb = new Date(b?.createdAt || 0).getTime();
                return tb - ta;
            });

            setReviews(unique);
        } catch (err) {
            console.error("[ProductReview] fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    useEffect(() => {
        setPage(1);
    }, [productId]);

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const resetForm = () => {
        setForm({ rating: 5, comment: "" });
        setEditingId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productId || !canSubmit) return;
        setSubmitting(true);
        try {
            if (editingId) {
                await reviewService.updateReview(editingId, { rating: form.rating, comment: form.comment.trim() });
                toast.success("Đã cập nhật đánh giá");
            } else {
                await reviewService.addReview({ product: productId, rating: form.rating, comment: form.comment.trim() });
                toast.success("Đã thêm đánh giá");
            }
            await fetchReviews();
            resetForm();
            setShowModal(false);
        } catch (err: any) {
            console.error("[ProductReview] submit error", err);
            toast.error(err?.response?.data?.message || "Không thể lưu đánh giá");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId?: string) => {
        if (!reviewId) return;
        if (!window.confirm("Xóa đánh giá này?")) return;
        try {
            await reviewService.deleteReview(reviewId);
            toast.success("Đã xóa đánh giá");
            await fetchReviews();
        } catch (err: any) {
            console.error("[ProductReview] delete error", err);
            toast.error(err?.response?.data?.message || "Không thể xóa");
        }
    };

    const renderStars = (rating?: number) => {
        const val = Math.max(0, Math.min(5, Number(rating) || 0));
        return Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < val ? "star filled" : "star"}>★</span>
        ));
    };
    const fomattedDate = (dateStr?: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (!productId) {
        return null;
    }

    return (
        <div className="product-review">
            <div className="review-header">
                <div>
                    <h2>Đánh giá sản phẩm</h2>
                    <p>Chia sẻ cảm nhận và xem nhận xét từ người khác.</p>
                </div>
                <div className="review-actions-top">
                    {reviews.length > 0 && (
                        <div className="review-average">
                            <div className="average-stars">{renderStars(averageRating)}</div>
                            <div className="average-text">
                                <span className="average-number">{averageRating.toFixed(1)}</span>
                                <span className="average-label">/ 5</span>
                            </div>
                        </div>
                    )}
                    <div className="review-count">{reviews.length} đánh giá</div>
                    <button
                        type="button"
                        className="add-review"
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                    >
                        + Thêm đánh giá
                    </button>
                </div>
            </div>

            <div className="review-list">
                {loading ? (
                    <div className="review-status">Đang tải đánh giá...</div>
                ) : reviews.length === 0 ? (
                    <div className="review-status">Chưa có đánh giá nào.</div>
                ) : (
                    pagedReviews.map((rev) => {
                        const id = rev._id || rev.id;
                        const reviewId = id ? String(id) : "";
                        const reviewUserId = rev.customer?._id || rev.customer?.id;
                        const isOwner = !!(
                            viewerCustomerId &&
                            reviewUserId &&
                            String(viewerCustomerId) === String(reviewUserId)
                        );

                        return (
                            <div className="review-item" key={id}>
                                <div className="review-meta">
                                    <div className="review-user">{rev.customer?.fullName || "Ẩn danh"}</div>
                                </div>
                                <div className="review-date">{fomattedDate(rev.createdAt)}</div>
                                <div className="review-comment">{rev.comment}</div>
                                <div className="review-stars">{renderStars(rev.rating)}</div>

                                {isOwner && (
                                    <div className="review-actions">
                                        <button
                                            type="button"
                                            className="link review-options-button"
                                            aria-label="Tùy chọn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!reviewId) return;
                                                setOpenMenuId((curr) => (curr === reviewId ? null : reviewId));
                                            }}
                                        >
                                            <Icon name="options"></Icon>
                                        </button>

                                        {reviewId && openMenuId === reviewId && (
                                            <div
                                                className="review-options-menu"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    type="button"
                                                    className="review-options-item"
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        setEditingId(reviewId);
                                                        setForm({ rating: rev.rating || 5, comment: rev.comment || "" });
                                                        setShowModal(true);
                                                    }}
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    type="button"
                                                    className="review-options-item"
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        handleDelete(reviewId);
                                                    }}
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {!loading && reviews.length > PAGE_SIZE && (
                <div className="review-pagination">
                    <button
                        type="button"
                        className="btn ghost"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                    >
                        Trước
                    </button>
                    <div className="review-page-indicator">Trang {page} / {totalPages}</div>
                    <button
                        type="button"
                        className="btn ghost"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                    >
                        Sau
                    </button>
                </div>
            )}

            {showModal && (
                <div className="review-modal-backdrop" onClick={() => !submitting && setShowModal(false)}>
                    <div className="review-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingId ? "Cập nhật đánh giá" : "Thêm đánh giá"}</h3>
                            <button className="close" onClick={() => !submitting && setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-row">
                                <label>Đánh giá</label>
                                <select
                                    value={form.rating}
                                    onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                                >
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <option key={n} value={n}>{n} sao</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <label>Nhận xét</label>
                                <textarea
                                    value={form.comment}
                                    onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                                    placeholder="Chia sẻ trải nghiệm của bạn..."
                                    rows={3}
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn ghost" onClick={() => { if (!submitting) { resetForm(); setShowModal(false); } }}>Hủy</button>
                                <button type="submit" className="btn primary" disabled={!canSubmit || submitting}>
                                    {submitting ? "Đang lưu..." : editingId ? "Cập nhật" : "Gửi đánh giá"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
