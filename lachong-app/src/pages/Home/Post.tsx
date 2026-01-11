import { useEffect, useMemo, useState } from "react";
import { storeService } from "../../services/store.service";
import React from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { postService } from "../../services/post.service";
import customerService from "../../services/customer.service";
import { commentService } from "../../services/comment.service";
import { likeService } from "../../services/like.service";
import likeCommentService from "../../services/likeComment.service";
import "../../assets/styles/Post.css";
import Icon from "../../components/common/icons/Icon";
import PostCommentsModal from "../../components/post/PostCommentsModal";
import PostFormModal from "../../components/post/PostForm";

type PostItem = {
    _id?: string;
    id?: string;
    title?: string;
    content?: string;
    image?: string | null;
    images?: string[];
    createdAt?: string;
    updatedAt?: string;
    customer?: {
        _id?: string;
        id?: string;
        fullName?: string;
        avatar?: string | null;
    } | string;
    store?: {
        _id?: string;
        storeName?: string;
        avatar?: string | null;
    } | string;
};

type LikeItem = {
    _id?: string;
    id?: string;
    post?: string;
    customer?: { _id?: string; id?: string; fullName?: string; avatar?: string } | string;
    store?: { _id?: string; id?: string; storeName?: string; avatar?: string } | string;
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
    store?: { _id?: string; id?: string; storeName?: string; avatar?: string } | string;
};

type LikeCommentItem = {
    _id?: string;
    id?: string;
    comment?: string;
    customer?: string | { _id?: string; id?: string };
    store?: string | { _id?: string; id?: string };
    createdAt?: string;
};

function SharePopup({ postUrl, onClose }: { postUrl: string; onClose: () => void }) {
    const shareFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank');
        onClose();
    };
    const shareZalo = () => {
        window.open(`https://zalo.me/share?url=${encodeURIComponent(postUrl)}`, '_blank');
        onClose();
    };
    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(postUrl);
            alert('Đã copy link!');
        } catch {
            alert('Không copy được link!');
        }
        onClose();
    };
    return (
        <div className="share-popup-overlay" onClick={onClose}>
            <div className="share-popup" onClick={e => e.stopPropagation()}>
                <button onClick={shareFacebook}>Chia sẻ Facebook</button>
                <button onClick={shareZalo}>Chia sẻ Zalo</button>
                <button onClick={copyLink}>Copy link</button>
                <button onClick={onClose}>Đóng</button>
            </div>
        </div>
    );
}

