import React, { useEffect, useMemo, useState } from "react";
import { reviewService } from "../../services/review.service";
import customerService from "../../services/customer.service";
import { toast } from "react-toastify";
import "../../assets/styles/ProductReview.css";
import Icon from "../../components/common/icons/Icon";
import Button from "../common/buttons/Button";

type ReviewItem = {
    _id?: string;
    id?: string;
    product?: string;
    rating?: number;
    comment?: string;
    images?: string[];
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

function toPublicImageUrl(value?: string): string {
    if (!value) return "";
    if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;
    const base = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
    if (!base) return value;
    return `${String(base).replace(/\/$/, "")}/${String(value).replace(/^\//, "")}`;
}

export default function ProductReview({ productId }: ProductReviewProps) {
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ rating: 5, comment: "" });
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [viewerCustomerId, setViewerCustomerId] = useState<string | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [keptImages, setKeptImages] = useState<string[]>([]);

    const [imageViewerUrl, setImageViewerUrl] = useState<string | null>(null);

    type SelectedImage = { key: string; file: File; previewUrl: string };
    const MAX_IMAGES = 5;
    const MAX_IMAGE_SIZE_MB = 5;
    const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);

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

    const isAdmin = useMemo(() => {
        const role = currentUser?.role || currentUser?.roleId?.name || currentUser?.name;
        return String(role).toLowerCase() === "admin";
    }, [currentUser]);

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

    useEffect(() => {
        if (!imageViewerUrl) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setImageViewerUrl(null);
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [imageViewerUrl]);

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

    const clearSelectedImages = () => {
        setSelectedImages((curr) => {
            curr.forEach((it) => URL.revokeObjectURL(it.previewUrl));
            return [];
        });
    };

    useEffect(() => {
        return () => {
            setSelectedImages((curr) => {
                curr.forEach((it) => URL.revokeObjectURL(it.previewUrl));
                return curr;
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const resetForm = () => {
        setForm({ rating: 5, comment: "" });
        setEditingId(null);
        setHoverRating(null);
        setSubmitError(null);
        clearSelectedImages();
        setKeptImages([]);
    };

    const closeModal = () => {
        if (submitting) return;
        setShowModal(false);
        setOpenMenuId(null);
        resetForm();
    };

    const handlePickImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        e.target.value = "";
        if (files.length === 0) return;

        const valid: File[] = [];
        for (const f of files) {
            if (!f.type?.startsWith("image/")) {
                toast.info("Chỉ hỗ trợ file ảnh");
                continue;
            }
            if (f.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
                toast.info(`Ảnh quá lớn (tối đa ${MAX_IMAGE_SIZE_MB}MB/ảnh)`);
                continue;
            }
            valid.push(f);
        }

        if (valid.length === 0) return;

        setSelectedImages((curr) => {
            const existingKeys = new Set(curr.map((it) => `${it.file.name}-${it.file.size}-${it.file.lastModified}`));
            const next = [...curr];

            for (const f of valid) {
                const sig = `${f.name}-${f.size}-${f.lastModified}`;
                if (existingKeys.has(sig)) continue;
                if (keptImages.length + next.length >= MAX_IMAGES) break;
                existingKeys.add(sig);
                next.push({
                    key: `${sig}-${Math.random().toString(16).slice(2)}`,
                    file: f,
                    previewUrl: URL.createObjectURL(f),
                });
            }

            if (keptImages.length + curr.length + valid.length > MAX_IMAGES) {
                toast.info(`Tối đa ${MAX_IMAGES} ảnh cho mỗi đánh giá`);
            }
            return next;
        });
    };

    const removeSelectedImage = (key: string) => {
        setSelectedImages((curr) => {
            const found = curr.find((it) => it.key === key);
            if (found) URL.revokeObjectURL(found.previewUrl);
            return curr.filter((it) => it.key !== key);
        });
    };

    const removeKeptImage = (url: string) => {
        setKeptImages((curr) => curr.filter((x) => x !== url));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productId || !canSubmit) return;
        setSubmitting(true);
        setSubmitError(null);
        try {
            if (editingId) {
                const payload = new FormData();
                payload.append("rating", String(form.rating));
                payload.append("comment", form.comment.trim());
                payload.append("keepImages", JSON.stringify(keptImages));
                selectedImages.forEach((it) => payload.append("images", it.file));

                await reviewService.updateReview(editingId, payload);
                toast.success("Đã cập nhật đánh giá");
            } else {
                const payload = new FormData();
                payload.append("product", productId);
                payload.append("rating", String(form.rating));
                payload.append("comment", form.comment.trim());
                selectedImages.forEach((it) => payload.append("images", it.file));

                await reviewService.addReview(payload);
                toast.success("Đã thêm đánh giá");
            }
            await fetchReviews();
            resetForm();
            setShowModal(false);
        } catch (err: any) {
            console.error("[ProductReview] submit error", err);
            const msg = err?.response?.data?.message || err?.message || "Không thể lưu đánh giá";
            toast.error(String(msg));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId?: string) => {
        if (!reviewId) return;
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
            <span key={i} className={i < val ? "star filled" : "star"}><Icon name="star" /></span>
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
                    {!isAdmin && (
                        <Button
                            variant="secondary"
                            type="button"
                            onClick={() => {
                                if (!viewerCustomerId) {
                                    toast.info("Vui lòng đăng nhập để đánh giá sản phẩm");
                                    return;
                                }
                                resetForm();
                                setShowModal(true);
                            }}
                        >
                            + Đánh giá
                        </Button>
                    )}
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
                                <div className="review-content">
                                    <div className="review-comment">{rev.comment}</div>
                                    <div className="review-stars">{renderStars(rev.rating)}</div>
                                </div>
                                {
                                    Array.isArray(rev.images) && rev.images.length > 0 && (
                                        <div className="review-images" aria-label="Ảnh đánh giá">
                                            {rev.images.filter(Boolean).map((url, idx) => (
                                                <button
                                                    key={`${reviewId}-img-${idx}`}
                                                    className="review-image-link"
                                                    aria-label={`Ảnh ${idx + 1}`}
                                                    type="button"
                                                    onClick={() => setImageViewerUrl(toPublicImageUrl(url))}
                                                >
                                                    <img className="review-image" src={toPublicImageUrl(url)} alt={`review-${idx + 1}`} />
                                                </button>
                                            ))}
                                        </div>
                                    )
                                }
                                {
                                    isOwner && (
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
                                                            setKeptImages(Array.isArray(rev.images) ? rev.images.filter(Boolean) : []);
                                                            clearSelectedImages();
                                                            setHoverRating(null);
                                                            setSubmitError(null);
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
                                    )
                                }
                            </div>
                        );
                    })
                )}
            </div>

            {
                !loading && reviews.length > PAGE_SIZE && (
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
                )
            }

            {
                showModal && (
                    <div className="review-modal-backdrop" onClick={closeModal}>
                        <div className="review-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-review-header">
                                <h3>{editingId ? "Cập nhật đánh giá" : "Thêm đánh giá"}</h3>
                                <button className="close" onClick={closeModal}>×</button>
                            </div>
                            <form onSubmit={handleSubmit} className="modal-form">
                                <div className="form-row">
                                    <label>Đánh giá</label>
                                    <div className="rating-picker" role="radiogroup" aria-label="Đánh giá">
                                        {[1, 2, 3, 4, 5].map((n) => {
                                            const active = (hoverRating ?? form.rating) >= n;
                                            return (
                                                <button
                                                    key={n}
                                                    type="button"
                                                    className={`rating-star ${active ? "active" : ""}`}
                                                    onMouseEnter={() => setHoverRating(n)}
                                                    onMouseLeave={() => setHoverRating(null)}
                                                    onFocus={() => setHoverRating(n)}
                                                    onBlur={() => setHoverRating(null)}
                                                    onClick={() => setForm((f) => ({ ...f, rating: n }))}
                                                    disabled={submitting}
                                                    aria-label={`${n} sao`}
                                                    aria-pressed={form.rating === n}
                                                >
                                                    <Icon name="star" />
                                                </button>
                                            );
                                        })}
                                        <span className="rating-text">{form.rating}/5</span>
                                    </div>
                                    <div className="rating-hint">Chỉ có thể đánh giá khi đã mua sản phẩm.</div>
                                </div>

                                <div className="form-row">
                                    <label>Nhận xét</label>
                                    <textarea
                                        className="text-review"
                                        value={form.comment}
                                        onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                                        placeholder="Chia sẻ trải nghiệm của bạn..."
                                        rows={3}
                                    />
                                </div>

                                <div className="form-row">
                                    <label>Ảnh đánh giá (tối đa {MAX_IMAGES})</label>

                                    {(keptImages.length > 0 || selectedImages.length > 0) && (
                                        <div className="review-image-previews" aria-label="Ảnh đã chọn">
                                            {keptImages.map((url) => (
                                                <div key={`kept-${url}`} className="review-image-preview">
                                                    <img className="review-image-preview-img" src={toPublicImageUrl(url)} alt="review" />
                                                    <button
                                                        type="button"
                                                        className="review-image-remove"
                                                        onClick={() => removeKeptImage(url)}
                                                        disabled={submitting}
                                                        aria-label="Xóa ảnh"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}

                                            {selectedImages.map((it) => (
                                                <div key={it.key} className="review-image-preview">
                                                    <img className="review-image-preview-img" src={it.previewUrl} alt={it.file.name} />
                                                    <button
                                                        type="button"
                                                        className="review-image-remove"
                                                        onClick={() => removeSelectedImage(it.key)}
                                                        disabled={submitting}
                                                        aria-label="Xóa ảnh"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <label className="upload-image-btn">
                                        Chọn ảnh
                                        <input
                                            className="review-image-input"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handlePickImages}
                                            disabled={submitting}
                                            hidden
                                        />
                                    </label>

                                </div>

                                <div className="form-actions">
                                    <button type="button" className="btn ghost" onClick={closeModal}>Hủy</button>
                                    <Button type="submit" variant="submit" disabled={!canSubmit || submitting}>
                                        {submitting ? "Đang lưu..." : editingId ? "Cập nhật" : "Gửi đánh giá"}
                                    </Button>
                                </div>

                                {submitError && <div className="review-submit-error">{submitError}</div>}
                            </form>
                        </div>
                    </div>
                )
            }

            {imageViewerUrl && (
                <div className="image-viewer-backdrop" onClick={() => setImageViewerUrl(null)}>
                    <div className="image-viewer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Xem ảnh">
                        <button className="image-viewer-close" type="button" onClick={() => setImageViewerUrl(null)} aria-label="Đóng">
                            ×
                        </button>
                        <img className="image-viewer-img" src={imageViewerUrl} alt="review" />
                    </div>
                </div>
            )}
        </div >
    );
}
