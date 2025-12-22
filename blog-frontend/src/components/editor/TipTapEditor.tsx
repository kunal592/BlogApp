"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { motion } from "framer-motion";

interface TipTapEditorProps {
    content?: string;
    onChange?: (content: string) => void;
    placeholder?: string;
}

export function TipTapEditor({
    content = "",
    onChange,
    placeholder = "Start writing your story..."
}: TipTapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: "is-editor-empty",
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "rounded-lg max-w-full",
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-[var(--accent)] underline",
                },
            }),
            Underline,
        ],
        content,
        editorProps: {
            attributes: {
                class: "prose prose-invert prose-lg max-w-none focus:outline-none min-h-[50vh]",
            },
        },
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
    });

    if (!editor) return null;

    return (
        <div className="editor-container">
            {/* Toolbar */}
            <div className="sticky top-20 z-10 glass-subtle rounded-xl p-2 mb-6 flex items-center gap-1 flex-wrap">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive("bold")}
                    title="Bold"
                >
                    B
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive("italic")}
                    title="Italic"
                >
                    <em>I</em>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive("underline")}
                    title="Underline"
                >
                    <u>U</u>
                </ToolbarButton>

                <div className="w-px h-6 bg-white/10 mx-2" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    active={editor.isActive("heading", { level: 1 })}
                    title="Heading 1"
                >
                    H1
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive("heading", { level: 2 })}
                    title="Heading 2"
                >
                    H2
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    active={editor.isActive("heading", { level: 3 })}
                    title="Heading 3"
                >
                    H3
                </ToolbarButton>

                <div className="w-px h-6 bg-white/10 mx-2" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive("bulletList")}
                    title="Bullet List"
                >
                    •
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive("orderedList")}
                    title="Numbered List"
                >
                    1.
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive("blockquote")}
                    title="Quote"
                >
                    ❝
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    active={editor.isActive("codeBlock")}
                    title="Code Block"
                >
                    {"</>"}
                </ToolbarButton>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />

            {/* Editor Styles */}
            <style jsx global>{`
        .ProseMirror {
          min-height: 50vh;
          padding: 1rem 0;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: rgba(255, 255, 255, 0.3);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .ProseMirror h2 {
          font-size: 1.875rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .ProseMirror h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .ProseMirror p {
          font-size: 1.125rem;
          line-height: 1.75;
          margin-bottom: 1rem;
        }
        .ProseMirror blockquote {
          border-left: 2px solid var(--accent);
          padding-left: 1.5rem;
          margin: 1.5rem 0;
          font-style: italic;
        }
        .ProseMirror code {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: monospace;
        }
        .ProseMirror pre {
          background: rgba(255, 255, 255, 0.05);
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        .ProseMirror li {
          margin: 0.25rem 0;
        }
      `}</style>
        </div>
    );
}

function ToolbarButton({
    onClick,
    active,
    title,
    children,
}: {
    onClick: () => void;
    active: boolean;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            title={title}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${active
                    ? "bg-[var(--accent)] text-black"
                    : "text-[var(--muted)] hover:text-white hover:bg-white/5"
                }`}
        >
            {children}
        </motion.button>
    );
}
