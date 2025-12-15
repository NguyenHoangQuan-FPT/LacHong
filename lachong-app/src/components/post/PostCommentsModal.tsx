import { useEffect, useState } from "react";
import Icon from "../../assets/icons/Icon";
import "../../assets/styles/PostCommentModal.css";

type CommentItem = {
    _id?: string;
    id?: string;
    post?: string;
    content?: string;
    createdAt?: string;
    updatedAt?: string;
    parentComment?: string | { _id?: string; id?: string } | null;
    customer?: { _id?: string; id?: string; fullName?: string; avatar?: string } | string;
};

type PostCommentsModalProps = {
    isOpen: boolean;
    submitting: boolean;
    postTitle?: string;
    comments: CommentItem[];
    commentLikesById: Record<string, { count: number; liked: boolean }>;
    onToggleLikeComment: (commentId: string) => void;
    viewerCustomerId: string | null;
    replyToCommentId: string | null;
    replyToCommentName: string | null;
    onReply: (commentId: string, customerName?: string) => void;
    onCancelReply: () => void;
    editingCommentId: string | null;
    onEdit: (commentId: string, currentContent?: string) => void;
    onCancelEdit: () => void;
    onDelete: (commentId: string) => void;
    draft: string;
    onDraftChange: (value: string) => void;
    onSubmit: () => void;
    onClose: () => void;
};

function extractId(value: any): string | null {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object") return String(value._id || value.id || "") || null;
    return null;
}

