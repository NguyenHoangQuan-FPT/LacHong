type PostFormModalProps = {
    isOpen: boolean;
    submitting: boolean;
    title: string;
    content: string;
    canSubmit: boolean;
    headerTitle: string;
    submitLabel: string;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    onTitleChange: (value: string) => void;
    onContentChange: (value: string) => void;
    onImageChange: (file: File | null) => void;
};

export default function PostFormModal({
    isOpen,
    submitting,
    title,
    content,
    canSubmit,
    headerTitle,
    submitLabel,
    onClose,
    onSubmit,
    onTitleChange,
    onContentChange,
    onImageChange,
}: PostFormModalProps) {
    if (!isOpen) return null;

    return (
        <div className="post-modal-backdrop" onClick={() => !submitting && onClose()}>
            <div className="post-modal" onClick={(e) => e.stopPropagation()}>
                <div className="post-modal-header">
                    <h3>{headerTitle}</h3>
                    <button
                        type="button"
                        className="post-modal-close"
                        onClick={() => !submitting && onClose()}
                        aria-label="Đóng"
                    >
                        ×
                    </button>
                </div>

                <form className="post-form" onSubmit={onSubmit}>
                    <div className="post-form-row">
                        <label>Tiêu đề</label>
                        <input value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="Nhập tiêu đề" />
                    </div>

                    <div className="post-form-row">
                        <label>Nội dung</label>
                        <textarea
                            value={content}
                            onChange={(e) => onContentChange(e.target.value)}
                            placeholder="Nhập nội dung"
                            rows={5}
                        />
                    </div>

                    <div className="post-form-row">
                        <label>Ảnh (tuỳ chọn)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => onImageChange(e.target.files?.[0] || null)}
                            disabled={submitting}
                        />
                    </div>

                    <div className="post-form-actions">
                        <button type="button" className="post-btn ghost" onClick={() => !submitting && onClose()}>
                            Hủy
                        </button>
                        <button type="submit" className="post-btn primary" disabled={!canSubmit || submitting}>
                            {submitting ? "Đang lưu..." : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
