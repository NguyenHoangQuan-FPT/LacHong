import { useEffect, useMemo, useState } from "react";
import "../../assets/styles/PostForm.css";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

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
    onImagesChange: (images: (File | string)[]) => void; // string = url ảnh cũ
    images?: (File | string)[]; // truyền vào khi sửa
};


function htmlToPlainText(html: string): string {
    return html
        .replace(/<br\s*\/?>(\r\n)?/gi, '\n')
        .replace(/<\/?p[^>]*>/gi, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .trim();
}

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
    onImagesChange,
    images = [],
}: PostFormModalProps) {
    if (!isOpen) return null;

    const [selectedImages, setSelectedImages] = useState<(File | string)[]>(images);
    const initialContent = useMemo(() => htmlToPlainText(content), [content]);

    const editor = useEditor({
        extensions: [StarterKit], // Không còn Underline
        content: initialContent,
        onUpdate: ({ editor }) => {
            // Lưu content dạng plain text, loại bỏ <p>
            onContentChange(htmlToPlainText(editor.getHTML()));
        },
        editorProps: {
            attributes: {
                class: "post-editor",
            },
        },
    });


    // Khi mở modal sửa, cập nhật lại selectedImages từ props.images
    useEffect(() => {
        if (isOpen) {
            setSelectedImages(images || []);
        }
    }, [isOpen, images]);

    useEffect(() => {
        if (!editor) return;
        const next = htmlToPlainText(content);
        // Avoid resetting selection while typing
        if (editor.getHTML() !== next) {
            editor.commands.setContent(next || "");
        }
    }, [editor, content]);



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
                        <div className="post-editor-wrap">
                            <div className="post-editor-toolbar" aria-label="Định dạng nội dung">
                                {/* Đã loại bỏ các nút B, I, U */}


                            </div>

                            <div className="post-editor-content">
                                <EditorContent editor={editor} />
                            </div>
                        </div>
                    </div>

                    <div className="post-form-row">
                        <label className="upload-image-btn">Ảnh
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    setSelectedImages(prev => {
                                        const merged = [...prev, ...files];
                                        onImagesChange(merged);
                                        return merged;
                                    });
                                }}
                                disabled={submitting}
                                hidden
                            />
                        </label>
                        {selectedImages.length > 0 && (
                            <div className="post-form-preview-list">
                                {selectedImages.map((img, idx) => {
                                    const isFile = img instanceof File;
                                    const src = isFile ? URL.createObjectURL(img) : img;
                                    return (
                                        <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                                            <img
                                                src={src}
                                                alt={`preview-${idx}`}
                                                className="post-form-preview-img"
                                            />
                                            <button
                                                type="button"
                                                className="delete-image"
                                                aria-label="Xóa ảnh"
                                                onClick={() => {
                                                    setSelectedImages(prev => {
                                                        const next = prev.filter((_, i) => i !== idx);
                                                        onImagesChange(next);
                                                        return next;
                                                    });
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
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