function ImageModal({ src, alt, onClose }: { src: string; alt?: string; onClose: () => void }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.7)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }} onClick={onClose}>
            <img
                src={src}
                alt={alt || ''}
                style={{
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    borderRadius: 8,
                    boxShadow: '0 2px 16px rgba(0,0,0,0.3)'
                }}
                onClick={e => e.stopPropagation()}
            />
        </div>
    );
}
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
    const [viewImage, setViewImage] = useState<string | null>(null);
    const [sharePostId, setSharePostId] = useState<string | null>(null);
    const [posts, setPosts] = useState<PostItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [viewerCustomerId, setViewerCustomerId] = useState<string | null>(null);
    const [viewerStoreId, setViewerStoreId] = useState<string | null>(null);

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
    const [form, setForm] = useState<{ title: string; content: string; images: File[] }>({
        title: "",
        content: "",
        images: [],
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
            .catch(() => { });
        storeService
            .getStoreInfo()
            .then((res: any) => {
                if (cancelled) return;
                const store = res?.data?.store ?? res?.data;
                setViewerStoreId(extractId(store));
            })
            .catch(() => { });
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
                (viewerCustomerId && likes.some((l) => {
                    const cid = extractId(l.customer);
                    return cid && String(cid) === String(viewerCustomerId);
                })) ||
                (viewerStoreId && likes.some((l) => {
                    const sid = extractId(l.store);
                    return sid && String(sid) === String(viewerStoreId);
                }))
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
                viewerCustomerId || viewerStoreId &&
                likeComments.some((lc) => {
                    const cid = extractId(lc.customer);
                    const sid = extractId(lc.store);
                    return (cid && String(cid) === String(viewerCustomerId)) || (sid && String(sid) === String(viewerStoreId));
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
    }, [openCommentsPostId, commentsByPost, viewerCustomerId, viewerStoreId]);

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
    }, [posts, viewerCustomerId, viewerStoreId]);

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
        setForm({ title: "", content: "", images: [] });
        setShowModal(true);
    };

    const openEdit = (post: PostItem) => {
        setOpenActionsPostId(null);
        setOpenCommentsPostId(null);
        setEditingId(post._id || post.id || null);
        // Lấy danh sách ảnh cũ (images là mảng url, image là 1 url)
        let images: string[] = [];
        if (Array.isArray(post.images) && post.images.length > 0) {
            images = post.images.map(normalizeImageUrl).filter(Boolean) as string[];
        } else if (post.image) {
            const single = normalizeImageUrl(post.image);
            if (single) images = [single];
        }
        setForm({ title: post.title || "", content: post.content || "", images: images as any });
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
                    images: form.images,
                });
                toast.success("Đã cập nhật bài viết");
            } else {
                await postService.createPost({
                    title: form.title.trim(),
                    content: form.content.trim(),
                    images: form.images,
                });
                toast.success("Đã tạo bài viết");
            }
            setShowModal(false);
            setForm({ title: "", content: "", images: [] });
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
        <>
            <div className="post-header">
                <button type="button" className="post-btn" onClick={openCreate}>
                    + Thêm bài viết
                </button>
            </div>
            <div className="post-page">
                <ToastContainer position="top-right" autoClose={2000} />

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
                                let authorName = "Ẩn danh";
                                if (typeof p.store === "object" && p.store?.storeName) {
                                    authorName = p.store.storeName;
                                } else if (typeof p.customer === "object" && p.customer?.fullName) {
                                    authorName = p.customer.fullName;
                                }
                                let avatar = null;
                                if (typeof p.store === "object" && p.store?.avatar) {
                                    avatar = normalizeImageUrl(p.store.avatar);
                                } else if (typeof p.customer === "object" && p.customer?.avatar) {
                                    avatar = normalizeImageUrl(p.customer.avatar);
                                }
                                const postCustomerId = extractId(p.customer);
                                const postStoreId = extractId(p.store);
                                const isOwner = !!(
                                    (viewerCustomerId && postCustomerId && String(viewerCustomerId) === String(postCustomerId)) ||
                                    (viewerStoreId && postStoreId && String(viewerStoreId) === String(postStoreId))
                                );
                                let imageList: string[] = [];
                                if (Array.isArray(p.images) && p.images.length > 0) {
                                    imageList = p.images.map(normalizeImageUrl).filter(Boolean) as string[];
                                } else if (p.image) {
                                    const single = normalizeImageUrl(p.image);
                                    if (single) imageList = [single];
                                }
                                const isSingleImage = imageList.length === 1;

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

                                        {/* Hiển thị tất cả ảnh trong mảng images */}
                                        {imageList.length > 0 && (
                                            <div className={isSingleImage ? "post-images-single" : "post-images-list"}>
                                                {imageList.map((img, idx) => (
                                                    <img
                                                        key={idx}
                                                        className={isSingleImage ? "post-image-large" : "post-image-small"}
                                                        src={img}
                                                        alt={p.title || "post"}
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => setViewImage(img)}
                                                    />
                                                ))}
                                            </div>
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
                                                    {likeState.liked ? (
                                                        <Icon name="hearted" />
                                                    ) : (
                                                        <Icon name="heart" />
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="post-action-btn"
                                                    onClick={() => openCommentsPopup(postId)}
                                                >
                                                    <Icon name="comment" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="post-action-btn"
                                                    onClick={() => setSharePostId(postId)}
                                                >
                                                    <Icon name="share" />
                                                </button>
                                                {sharePostId && (() => {
                                                    const post = posts.find(p => String(p._id || p.id) === String(sharePostId));
                                                    if (!post) return null;
                                                    // Giả sử đường dẫn bài post là /post/:id
                                                    const postUrl = window.location.origin + "/post/" + (post._id || post.id);
                                                    return <SharePopup postUrl={postUrl} onClose={() => setSharePostId(null)} />;
                                                })()}
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
                        viewerStoreId={viewerStoreId}
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
                        onImagesChange={(imgs) => setForm((f) => ({ ...f, images: imgs }))}
                        images={form.images}
                    />
                )}
                {viewImage && (
                    <ImageModal src={viewImage} onClose={() => setViewImage(null)} />
                )}
            </div>
        </>
    );
}
