import { useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";

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
    onImagesChange: (files: File[]) => void;
};

const FontSize = TextStyle.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            fontSize: {
                default: null,
                parseHTML: (element) => {
                    const size = (element as HTMLElement).style.fontSize;
                    return size || null;
                },
                renderHTML: (attributes) => {
                    if (!attributes.fontSize) return {};
                    return {
                        style: `font-size: ${attributes.fontSize}`,
                    };
                },
            },
            fontFamily: {
                default: null,
                parseHTML: (element) => {
                    const family = (element as HTMLElement).style.fontFamily;
                    return family || null;
                },
                renderHTML: (attributes) => {
                    if (!attributes.fontFamily) return {};
                    return {
                        style: `font-family: ${attributes.fontFamily}`,
                    };
                },
            },
        };
    },
});

const looksLikeHtml = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value);

const toHtmlContent = (value: string) => {
    const v = value ?? "";
    if (!v.trim()) return "";
    if (looksLikeHtml(v)) return v;
    // Convert plain text into simple HTML for TipTap
    const escaped = v
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    return `<p>${escaped.replace(/\n/g, "<br />")}</p>`;
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
    onImagesChange,
}: PostFormModalProps) {
    if (!isOpen) return null;

    const [fontSize, setFontSize] = useState<string>("16px");
    const [fontFamily, setFontFamily] = useState<string>("");
    const initialContent = useMemo(() => toHtmlContent(content), [content]);

    const editor = useEditor({
        extensions: [StarterKit, Underline, FontSize, Color],
        content: initialContent,
        onUpdate: ({ editor }) => {
            onContentChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "post-editor",
            },
        },
    });

    useEffect(() => {
        if (!editor) return;
        const next = toHtmlContent(content);
        // Avoid resetting selection while typing
        if (editor.getHTML() !== next) {
            editor.commands.setContent(next || "", false);
        }
    }, [editor, content]);

    useEffect(() => {
        if (!editor) return;
        const syncToolbar = () => {
            const attrs = editor.getAttributes("textStyle") as any;
            setFontSize(attrs?.fontSize || "16px");
            setFontFamily(attrs?.fontFamily || "");
        };
        syncToolbar();
        editor.on("selectionUpdate", syncToolbar);
        editor.on("transaction", syncToolbar);
        return () => {
            editor.off("selectionUpdate", syncToolbar);
            editor.off("transaction", syncToolbar);
        };
    }, [editor]);

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
                                <button
                                    type="button"
                                    className={"post-editor-btn" + (editor?.isActive("bold") ? " active" : "")}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => editor?.chain().focus().toggleBold().run()}
                                    disabled={!editor}
                                >
                                    B
                                </button>
                                <button
                                    type="button"
                                    className={"post-editor-btn" + (editor?.isActive("italic") ? " active" : "")}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                                    disabled={!editor}
                                >
                                    I
                                </button>
                                <button
                                    type="button"
                                    className={"post-editor-btn" + (editor?.isActive("underline") ? " active" : "")}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                                    disabled={!editor}
                                >
                                    U
                                </button>

                                <select
                                    className="post-editor-select"
                                    value={fontFamily}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setFontFamily(v);
                                        editor?.chain().focus().setMark("textStyle", { fontFamily: v || null }).run();
                                    }}
                                    disabled={!editor}
                                    aria-label="Font chữ"
                                >
                                    <option value="">Mặc định</option>
                                    <option value="serif">Serif</option>
                                    <option value="monospace">Monospace</option>
                                </select>

                                <select
                                    className="post-editor-select"
                                    value={fontSize}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setFontSize(v);
                                        editor?.chain().focus().setMark("textStyle", { fontSize: v }).run();
                                    }}
                                    disabled={!editor}
                                    aria-label="Cỡ chữ"
                                >
                                    <option value="12px">12</option>
                                    <option value="14px">14</option>
                                    <option value="16px">16</option>
                                    <option value="18px">18</option>
                                    <option value="20px">20</option>
                                    <option value="24px">24</option>
                                    <option value="28px">28</option>
                                    <option value="32px">32</option>
                                </select>

                                <input
                                    className="post-editor-color"
                                    type="color"
                                    value={(editor?.getAttributes("textStyle") as any)?.color || "#050505"}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
                                    disabled={!editor}
                                    aria-label="Màu chữ"
                                />
                            </div>

                            <div className="post-editor-content">
                                <EditorContent editor={editor} />
                            </div>
                        </div>
                    </div>

                    <div className="post-form-row">
                        <label>Ảnh (tuỳ chọn)</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => onImagesChange(Array.from(e.target.files || []))}
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
