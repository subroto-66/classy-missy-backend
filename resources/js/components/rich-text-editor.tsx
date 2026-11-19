import { useEffect } from 'react';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Code,
    Heading2,
    Heading3,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Minus,
    Quote,
    Redo,
    RemoveFormatting,
    Strikethrough,
    Type,
    Underline as UnderlineIcon,
    Undo,
    Unlink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    editorClassName?: string;
}

interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
}

function ToolbarButton({
    onClick,
    isActive = false,
    disabled = false,
    title,
    children,
}: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                'flex size-7 items-center justify-center rounded text-xs transition-colors',
                isActive
                    ? '!bg-primary !text-white shadow-xs'
                    : 'text-neutral-600 hover:bg-primary/10 hover:text-primary dark:text-neutral-300 dark:hover:bg-[#353952] disabled:cursor-not-allowed disabled:opacity-40'
            )}
        >
            {children}
        </button>
    );
}

export function RichTextEditor({
    value = '',
    onChange,
    placeholder = 'Enter detailed product formulation, key benefits, and usage...',
    className,
    editorClassName,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [2, 3],
                },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline font-medium hover:opacity-80',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value || '',
        immediatelyRender: false,
        onUpdate: ({ editor: ed }) => {
            const html = ed.getHTML();
            onChange(html === '<p></p>' ? '' : html);
        },
    });

    useEffect(() => {
        if (!editor) return;
        const currentHtml = editor.getHTML();
        const normalizedValue = value || '';
        if (normalizedValue !== currentHtml && (normalizedValue !== '' || currentHtml !== '<p></p>')) {
            editor.commands.setContent(normalizedValue);
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Enter link URL (e.g. https://classymissy.com):', previousUrl);

        if (url === null) {
            return;
        }

        if (url.trim() === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div
            className={cn(
                'overflow-hidden rounded-lg border border-[#dbdade] bg-white transition focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 dark:border-[#434968] dark:bg-[#2f3349]',
                className
            )}
        >
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b border-[#dbdade]/70 bg-[#f8f7fa] px-2.5 py-1.5 dark:border-[#434968] dark:bg-[#25293c]">
                {/* Paragraph */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    isActive={editor.isActive('paragraph')}
                    title="Normal Paragraph"
                >
                    <Type className="size-3.5" />
                </ToolbarButton>

                {/* Headings */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 className="size-3.5" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    title="Heading 3"
                >
                    <Heading3 className="size-3.5" />
                </ToolbarButton>

                <div className="mx-1 h-4 w-px bg-[#dbdade] dark:bg-[#434968]" />

                {/* Formatting */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Bold (Ctrl+B)"
                >
                    <Bold className="size-3.5" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Italic (Ctrl+I)"
                >
                    <Italic className="size-3.5" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    title="Underline (Ctrl+U)"
                >
                    <UnderlineIcon className="size-3.5" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    title="Strikethrough"
                >
                    <Strikethrough className="size-3.5" />
                </ToolbarButton>

                <div className="mx-1 h-4 w-px bg-[#dbdade] dark:bg-[#434968]" />

                {/* Lists */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    <List className="size-3.5" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Numbered List"
                >
                    <ListOrdered className="size-3.5" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    title="Blockquote"
                >
                    <Quote className="size-3.5" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive('codeBlock')}
                    title="Code Block"
                >
                    <Code className="size-3.5" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="Horizontal Line"
                >
                    <Minus className="size-3.5" />
                </ToolbarButton>

                <div className="mx-1 h-4 w-px bg-[#dbdade] dark:bg-[#434968]" />

                {/* Link */}
                <ToolbarButton
                    onClick={setLink}
                    isActive={editor.isActive('link')}
                    title="Add / Edit Link"
                >
                    <LinkIcon className="size-3.5" />
                </ToolbarButton>

                {editor.isActive('link') && (
                    <ToolbarButton
                        onClick={() => editor.chain().focus().unsetLink().run()}
                        title="Remove Link"
                    >
                        <Unlink className="size-3.5" />
                    </ToolbarButton>
                )}

                <ToolbarButton
                    onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                    title="Clear Formatting"
                >
                    <RemoveFormatting className="size-3.5" />
                </ToolbarButton>

                <div className="mx-1 h-4 w-px bg-[#dbdade] dark:bg-[#434968]" />

                {/* Undo / Redo */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Undo (Ctrl+Z)"
                >
                    <Undo className="size-3.5" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Redo (Ctrl+Y)"
                >
                    <Redo className="size-3.5" />
                </ToolbarButton>
            </div>

            {/* Editor Area */}
            <div className="p-3 text-sm">
                <EditorContent
                    editor={editor}
                    className={cn(
                        "min-h-[140px] max-h-[320px] overflow-y-auto text-[#444050] focus:outline-none dark:text-[#cfcde4] [&_.tiptap]:min-h-[120px] [&_.tiptap]:focus:outline-none [&_.tiptap_p.is-editor-empty:first-child]:before:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child]:before:float-left [&_.tiptap_p.is-editor-empty:first-child]:before:h-0 [&_.tiptap_p.is-editor-empty:first-child]:before:text-[#a5a3ae] [&_.tiptap_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_blockquote]:my-2 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-neutral-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs dark:[&_code]:bg-neutral-800 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-[#444050] dark:[&_h2]:text-white [&_h3]:mb-1.5 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-[#444050] dark:[&_h3]:text-white [&_hr]:my-3 [&_hr]:border-[#dbdade] dark:[&_hr]:border-[#434968] [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_pre]:my-2 [&_pre]:rounded-md [&_pre]:bg-neutral-900 [&_pre]:p-2.5 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:text-neutral-100 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5",
                        editorClassName
                    )}
                />
            </div>
        </div>
    );
}
export default RichTextEditor;
