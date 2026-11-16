import { useEffect, useRef, useState } from 'react';
import {
    CheckCircle2,
    Image as ImageIcon,
    Link as LinkIcon,
    Trash2,
    Upload,
    UploadCloud,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface SingleImageUploadProps {
    file: File | null;
    onFileChange: (file: File | null) => void;
    existingUrl?: string | null;
    onExistingUrlChange?: (url: string | null) => void;
    label?: string;
    description?: string;
    allowUrlInput?: boolean;
    accept?: string;
    maxSizeMB?: number;
    className?: string;
}

export function SingleImageUpload({
    file,
    onFileChange,
    existingUrl = null,
    onExistingUrlChange,
    label = 'Single Image Upload',
    description = 'Upload an image file (PNG, JPG, WEBP up to 5MB)',
    allowUrlInput = true,
    accept = 'image/*',
    maxSizeMB = 5,
    className = '',
}: SingleImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [useUrlMode, setUseUrlMode] = useState(false);
    const [urlInputValue, setUrlInputValue] = useState(existingUrl || '');
    const [isDragging, setIsDragging] = useState(false);

    // Keep urlInputValue synced if existingUrl changes externally
    useEffect(() => {
        if (existingUrl) {
            setUrlInputValue(existingUrl);
        }
    }, [existingUrl]);

    // Generate local preview URL when file changes
    useEffect(() => {
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setPreviewUrl(null);
        }
    }, [file]);

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            onFileChange(selected);
            if (onExistingUrlChange) {
                onExistingUrlChange(null);
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile && droppedFile.type.startsWith('image/')) {
            onFileChange(droppedFile);
            if (onExistingUrlChange) {
                onExistingUrlChange(null);
            }
        }
    };

    const handleClear = () => {
        onFileChange(null);
        if (onExistingUrlChange) {
            onExistingUrlChange(null);
        }
        setUrlInputValue('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const currentImageSrc = previewUrl || existingUrl;

    return (
        <div
            className={`space-y-3 rounded-xl border border-[#dbdade]/80 bg-[#f8f7fa]/60 p-4 dark:border-[#434968] dark:bg-[#25293c]/50 ${className}`}
        >
            {/* Header: Label, description, and optional URL toggle */}
            <div className="flex items-start justify-between gap-2">
                <div>
                    <Label className="flex items-center gap-1.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                        <ImageIcon className="size-4 text-[#7367F0]" />
                        <span>{label}</span>
                    </Label>
                    {description && (
                        <p className="text-[11px] text-[#a5a3ae] mt-0.5">{description}</p>
                    )}
                </div>

                {allowUrlInput && (
                    <button
                        type="button"
                        onClick={() => setUseUrlMode(!useUrlMode)}
                        className="text-[11px] font-medium text-[#7367F0] hover:underline flex items-center gap-1 shrink-0"
                    >
                        <LinkIcon className="size-3" />
                        <span>{useUrlMode ? 'Switch to File Upload' : 'Or paste URL'}</span>
                    </button>
                )}
            </div>

            {useUrlMode ? (
                /* URL Input Mode */
                <div className="flex gap-2">
                    <Input
                        placeholder="https://example.com/image.jpg"
                        value={urlInputValue}
                        onChange={(e) => {
                            setUrlInputValue(e.target.value);
                            if (onExistingUrlChange) {
                                onExistingUrlChange(e.target.value);
                            }
                        }}
                        className="bg-white text-xs dark:bg-[#2f3349]"
                    />
                    {urlInputValue && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleClear}
                        >
                            Clear
                        </Button>
                    )}
                </div>
            ) : (
                /* File Upload Mode */
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {currentImageSrc ? (
                        /* Selected / Existing Image Card */
                        <div className="flex items-center gap-4 rounded-lg border border-[#dbdade] bg-white p-3 dark:border-[#434968] dark:bg-[#2f3349]">
                            <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border-2 border-[#7367F0] shadow-xs">
                                <img
                                    src={currentImageSrc}
                                    alt="Uploaded Preview"
                                    className="size-full object-cover"
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200 truncate">
                                        {file ? file.name : 'Current Image'}
                                    </span>
                                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                </div>
                                <p className="text-[11px] text-[#a5a3ae] mt-0.5">
                                    {file
                                        ? `${formatSize(file.size)} • Ready to upload`
                                        : 'Saved image'}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="h-7 px-2.5 text-xs text-[#7367F0] border-[#7367F0]/30 hover:bg-[#7367F0]/10"
                                    >
                                        <Upload className="mr-1 size-3" />
                                        Change File
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleClear}
                                        className="h-7 px-2 text-xs text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
                                    >
                                        <Trash2 className="mr-1 size-3" />
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Empty Dropzone */
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${isDragging
                                    ? 'border-[#7367F0] bg-[#7367F0]/10 scale-[1.01]'
                                    : 'border-[#dbdade] bg-white hover:border-[#7367F0] hover:bg-[#7367F0]/5 dark:border-[#434968] dark:bg-[#2f3349]'
                                }`}
                        >
                            <div className="flex size-11 items-center justify-center rounded-full bg-[#7367F0]/10 text-[#7367F0]">
                                <UploadCloud className="size-6" />
                            </div>
                            <div className="mt-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                Click to upload image, or drag and drop
                            </div>
                            <p className="mt-0.5 text-[11px] text-[#a5a3ae]">
                                SVG, PNG, JPG or WEBP (Max {maxSizeMB}MB)
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SingleImageUpload;
