import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { postService } from "../../services/post.service";
import customerService from "../../services/customer.service";
import { commentService } from "../../services/comment.service";
import { likeService } from "../../services/like.service";
import "../../assets/styles/Post.css";
import Icon from "../../assets/icons/Icon";

type PostItem = {
    _id?: string;
    id?: string;
    title?: string;
    content?: string;
    image?: string | null;
    createdAt?: string;
    updatedAt?: string;
    customer?: {
        _id?: string;
        id?: string;
        fullName?: string;
    } | string;
};

type LikeItem = {
    _id?: string;
    id?: string;
    post?: string;
    customer?: { _id?: string; id?: string; fullName?: string; avatar?: string } | string;
};

type CommentItem = {
    _id?: string;
    id?: string;
    post?: string;
    content?: string;
    createdAt?: string;
    updatedAt?: string;
    customer?: { _id?: string; id?: string; fullName?: string; avatar?: string } | string;
};

function extractId(value: any): string | null {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object") return value._id || value.id || null;
    return null;
}

function normalizeImageUrl(url?: string | null): string | null {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    const base = (import.meta.env.VITE_API_BASE_URL as string) || "";
    return base ? base.replace(/\/$/, "") + "/" + String(url).replace(/^\//, "") : url;
}

export default function Post() {
    const [posts, setPosts] = useState<PostItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [viewerCustomerId, setViewerCustomerId] = useState<string | null>(null);

    const [likesByPost, setLikesByPost] = useState<Record<string, { count: number; liked: boolean }>>({});
    const [commentsByPost, setCommentsByPost] = useState<Record<string, CommentItem[]>>({});
    const [commentDraftByPost, setCommentDraftByPost] = useState<Record<string, string>>({});
    const [loadingEngagement, setLoadingEngagement] = useState<Record<string, boolean>>({});

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
    const [form, setForm] = useState<{ title: string; content: string; image: File | null }>({
        title: "",
        content: "",
        image: null,
    });

    const activeCommentsPost = useMemo(() => {
        if (!openCommentsPostId) return null;
        return posts.find((p) => String(p._id || p.id || "") === String(openCommentsPostId)) || null;
    }, [posts, openCommentsPostId]);

    const canSubmit = useMemo(() => form.title.trim().length > 0 && form.content.trim().length > 0, [form]);

    useEffect(() => {
        let cancelled = false;
        customerService
            .getProfileCustomer()
            .then((res: any) => {
                if (cancelled) return;
                const profile = res?.data?.customer ?? res?.data;
                setViewerCustomerId(extractId(profile));
            })
            .catch(() => {
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await postService.getAllPosts();
            const list: PostItem[] = Array.isArray(res?.data?.posts) ? res.data.posts : Array.isArray(res?.data) ? res.data : [];
            setPosts(list);
        } catch (err: any) {
            console.error("[Post] fetch error", err);
            toast.error(err?.response?.data?.message || "Không tải được bài viết");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchEngagementForPost = async (postId: string) => {
        setLoadingEngagement((m) => ({ ...m, [postId]: true }));
        try {
            const [likesRes, commentsRes] = await Promise.all([
                likeService.getLikesByPostId(postId),
                commentService.getCommentsByPostId(postId),
            ]);

            const likes: LikeItem[] = Array.isArray(likesRes?.data?.likes) ? likesRes.data.likes : [];
            const comments: CommentItem[] = Array.isArray(commentsRes?.data?.comments) ? commentsRes.data.comments : [];

            const liked = !!(
                viewerCustomerId &&
                likes.some((l) => {
                    const cid = extractId(l.customer);
                    return cid && String(cid) === String(viewerCustomerId);
                })
            );

            setLikesByPost((m) => ({ ...m, [postId]: { count: likes.length, liked } }));
            setCommentsByPost((m) => ({ ...m, [postId]: comments }));
        } catch (err) {
            // silently ignore per-post engagement failures
        } finally {
            setLoadingEngagement((m) => ({ ...m, [postId]: false }));
        }
    };

    useEffect(() => {
        if (!posts.length) return;
        // Load likes/comments for each post
        posts.forEach((p) => {
            const id = String(p._id || p.id || "");
            if (!id) return;
            fetchEngagementForPost(id);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [posts, viewerCustomerId]);

    const toggleLike = async (postId: string) => {
        const state = likesByPost[postId] || { count: 0, liked: false };
        try {
            if (state.liked) {
                await likeService.unLike(postId);
            } else {
                await likeService.likePost(postId);
            }
            await fetchEngagementForPost(postId);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Không thể thực hiện like");
        }
    };

    const submitComment = async (postId: string) => {
        const content = (commentDraftByPost[postId] || "").trim();
        if (!content) return;
        try {
            await commentService.addComment({ postId, content });
            setCommentDraftByPost((m) => ({ ...m, [postId]: "" }));
            await fetchEngagementForPost(postId);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Không thể bình luận");
        }
    };

    const openCreate = () => {
        setOpenCommentsPostId(null);
        setEditingId(null);
        setForm({ title: "", content: "", image: null });
        setShowModal(true);
    };

    const openEdit = (post: PostItem) => {
        setOpenCommentsPostId(null);
        setEditingId(post._id || post.id || null);
        setForm({ title: post.title || "", content: post.content || "", image: null });
        setShowModal(true);
    };

    const openCommentsPopup = async (postId: string) => {
        setShowModal(false);
        setOpenCommentsPostId(postId);
        await fetchEngagementForPost(postId);
        // Focus input on next tick
        setTimeout(() => {
            const el = document.getElementById("comment-input-popup");
            (el as HTMLInputElement | null)?.focus();
        }, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setSubmitting(true);
        try {
            if (editingId) {
                await postService.updatePost(editingId, {
                    title: form.title.trim(),
                    content: form.content.trim(),
                    image: form.image,
                });
                toast.success("Đã cập nhật bài viết");
            } else {
                await postService.createPost({
                    title: form.title.trim(),
                    content: form.content.trim(),
                    image: form.image,
                });
                toast.success("Đã tạo bài viết");
            }
            setShowModal(false);
            setForm({ title: "", content: "", image: null });
            setEditingId(null);
            await fetchPosts();
        } catch (err: any) {
            console.error("[Post] submit error", err);
            toast.error(err?.response?.data?.message || "Không thể lưu bài viết");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (postId?: string) => {
        if (!postId) return;
        if (!window.confirm("Xóa bài viết này?")) return;
        try {
            await postService.deletePost(postId);
            toast.success("Đã xóa bài viết");
            await fetchPosts();
        } catch (err: any) {
            console.error("[Post] delete error", err);
            toast.error(err?.response?.data?.message || "Không thể xóa bài viết");
        }
    };

    const formatDate = (value?: string) => {
        if (!value) return "";
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return value;
        return d.toLocaleString();
    };

    return (
        <div className="post-page">
            <div className="post-header">
                <div>
                    <h1 className="post-title">Bài viết</h1>
                    <p className="post-subtitle">Tạo, cập nhật và quản lý bài viết.</p>
                </div>
                <button type="button" className="post-btn primary" onClick={openCreate}>
                    + Thêm bài viết
                </button>
            </div>

            {loading ? (
                <div className="post-status">Đang tải bài viết...</div>
            ) : posts.length === 0 ? (
                <div className="post-status">Chưa có bài viết nào.</div>
            ) : (
                <div className="post-list">
                    {posts
                        .slice()
                        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                        .map((p) => {
                            const id = p._id || p.id;
                            const authorName =
                                typeof p.customer === "object" ? p.customer?.fullName : undefined;
                            const postCustomerId = extractId(p.customer);
                            const isOwner = !!(
                                viewerCustomerId &&
                                postCustomerId &&
                                String(viewerCustomerId) === String(postCustomerId)
                            );
                            const imageUrl = normalizeImageUrl(p.image);

                            const postId = String(id);
                            const likeState = likesByPost[postId] || { count: 0, liked: false };
                            const comments = commentsByPost[postId] || [];
                            const isEngagementLoading = !!loadingEngagement[postId];

                            return (
                                <div key={id} className="post-item">
                                    <div className="post-item-top">
                                        <div className="post-item-meta">
                                            <div className="post-item-sub">
                                                <span>{authorName || "Ẩn danh"}</span>
                                                <span className="dot">•</span>
                                                <span>{formatDate(p.createdAt)}</span>
                                            </div>
                                        </div>
                                        {isOwner && (
                                            <div className="post-actions">
                                                <button
                                                    type="button"
                                                    className="post-icon-btn"
                                                    onClick={() => openEdit(p)}
                                                    disabled={submitting}
                                                    aria-label="Chỉnh sửa"
                                                >
                                                    <Icon name="pencil" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="post-icon-btn danger"
                                                    onClick={() => handleDelete(String(id))}
                                                    disabled={submitting}
                                                    aria-label="Xóa"
                                                >
                                                    <Icon name="trash" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="post-item-title">{p.title}</div>
                                    <div className="post-content">{p.content}</div>

                                    {imageUrl && (
                                        <img className="post-image" src={imageUrl} alt={p.title || "post"} />
                                    )}


                                    <div className="post-engagement">
                                        <div className="post-counts">
                                            <span>{likeState.count} lượt thích</span>
                                            <span className="dot">•</span>
                                            <span>{comments.length} bình luận</span>
                                        </div>

                                        <div className="post-action-row">
                                            <button
                                                type="button"
                                                className={"post-action-btn" + (likeState.liked ? " active" : "")}
                                                onClick={() => toggleLike(postId)}
                                                disabled={isEngagementLoading}
                                            >
                                                👍 Thích
                                            </button>
                                            <button
                                                type="button"
                                                className="post-action-btn"
                                                onClick={() => openCommentsPopup(postId)}
                                            >
                                                💬 Bình luận
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}

            {openCommentsPostId && (
                <div
                    className="post-modal-backdrop"
                    onClick={() => !submitting && setOpenCommentsPostId(null)}
                >
                    <div className="post-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="post-modal-header">
                            <h3>Bình luận</h3>
                            <button
                                type="button"
                                className="post-modal-close"
                                onClick={() => !submitting && setOpenCommentsPostId(null)}
                                aria-label="Đóng"
                            >
                                ×
                            </button>
                        </div>

                        {activeCommentsPost?.title && (
                            <div className="post-comments-modal-posttitle">{activeCommentsPost.title}</div>
                        )}

                        <div className="post-comments">
                            {(commentsByPost[openCommentsPostId] || []).map((c) => {
                                const cid = c._id || c.id;
                                const name = typeof c.customer === "object" ? c.customer?.fullName : undefined;
                                return (
                                    <div key={cid} className="post-comment">
                                        <div className="post-comment-avatar" />
                                        <div className="post-comment-bubble">
                                            <div className="post-comment-author">{name || "Ẩn danh"}</div>
                                            <div className="post-comment-text">{c.content}</div>
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="post-comment-form">
                                <div className="post-comment-avatar" />
                                <div className="post-comment-input-wrap">
                                    <input
                                        id="comment-input-popup"
                                        className="post-comment-input"
                                        placeholder="Viết bình luận..."
                                        value={commentDraftByPost[openCommentsPostId] || ""}
                                        onChange={(e) =>
                                            setCommentDraftByPost((m) => ({
                                                ...m,
                                                [openCommentsPostId]: e.target.value,
                                            }))
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                submitComment(openCommentsPostId);
                                            }
                                        }}
                                        disabled={submitting}
                                    />
                                    <button
                                        type="button"
                                        className="post-send-btn"
                                        onClick={() => submitComment(openCommentsPostId)}
                                        disabled={submitting || !(commentDraftByPost[openCommentsPostId] || "").trim()}
                                        aria-label="Gửi bình luận"
                                    >
                                        ➤
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="post-modal-backdrop" onClick={() => !submitting && setShowModal(false)}>
                    <div className="post-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="post-modal-header">
                            <h3>{editingId ? "Cập nhật bài viết" : "Thêm bài viết"}</h3>
                            <button
                                type="button"
                                className="post-modal-close"
                                onClick={() => !submitting && setShowModal(false)}
                                aria-label="Đóng"
                            >
                                ×
                            </button>
                        </div>

                        <form className="post-form" onSubmit={handleSubmit}>
                            <div className="post-form-row">
                                <label>Tiêu đề</label>
                                <input
                                    value={form.title}
                                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                    placeholder="Nhập tiêu đề"
                                />
                            </div>

                            <div className="post-form-row">
                                <label>Nội dung</label>
                                <textarea
                                    value={form.content}
                                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                                    placeholder="Nhập nội dung"
                                    rows={5}
                                />
                            </div>

                            <div className="post-form-row">
                                <label>Ảnh (tuỳ chọn)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setForm((f) => ({ ...f, image: e.target.files?.[0] || null }))}
                                />
                            </div>

                            <div className="post-form-actions">
                                <button
                                    type="button"
                                    className="post-btn ghost"
                                    onClick={() => !submitting && setShowModal(false)}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="post-btn primary"
                                    disabled={!canSubmit || submitting}
                                >
                                    {submitting ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
