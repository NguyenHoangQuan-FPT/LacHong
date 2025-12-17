import { useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { postService } from "../../services/post.service";
import customerService from "../../services/customer.service";
import { commentService } from "../../services/comment.service";
import { likeService } from "../../services/like.service";
import likeCommentService from "../../services/likeComment.service";
import "../../assets/styles/Post.css";
import Icon from "../../assets/icons/Icon";
import PostCommentsModal from "../../components/post/PostCommentsModal";
import PostFormModal from "../../components/post/PostForm";

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
        avatar?: string | null;
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
    parentComment?: string | { _id?: string; id?: string } | null;
    content?: string;
    createdAt?: string;
    updatedAt?: string;
    customer?: { _id?: string; id?: string; fullName?: string; avatar?: string } | string;
};

type LikeCommentItem = {
    _id?: string;
    id?: string;
    comment?: string;
    customer?: string | { _id?: string; id?: string };
    createdAt?: string;
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
    const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || "";
    const assetBase = apiBase.replace(/\/api\/v\d+\/?$/, "").replace(/\/$/, "");
    return assetBase ? assetBase + "/" + String(url).replace(/^\//, "") : url;
}

export default function Post() {
    const [posts, setPosts] = useState<PostItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [viewerCustomerId, setViewerCustomerId] = useState<string | null>(null);

    const [openActionsPostId, setOpenActionsPostId] = useState<string | null>(null);

    const [likesByPost, setLikesByPost] = useState<Record<string, { count: number; liked: boolean }>>({});
    const [commentsByPost, setCommentsByPost] = useState<Record<string, CommentItem[]>>({});
    const [commentDraftByPost, setCommentDraftByPost] = useState<Record<string, string>>({});
    const [loadingEngagement, setLoadingEngagement] = useState<Record<string, boolean>>({});

    const [commentLikesById, setCommentLikesById] = useState<Record<string, { count: number; liked: boolean }>>({});

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
    const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
    const [replyToCommentName, setReplyToCommentName] = useState<string | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
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

    useEffect(() => {
        if (!openActionsPostId) return;
        const handleDocClick = () => setOpenActionsPostId(null);
        document.addEventListener("click", handleDocClick);
        return () => document.removeEventListener("click", handleDocClick);
    }, [openActionsPostId]);

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

    const fetchLikeCommentsForComment = async (commentId: string) => {
        try {
            const res = await likeCommentService.getLikeCommentsByCommentId(commentId);
            const likeComments: LikeCommentItem[] = Array.isArray(res?.data?.likeComments) ? res.data.likeComments : [];
            const liked = !!(
                viewerCustomerId &&
                likeComments.some((lc) => {
                    const cid = extractId(lc.customer);
                    return cid && String(cid) === String(viewerCustomerId);
                })
            );
            setCommentLikesById((m) => ({ ...m, [commentId]: { count: likeComments.length, liked } }));
        } catch {
        }
    };

    useEffect(() => {
        if (!openCommentsPostId) return;
        const comments = commentsByPost[openCommentsPostId] || [];
        if (!comments.length) return;
        const ids = comments
            .map((c) => String(c._id || c.id || ""))
            .filter((id) => !!id);
        if (!ids.length) return;
        Promise.all(ids.map((id) => fetchLikeCommentsForComment(id)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openCommentsPostId, commentsByPost, viewerCustomerId]);

    const toggleLikeComment = async (commentId: string) => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            toast.error("Vui lòng đăng nhập để thích bình luận");
            return;
        }

        const state = commentLikesById[commentId] || { count: 0, liked: false };
        try {
            if (state.liked) {
                await likeCommentService.unlikeComment(commentId);
            } else {
                await likeCommentService.likeComment(commentId);
            }
            await fetchLikeCommentsForComment(commentId);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Không thể thích bình luận");
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
        setOpenActionsPostId(null);
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

        const token = localStorage.getItem("access_token");
        if (!token) {
            toast.error("Vui lòng đăng nhập để bình luận");
            return;
        }

        setLoadingEngagement((m) => ({ ...m, [postId]: true }));
        try {
            if (editingCommentId) {
                await commentService.updateComment(editingCommentId, { content });
                toast.success("Đã cập nhật bình luận");
            } else {
                await commentService.addComment({ postId, content, parentCommentId: replyToCommentId });
                toast.success("Đã gửi bình luận");
            }

            setCommentDraftByPost((m) => ({ ...m, [postId]: "" }));
            setEditingCommentId(null);
            setReplyToCommentId(null);
            setReplyToCommentName(null);
            await fetchEngagementForPost(postId);
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Không thể bình luận";
            if (/customer not found/i.test(String(msg))) {
                toast.error("Chỉ tài khoản khách hàng mới bình luận được");
            } else {
                toast.error(msg);
            }
        } finally {
            setLoadingEngagement((m) => ({ ...m, [postId]: false }));
        }
    };

    const openCreate = () => {
        setOpenActionsPostId(null);
        setOpenCommentsPostId(null);
        setEditingId(null);
        setForm({ title: "", content: "", image: null });
        setShowModal(true);
    };

    const openEdit = (post: PostItem) => {
        setOpenActionsPostId(null);
        setOpenCommentsPostId(null);
        setEditingId(post._id || post.id || null);
        setForm({ title: post.title || "", content: post.content || "", image: null });
        setShowModal(true);
    };

    const openCommentsPopup = async (postId: string) => {
        setOpenActionsPostId(null);
        setShowModal(false);
        setEditingCommentId(null);
        setReplyToCommentId(null);
        setReplyToCommentName(null);
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
        setOpenActionsPostId(null);
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
            <ToastContainer position="top-right" autoClose={2000} />
            <div className="post-header">
                <div>
                    <h1 className="post-title">Bài viết</h1>
                    <p className="post-subtitle">Tạo, cập nhật và quản lý bài viết.</p>
                </div>
                <button type="button" className="post-btn" onClick={openCreate}>
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
                            const avatar = typeof p.customer === "object" ? normalizeImageUrl(p.customer?.avatar) : null;
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
                                                <img
                                                    className="post-item-avatar"
                                                    src={
                                                        avatar || "https://www.gravatar.com/avatar/?d=mp&f=y&s=48"
                                                    }
                                                    alt={authorName || "Avatar"}
                                                    onError={(e) => {
                                                        (e.currentTarget as HTMLImageElement).src =
                                                            "https://www.gravatar.com/avatar/?d=mp&f=y&s=48";
                                                    }}
                                                />
                                                <span>{authorName || "Ẩn danh"}</span>
                                                <span className="dot">•</span>
                                                <span>{formatDate(p.createdAt)}</span>
                                            </div>
                                        </div>
                                        {isOwner && (
                                            <div className="post-actions">
                                                <div className="post-actions-menu-wrap" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        type="button"
                                                        className="post-icon-btn"
                                                        onClick={() =>
                                                            setOpenActionsPostId((cur) => (cur === postId ? null : postId))
                                                        }
                                                        disabled={submitting}
                                                        aria-label="Tùy chọn"
                                                    >
                                                        <Icon name="options" />
                                                    </button>

                                                    {openActionsPostId === postId && (
                                                        <div className="post-actions-menu">
                                                            <button
                                                                type="button"
                                                                className="post-actions-menu-item"
                                                                onClick={() => openEdit(p)}
                                                                disabled={submitting}
                                                            >
                                                                <Icon name="pencil" /> Sửa
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="post-actions-menu-item danger"
                                                                onClick={() => handleDelete(String(id))}
                                                                disabled={submitting}
                                                            >
                                                                <Icon name="trash" /> Xóa
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
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
                                                <Icon name="like" /> {likeState.liked ? "Đã thích" : "Thích"}
                                            </button>
                                            <button
                                                type="button"
                                                className="post-action-btn"
                                                onClick={() => openCommentsPopup(postId)}
                                            >
                                                <Icon name="comment" /> Bình luận
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}

            {openCommentsPostId && (
                <PostCommentsModal
                    isOpen={!!openCommentsPostId}
                    submitting={submitting}
                    postTitle={activeCommentsPost?.title}
                    comments={commentsByPost[openCommentsPostId] || []}
                    commentLikesById={commentLikesById}
                    onToggleLikeComment={toggleLikeComment}
                    viewerCustomerId={viewerCustomerId}
                    replyToCommentId={replyToCommentId}
                    replyToCommentName={replyToCommentName}
                    onReply={(commentId, customerName) => {
                        setEditingCommentId(null);
                        setReplyToCommentId(commentId);
                        setReplyToCommentName(customerName || "Ẩn danh");
                        setTimeout(() => {
                            const el = document.getElementById("comment-input-popup");
                            (el as HTMLInputElement | null)?.focus();
                        }, 0);
                    }}
                    onCancelReply={() => {
                        setReplyToCommentId(null);
                        setReplyToCommentName(null);
                    }}
                    editingCommentId={editingCommentId}
                    onEdit={(commentId, currentContent) => {
                        setReplyToCommentId(null);
                        setReplyToCommentName(null);
                        setEditingCommentId(commentId);
                        setCommentDraftByPost((m) => ({ ...m, [openCommentsPostId]: currentContent || "" }));
                        setTimeout(() => {
                            const el = document.getElementById("comment-input-popup");
                            (el as HTMLInputElement | null)?.focus();
                        }, 0);
                    }}
                    onCancelEdit={() => {
                        setEditingCommentId(null);
                        setCommentDraftByPost((m) => ({ ...m, [openCommentsPostId]: "" }));
                    }}
                    onDelete={async (commentId) => {
                        const token = localStorage.getItem("access_token");
                        if (!token) {
                            toast.error("Vui lòng đăng nhập để xóa bình luận");
                            return;
                        }
                        if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
                        try {
                            await commentService.deleteComment(commentId);
                            if (editingCommentId === commentId) setEditingCommentId(null);
                            if (replyToCommentId === commentId) {
                                setReplyToCommentId(null);
                                setReplyToCommentName(null);
                            }
                            await fetchEngagementForPost(openCommentsPostId);
                            toast.success("Đã xóa bình luận");
                        } catch (err: any) {
                            toast.error(err?.response?.data?.message || "Không thể xóa bình luận");
                        }
                    }}
                    draft={commentDraftByPost[openCommentsPostId] || ""}
                    onDraftChange={(value) =>
                        setCommentDraftByPost((m) => ({
                            ...m,
                            [openCommentsPostId]: value,
                        }))
                    }
                    onSubmit={() => submitComment(openCommentsPostId)}
                    onClose={() => {
                        setOpenCommentsPostId(null);
                        setEditingCommentId(null);
                        setReplyToCommentId(null);
                        setReplyToCommentName(null);
                    }}
                />
            )}

            {showModal && (
                <PostFormModal
                    isOpen={showModal}
                    submitting={submitting}
                    title={form.title}
                    content={form.content}
                    canSubmit={canSubmit}
                    headerTitle={editingId ? "Cập nhật bài viết" : "Thêm bài viết"}
                    submitLabel={editingId ? "Cập nhật" : "Tạo"}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                    onTitleChange={(value) => setForm((f) => ({ ...f, title: value }))}
                    onContentChange={(value) => setForm((f) => ({ ...f, content: value }))}
                    onImageChange={(file) => setForm((f) => ({ ...f, image: file }))}
                />
            )}
        </div>
    );
}