function normalizeImageUrl(url?: string | null): string | null {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || "";
    const assetBase = apiBase.replace(/\/api\/v\d+\/?$/, "").replace(/\/$/, "");
    return assetBase ? assetBase + "/" + String(url).replace(/^\//, "") : url;
}

export default function PostCommentsModal({
    isOpen,
    submitting,
    postTitle,
    comments,
    commentLikesById,
    onToggleLikeComment,
    viewerCustomerId,
    replyToCommentId,
    replyToCommentName,
    onReply,
    onCancelReply,
    editingCommentId,
    onEdit,
    onCancelEdit,
    onDelete,
    draft,
    onDraftChange,
    onSubmit,
    onClose,
}: PostCommentsModalProps) {
    if (!isOpen) return null;

    const [openCommentActionsId, setOpenCommentActionsId] = useState<string | null>(null);
    const [expandedRepliesByParentId, setExpandedRepliesByParentId] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!openCommentActionsId) return;
        const handleDocClick = () => setOpenCommentActionsId(null);
        document.addEventListener("click", handleDocClick);
        return () => document.removeEventListener("click", handleDocClick);
    }, [openCommentActionsId]);

    const commentIdOf = (c: CommentItem, index: number) => {
        const raw = c._id || c.id;
        return raw ? String(raw) : `comment-${index}`;
    };

    const parentIdOf = (c: CommentItem) => extractId((c as any).parentComment);

    const childrenByParentId = comments.reduce<Record<string, CommentItem[]>>((acc, c) => {
        const pid = parentIdOf(c);
        if (!pid) return acc;
        (acc[pid] ||= []).push(c);
        return acc;
    }, {});

    const roots = comments.filter((c) => !parentIdOf(c));

    const renderComment = (c: CommentItem, index: number, depth: number) => {
        const cid = commentIdOf(c, index);
        const name = typeof c.customer === "object" ? c.customer?.fullName : undefined;
        const avatar = typeof c.customer === "object" ? normalizeImageUrl((c.customer as any)?.avatar) : null;
        const commentCustomerId = extractId((c as any).customer);
        const isMine = !!(viewerCustomerId && commentCustomerId && String(viewerCustomerId) === String(commentCustomerId));
        const likeState = commentLikesById[cid] || { count: 0, liked: false };
        const children = childrenByParentId[cid] || [];
        const expanded = !!expandedRepliesByParentId[cid];
        const visibleChildren = expanded ? children : children.slice(0, 1);
        const hiddenCount = Math.max(0, children.length - visibleChildren.length);

        return (
            <div key={cid} className={"post-comment" + (depth > 0 ? " post-comment-reply" : "")}>
                <div className="post-comment-avatar">
                    {!!avatar && (
                        <img
                            src={avatar}
                            alt={name || "avatar"}
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                        />
                    )}
                </div>
                <div className="post-comment-body">
                    <div className="post-comment-bubble">
                        <div className="post-comment-author">{name || "Ẩn danh"}</div>
                        <div className="post-comment-text">{c.content}</div>
                        {!!cid && (
                            <div className="post-comment-actions">
                                <button
                                    type="button"
                                    className={"post-comment-like-btn" + (likeState.liked ? " active" : "")}
                                    onClick={() => onToggleLikeComment(cid)}
                                    disabled={submitting}
                                >
                                    <Icon name="like" size={14} /> {likeState.count}
                                </button>
                                <button
                                    type="button"
                                    className="post-comment-reply-btn"
                                    onClick={() => onReply(cid, name)}
                                    disabled={submitting}
                                >
                                    Trả lời
                                </button>
                                {isMine && (
                                    <div className="post-actions-menu-wrap post-comment-actions-menu-wrap" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            type="button"
                                            className="post-icon-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenCommentActionsId((cur) => (cur === cid ? null : cid));
                                            }}
                                            disabled={submitting}
                                            aria-label="Tùy chọn bình luận"
                                        >
                                            <Icon name="options" />
                                        </button>

                                        {openCommentActionsId === cid && (
                                            <div className="post-actions-menu post-comment-actions-menu">
                                                <button
                                                    type="button"
                                                    className="post-actions-menu-item"
                                                    onClick={() => {
                                                        setOpenCommentActionsId(null);
                                                        onEdit(cid, c.content);
                                                    }}
                                                    disabled={submitting}
                                                >
                                                    <Icon name="pencil" /> Sửa
                                                </button>
                                                <button
                                                    type="button"
                                                    className="post-actions-menu-item danger"
                                                    onClick={() => {
                                                        setOpenCommentActionsId(null);
                                                        onDelete(cid);
                                                    }}
                                                    disabled={submitting}
                                                >
                                                    <Icon name="trash" /> Xóa
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {!!children.length && (
                        <div className="post-comment-children">
                            {visibleChildren.map((child, childIndex) => renderComment(child, childIndex, depth + 1))}

                            {hiddenCount > 0 && !expanded && (
                                <button
                                    type="button"
                                    className="post-comment-show-more"
                                    onClick={() => setExpandedRepliesByParentId((m) => ({ ...m, [cid]: true }))}
                                    disabled={submitting}
                                >
                                    Xem thêm {hiddenCount} trả lời
                                </button>
                            )}

                            {children.length > 1 && expanded && (
                                <button
                                    type="button"
                                    className="post-comment-show-more"
                                    onClick={() => setExpandedRepliesByParentId((m) => ({ ...m, [cid]: false }))}
                                    disabled={submitting}
                                >
                                    Thu gọn
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="post-modal-backdrop" onClick={() => !submitting && onClose()}>
            <div className="post-modal" onClick={(e) => e.stopPropagation()}>
                <div className="post-modal-header">
                    <h3>Bình luận</h3>
                    <button
                        type="button"
                        className="post-modal-close"
                        onClick={() => !submitting && onClose()}
                        aria-label="Đóng"
                    >
                        ×
                    </button>
                </div>

                {!!postTitle && <div className="post-comments-modal-posttitle">{postTitle}</div>}

                <div className="post-comments">
                    {roots.map((c, i) => renderComment(c, i, 0))}

                    <div className="post-comment-form">
                        <div className="post-comment-avatar" />
                        <div className="post-comment-input-col">
                            {!!editingCommentId && (
                                <div className="post-replying-banner">
                                    <span>
                                        Đang sửa bình luận
                                    </span>
                                    <button
                                        type="button"
                                        className="post-reply-cancel"
                                        onClick={onCancelEdit}
                                        disabled={submitting}
                                    >
                                        Hủy sửa
                                    </button>
                                </div>
                            )}
                            {!!replyToCommentId && (
                                <div className="post-replying-banner">
                                    <span>
                                        Đang trả lời <strong>{replyToCommentName || ""}</strong>
                                    </span>
                                    <button
                                        type="button"
                                        className="post-reply-cancel"
                                        onClick={onCancelReply}
                                        disabled={submitting}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            )}
                            <div className="post-comment-input-wrap">
                                <input
                                    id="comment-input-popup"
                                    className="post-comment-input"
                                    placeholder={editingCommentId ? "Sửa bình luận..." : "Viết bình luận..."}
                                    value={draft}
                                    onChange={(e) => onDraftChange(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            onSubmit();
                                        }
                                    }}
                                    disabled={submitting}
                                />
                                <button
                                    type="button"
                                    className="post-send-btn"
                                    onClick={onSubmit}
                                    disabled={submitting || !draft.trim()}
                                    aria-label="Gửi bình luận"
                                >
                                    ➤
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
