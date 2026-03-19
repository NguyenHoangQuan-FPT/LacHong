import { useEffect, useRef, useState } from "react";
import Icon from "../../components/common/icons/Icon";
import "../../assets/styles/PostCommentModal.css";
import { useTranslation } from "react-i18next";

type CommentItem = {
    _id?: string;
    id?: string;
    post?: string;
    content?: string;
    createdAt?: string;
    updatedAt?: string;
    parentComment?: string | { _id?: string; id?: string } | null;
    customer?: { _id?: string; id?: string; fullName?: string; avatar?: string } | string;
    store?: { _id?: string; id?: string; storeName?: string; avatar?: string } | string;
};

type PostCommentsModalProps = {
    isOpen: boolean;
    submitting: boolean;
    postTitle?: string;
    comments: CommentItem[];
    commentLikesById: Record<string, { count: number; liked: boolean }>;
    onToggleLikeComment: (commentId: string) => void;
    viewerCustomerId: string | null;
    viewerStoreId: string | null;
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
    postTitle: _postTitle,
    comments,
    commentLikesById,
    onToggleLikeComment,
    viewerCustomerId,
    viewerStoreId,
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

    const { t } = useTranslation();

    const [openCommentActionsId, setOpenCommentActionsId] = useState<string | null>(null);
    const [expandedRepliesByParentId, setExpandedRepliesByParentId] = useState<Record<string, boolean>>({});
    const commentsWrapRef = useRef<HTMLDivElement | null>(null);
    const prevCommentsCountRef = useRef<number>(comments?.length || 0);

    useEffect(() => {
        const body = document.body;
        const prevOverflow = body.style.overflow;
        const prevPaddingRight = body.style.paddingRight;

        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        body.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${scrollbarWidth}px`;
        }

        return () => {
            body.style.overflow = prevOverflow;
            body.style.paddingRight = prevPaddingRight;
        };
    }, []);

    useEffect(() => {
        if (!openCommentActionsId) return;
        const handleDocClick = () => setOpenCommentActionsId(null);
        document.addEventListener("click", handleDocClick);
        return () => document.removeEventListener("click", handleDocClick);
    }, [openCommentActionsId]);

    useEffect(() => {
        const el = commentsWrapRef.current;
        if (!el) return;
        const prev = prevCommentsCountRef.current;
        const next = comments?.length || 0;
        prevCommentsCountRef.current = next;
        if (next <= prev) return;
        requestAnimationFrame(() => {
            el.scrollTop = el.scrollHeight;
        });
    }, [comments?.length]);

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
        let repliedName: string | null = null;
        if (depth > 0 && c.parentComment) {
            const parentId = extractId((c as any).parentComment);
            const parent = comments.find((p) => extractId(p._id || p.id) === parentId);
            if (parent) {
                repliedName = typeof parent.customer === "object" && parent.customer?.fullName
                    ? parent.customer.fullName
                    : typeof parent.store === "object" && parent.store?.storeName
                        ? parent.store.storeName
                        : null;
            }
        }
        const cid = commentIdOf(c, index);
        const name =
            typeof c.customer === "object" && c.customer?.fullName
                ? c.customer.fullName
                : typeof c.store === "object" && c.store?.storeName
                    ? c.store.storeName
                    : t('post.anonymous');
        const avatar =
            typeof c.customer === "object" ? normalizeImageUrl((c.customer as any)?.avatar) :
                typeof c.store === "object" ? normalizeImageUrl((c.store as any)?.avatar) :
                    null;
        const commentCustomerId = extractId((c as any).customer);
        const commentStoreId = extractId((c as any).store);
        const isMine =
            (viewerCustomerId && commentCustomerId && String(viewerCustomerId) === String(commentCustomerId)) ||
            (viewerStoreId && commentStoreId && String(viewerStoreId) === String(commentStoreId));
        const likeState = commentLikesById[cid] || { count: 0, liked: false };
        const children = childrenByParentId[cid] || [];
        const expanded = !!expandedRepliesByParentId[cid]; // Check if replies are expanded
        const visibleChildren = expanded ? children : children.slice(0, 1); // Show only the first reply if not expanded
        const hiddenCount = Math.max(0, children.length - visibleChildren.length); // Calculate hidden replies

        // Helper: tìm id comment gốc (bậc 0) cho mọi comment
        function getRootCommentId(comment: CommentItem): string {
            let current = comment;
            let parentId = extractId(current.parentComment);
            while (parentId) {
                const parent = comments.find((p) => extractId(p._id || p.id) === parentId);
                if (!parent) break;
                if (!parent.parentComment) return extractId(parent._id || parent.id) || cid;
                current = parent;
                parentId = extractId(current.parentComment);
            }
            return extractId(comment._id || comment.id) || cid;
        }
        return (
            <div key={cid} className={"post-comment" + (depth > 0 ? " post-comment-reply" : "")}>
                <div className="post-comment-avatar">
                    {!!avatar && (
                        <img
                            src={avatar}
                            alt={name || t('post.avatarAlt')}
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                        />
                    )}
                </div>
                <div className="post-comment-body">
                    <div className="post-comment-bubble">
                        <div className="post-comment-author">{name || t('post.anonymous')}</div>
                        <div className="post-comment-text">
                            {repliedName && (
                                <span className="post-comment-reply-to"><strong>{repliedName}</strong> </span>
                            )}
                            {c.content}
                        </div>
                        {!!cid && (
                            <div className="post-comment-actions">
                                <button
                                    type="button"
                                    className={"post-comment-like-btn" + (likeState.liked ? " active" : "")}
                                    onClick={() => onToggleLikeComment(cid)}
                                    disabled={submitting}
                                >
                                    <Icon name="hearted" size={14} /> {likeState.count}
                                </button>
                                <button
                                    type="button"
                                    className="post-comment-reply-btn"
                                    onClick={() => onReply(getRootCommentId(c), name)}
                                    disabled={submitting}
                                >
                                    {t('postComments.reply')}
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
                                            aria-label={t('postComments.commentOptionsAria')}
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
                                                    <Icon name="pencil" /> {t('post.edit')}
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
                                                    <Icon name="trash" /> {t('post.delete')}
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
                                    {t('postComments.viewMoreReplies', { count: hiddenCount })}
                                </button>
                            )}

                            {children.length > 1 && expanded && (
                                <button
                                    type="button"
                                    className="post-comment-show-more"
                                    onClick={() => setExpandedRepliesByParentId((m) => ({ ...m, [cid]: false }))}
                                    disabled={submitting}
                                >
                                    {t('postComments.collapse')}
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
            <div className="post-modals" onClick={(e) => e.stopPropagation()}>
                <div className="post-modal-header">
                    <h3>{t('postComments.title')}</h3>
                    <button
                        type="button"
                        className="post-modal-close"
                        onClick={() => !submitting && onClose()}
                        aria-label={t('postComments.closeAria')}
                    >
                        ×
                    </button>
                </div>
                <div className="post-comments" ref={commentsWrapRef}>
                    {roots.length === 0 && (
                        <div className="post-comments-empty">{t('postComments.empty')}</div>
                    )}
                    {roots.map((c, i) => renderComment(c, i, 0))}

                    <div className="post-comment-form">
                        <div className="post-comment-input-col">
                            {!!editingCommentId && (
                                <div className="post-replying-banner">
                                    <span>
                                        {t('postComments.editing')}
                                    </span>
                                    <button
                                        type="button"
                                        className="post-reply-cancel"
                                        onClick={onCancelEdit}
                                        disabled={submitting}
                                    >
                                        {t('postComments.cancelEdit')}
                                    </button>
                                </div>
                            )}
                            {!!replyToCommentId && (
                                <div className="post-replying-banner">
                                    <span>
                                        {t('postComments.replyingTo')} <strong>{replyToCommentName || ""}</strong>
                                    </span>
                                    <button
                                        type="button"
                                        className="post-reply-cancel"
                                        onClick={onCancelReply}
                                        disabled={submitting}
                                    >
                                        {t('postComments.cancel')}
                                    </button>
                                </div>
                            )}
                            <div className="post-comment-input-wrap">
                                <input
                                    id="comment-input-popup"
                                    className="post-comment-input"
                                    placeholder={editingCommentId
                                        ? t('postComments.placeholderEdit')
                                        : replyToCommentId && replyToCommentName
                                            ? t('postComments.placeholderReply', { name: replyToCommentName })
                                            : t('postComments.placeholderWrite')}
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
                                    aria-label={t('postComments.sendAria')}
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
