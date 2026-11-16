import { useEffect, useRef, useState } from 'react';
import {
    Images,
    Plus,
    Trash2,
    Upload,
    UploadCloud,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export interface MultipleImageUploadProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
    existingUrls?: string[];
    onExistingUrlsChange?: (urls: string[]) => void;
    label?: string;
    description?: string;
    accept?: string;
    maxFiles?: number;
    className?: string;
}

export function MultipleImageUpload({
    files = [],
    onFilesChange,
    existingUrls = [],
    onExistingUrlsChange,
    label = 'Multiple Images Upload',
    description = 'Upload multiple photos (PNG, JPG, WEBP up to 5MB each)',
    accept = 'image/*',
    maxFiles,
    className = '',
}: MultipleImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    // Create and clean up object URLs for selected File objects
    useEffect(() => {
        const objectUrls = files.map((file) => URL.createObjectURL(file));
        setFilePreviews(objectUrls);
        return () => {
            objectUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [files]);

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedList = Array.from(e.target.files || []);
        if (selectedList.length > 0) {
            const next = [...files, ...selectedList];
            onFilesChange(maxFiles ? next.slice(0, maxFiles) : next);
        }
        // Reset file input so selecting the same file again triggers change
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedList = Array.from(e.dataTransfer.files || []).filter((f) =>
            f.type.startsWith('image/')
        );
        if (droppedList.length > 0) {
            const next = [...files, ...droppedList];
            onFilesChange(maxFiles ? next.slice(0, maxFiles) : next);
        }
    };

    const handleRemoveFile = (index: number) => {
        const next = files.filter((_, i) => i !== index);
        onFilesChange(next);
    };

    const handleRemoveExisting = (index: number) => {
        if (onExistingUrlsChange) {
            const next = existingUrls.filter((_, i) => i !== index);
            onExistingUrlsChange(next);
        }
    };

    const handleClearAll = () => {
        onFilesChange([]);
        if (onExistingUrlsChange) {
            onExistingUrlsChange([]);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const totalCount = existingUrls.length + files.length;

    return (
        <div
            className={`space-y-3.5 rounded-xl border border-[#dbdade]/80 bg-[#f8f7fa]/60 p-4 dark:border-[#434968] dark:bg-[#25293c]/50 ${className}`}
        >
            {/* Header: Label, description, count badge and Action Button */}
            <div className="flex items-start justify-between gap-2">
                <div>
                    <Label className="flex items-center gap-1.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                        <Images className="size-4 text-primary" />
                        <span>{label}</span>
                        <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                            {totalCount} {totalCount === 1 ? 'photo' : 'photos'}
                        </span>
                    </Label>
                    {description && (
                        <p className="text-[11px] text-[#a5a3ae] mt-0.5">{description}</p>
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {totalCount > 0 && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAll}
                            className="h-7 px-2 text-xs text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
                        >
                            <Trash2 className="mr-1 size-3" />
                            Clear All
                        </Button>
                    )}
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-7 gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10 hover:text-primary"
                    >
                        <Plus className="size-3.5" />
                        <span>Add Photos</span>
                    </Button>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple
                onChange={handleFilesSelect}
                className="hidden"
            />

            {/* Dropzone for Multiple Files */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-4 px-3 text-center transition-all ${
                    isDragging
                        ? 'border-primary bg-primary/10 scale-[1.005]'
                        : 'border-[#dbdade]/80 bg-white hover:border-primary hover:bg-primary/5 dark:border-[#434968] dark:bg-[#2f3349]'
                }`}
            >
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-200">
                    <Upload className="size-4 text-primary" />
                    <span>Choose multiple image files or drag & drop</span>
                </div>
                <p className="mt-0.5 text-[11px] text-[#a5a3ae]">
                    Hold Ctrl (or Cmd) to select multiple images
                </p>
            </div>

            {/* Existing Saved Photos (from server database) */}
            {existingUrls.length > 0 && (
                <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-[#82808b] dark:text-[#a5a3ae] uppercase tracking-wider">
                        Saved Gallery Photos ({existingUrls.length}):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {existingUrls.map((url, i) => (
                            <div
                                key={i}
                                className="group relative aspect-square overflow-hidden rounded-lg border border-[#dbdade] bg-white shadow-xs dark:border-[#434968] dark:bg-[#2f3349]"
                            >
                                <img
                                    src={url}
                                    alt={`Saved photo ${i + 1}`}
                                    className="size-full object-cover transition-transform group-hover:scale-105"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveExisting(i)}
                                    className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-red-600/90 text-white shadow-xs transition hover:bg-red-700"
                                    title="Remove this photo"
                                >
                                    <X className="size-3.5" />
                                </button>
                                <span className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 text-center text-[9px] text-white font-medium">
                                    Photo #{i + 1}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Newly Selected Upload Files */}
            {files.length > 0 && (
                <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        New Photos Ready to Upload ({files.length}):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {files.map((file, i) => (
                            <div
                                key={i}
                                className="group relative aspect-square overflow-hidden rounded-lg border-2 border-emerald-500/60 bg-white shadow-xs dark:bg-[#2f3349]"
                            >
                                {filePreviews[i] ? (
                                    <img
                                        src={filePreviews[i]}
                                        alt={file.name}
                                        className="size-full object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex size-full items-center justify-center text-xs text-neutral-400">
                                        Loading...
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => handleRemoveFile(i)}
                                    className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-red-600/90 text-white shadow-xs transition hover:bg-red-700"
                                    title="Remove this file"
                                >
                                    <X className="size-3.5" />
                                </button>

                                <div className="absolute bottom-0 inset-x-0 bg-black/70 px-1 py-0.5 text-center text-[9px] text-white truncate font-medium">
                                    {formatSize(file.size)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default MultipleImageUpload;
