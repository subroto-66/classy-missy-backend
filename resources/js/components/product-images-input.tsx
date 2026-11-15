import { useEffect, useRef, useState } from 'react';
import {
    CheckCircle2,
    ExternalLink,
    Image as ImageIcon,
    Images,
    Link as LinkIcon,
    Plus,
    Trash2,
    Upload,
    UploadCloud,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProductImagesInputProps {
    // Thumbnail: can be an existing string URL or a newly selected File or null
    thumbnailFile: File | null;
    onThumbnailFileChange: (file: File | null) => void;
    existingThumbnail?: string | null;
    onExistingThumbnailChange?: (url: string | null) => void;

    // Gallery: existing URLs from database + newly selected Files
    existingGallery?: string[];
    onExistingGalleryChange?: (urls: string[]) => void;
    galleryFiles: File[];
    onGalleryFilesChange: (files: File[]) => void;
}

export function ProductImagesInput({
    thumbnailFile,
    onThumbnailFileChange,
    existingThumbnail = null,
    onExistingThumbnailChange,
    existingGallery = [],
    onExistingGalleryChange,
    galleryFiles = [],
    onGalleryFilesChange,
}: ProductImagesInputProps) {
    const thumbInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const [thumbPreview, setThumbPreview] = useState<string | null>(null);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const [useLinkForThumbnail, setUseLinkForThumbnail] = useState(false);
    const [thumbnailUrlInput, setThumbnailUrlInput] = useState(existingThumbnail || '');
    const [isThumbDragging, setIsThumbDragging] = useState(false);
    const [isGalleryDragging, setIsGalleryDragging] = useState(false);

    // Generate local preview URL when thumbnailFile changes
    useEffect(() => {
        if (thumbnailFile) {
            const objectUrl = URL.createObjectURL(thumbnailFile);
            setThumbPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setThumbPreview(null);
        }
    }, [thumbnailFile]);

    // Generate local preview URLs for newly selected gallery files
    useEffect(() => {
        const objectUrls = galleryFiles.map((file) => URL.createObjectURL(file));
        setGalleryPreviews(objectUrls);
        return () => {
            objectUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [galleryFiles]);

    // Format file size
    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Handle single thumbnail selection
    const handleThumbFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onThumbnailFileChange(file);
            if (onExistingThumbnailChange) {
                onExistingThumbnailChange(null);
            }
        }
    };

    const handleThumbDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsThumbDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            onThumbnailFileChange(file);
            if (onExistingThumbnailChange) {
                onExistingThumbnailChange(null);
            }
        }
    };

    const handleClearThumbnail = () => {
        onThumbnailFileChange(null);
        if (onExistingThumbnailChange) {
            onExistingThumbnailChange(null);
        }
        if (thumbInputRef.current) {
            thumbInputRef.current.value = '';
        }
    };

    // Handle multiple gallery files selection
    const handleGalleryFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            onGalleryFilesChange([...galleryFiles, ...files]);
        }
    };

    const handleGalleryDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsGalleryDragging(false);
        const files = Array.from(e.dataTransfer.files || []).filter((f) =>
            f.type.startsWith('image/')
        );
        if (files.length > 0) {
            onGalleryFilesChange([...galleryFiles, ...files]);
        }
    };

    const handleRemoveGalleryFile = (index: number) => {
        const next = galleryFiles.filter((_, i) => i !== index);
        onGalleryFilesChange(next);
    };

    const handleRemoveExistingGallery = (index: number) => {
        if (onExistingGalleryChange) {
            const next = existingGallery.filter((_, i) => i !== index);
            onExistingGalleryChange(next);
        }
    };

    const currentThumbnailSrc = thumbPreview || existingThumbnail;

    return (
        <div className="space-y-5 rounded-xl border border-[#dbdade]/80 bg-[#f8f7fa]/60 p-4 dark:border-[#434968] dark:bg-[#25293c]/50">
            {/* THUMBNAIL IMAGE (Primary) */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="flex items-center gap-1.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                            <ImageIcon className="size-4 text-[#7367F0]" />
                            <span>Product Thumbnail (Primary Image)</span>
                        </Label>
                        <p className="text-[11px] text-[#a5a3ae]">
                            Upload main product photo (PNG, JPG, WEBP up to 5MB)
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setUseLinkForThumbnail(!useLinkForThumbnail)}
                        className="text-[11px] font-medium text-[#7367F0] hover:underline flex items-center gap-1"
                    >
                        <LinkIcon className="size-3" />
                        <span>{useLinkForThumbnail ? 'Switch to File Upload' : 'Or paste URL link'}</span>
                    </button>
                </div>

                {useLinkForThumbnail ? (
                    /* Optional URL Link Mode */
                    <div className="flex gap-2">
                        <Input
                            placeholder="https://images.unsplash.com/photo-..."
                            value={thumbnailUrlInput}
                            onChange={(e) => {
                                setThumbnailUrlInput(e.target.value);
                                if (onExistingThumbnailChange) {
                                    onExistingThumbnailChange(e.target.value);
                                }
                            }}
                            className="bg-white text-xs dark:bg-[#2f3349]"
                        />
                        {thumbnailUrlInput && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setThumbnailUrlInput('');
                                    if (onExistingThumbnailChange) onExistingThumbnailChange(null);
                                }}
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                ) : (
                    /* Primary File Upload Dropzone */
                    <div>
                        <input
                            ref={thumbInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleThumbFileSelect}
                            className="hidden"
                        />

                        {currentThumbnailSrc ? (
                            /* Preview Card */
                            <div className="flex items-center gap-4 rounded-lg border border-[#dbdade] bg-white p-3 dark:border-[#434968] dark:bg-[#2f3349]">
                                <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border-2 border-[#7367F0] shadow-xs">
                                    <img
                                        src={currentThumbnailSrc}
                                        alt="Thumbnail Preview"
                                        className="size-full object-cover"
                                    />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200 truncate">
                                            {thumbnailFile ? thumbnailFile.name : 'Current Thumbnail'}
                                        </span>
                                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                    </div>
                                    <p className="text-[11px] text-[#a5a3ae] mt-0.5">
                                        {thumbnailFile
                                            ? `${formatSize(thumbnailFile.size)} • Ready to upload`
                                            : 'Saved in product catalog'}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => thumbInputRef.current?.click()}
                                            className="h-7 px-2.5 text-xs text-[#7367F0] border-[#7367F0]/30 hover:bg-[#7367F0]/10"
                                        >
                                            <Upload className="mr-1 size-3" />
                                            Change File
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={handleClearThumbnail}
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
                                    setIsThumbDragging(true);
                                }}
                                onDragLeave={() => setIsThumbDragging(false)}
                                onDrop={handleThumbDrop}
                                onClick={() => thumbInputRef.current?.click()}
                                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                                    isThumbDragging
                                        ? 'border-[#7367F0] bg-[#7367F0]/10 scale-[1.01]'
                                        : 'border-[#dbdade] bg-white hover:border-[#7367F0] hover:bg-[#7367F0]/5 dark:border-[#434968] dark:bg-[#2f3349]'
                                }`}
                            >
                                <div className="flex size-11 items-center justify-center rounded-full bg-[#7367F0]/10 text-[#7367F0]">
                                    <UploadCloud className="size-6" />
                                </div>
                                <div className="mt-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                    Click to upload thumbnail, or drag and drop
                                </div>
                                <p className="mt-0.5 text-[11px] text-[#a5a3ae]">
                                    SVG, PNG, JPG or WEBP (Max 5MB)
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="h-px bg-[#dbdade]/60 dark:bg-[#434968]/60" />

            {/* GALLERY IMAGES (Multiple File Upload) */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="flex items-center gap-1.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                            <Images className="size-4 text-[#7367F0]" />
                            <span>Gallery Images ({existingGallery.length + galleryFiles.length})</span>
                        </Label>
                        <p className="text-[11px] text-[#a5a3ae]">
                            Upload multiple photos for packaging, texture, and angles
                        </p>
                    </div>

                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => galleryInputRef.current?.click()}
                        className="h-8 gap-1.5 text-xs text-[#7367F0] border-[#7367F0]/30 hover:bg-[#7367F0]/10 hover:text-[#7367F0]"
                    >
                        <Plus className="size-3.5" />
                        <span>Upload Photos</span>
                    </Button>
                </div>

                <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryFilesSelect}
                    className="hidden"
                />

                {/* Dropzone for Multiple Gallery Files */}
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsGalleryDragging(true);
                    }}
                    onDragLeave={() => setIsGalleryDragging(false)}
                    onDrop={handleGalleryDrop}
                    onClick={() => galleryInputRef.current?.click()}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-4 px-3 text-center transition-all ${
                        isGalleryDragging
                            ? 'border-[#7367F0] bg-[#7367F0]/10'
                            : 'border-[#dbdade]/80 bg-white hover:border-[#7367F0] hover:bg-[#7367F0]/5 dark:border-[#434968] dark:bg-[#2f3349]'
                    }`}
                >
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-200">
                        <Upload className="size-4 text-[#7367F0]" />
                        <span>Choose multiple gallery image files or drag & drop</span>
                    </div>
                </div>

                {/* Existing Gallery Images (from server) */}
                {existingGallery.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-[#a5a3ae] uppercase tracking-wider">
                            Existing Gallery Photos ({existingGallery.length}):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {existingGallery.map((url, i) => (
                                <div
                                    key={i}
                                    className="group relative aspect-square overflow-hidden rounded-lg border border-[#dbdade] bg-white shadow-xs dark:border-[#434968] dark:bg-[#2f3349]"
                                >
                                    <img
                                        src={url}
                                        alt={`Saved gallery ${i + 1}`}
                                        className="size-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExistingGallery(i)}
                                        className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-red-600/90 text-white shadow-xs transition hover:bg-red-700"
                                        title="Remove this image"
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

                {/* Newly Selected Gallery Files (ready to upload) */}
                {galleryFiles.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            New Uploads ({galleryFiles.length} files selected):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {galleryFiles.map((file, i) => (
                                <div
                                    key={i}
                                    className="group relative aspect-square overflow-hidden rounded-lg border-2 border-emerald-500/60 bg-white shadow-xs dark:bg-[#2f3349]"
                                >
                                    {galleryPreviews[i] ? (
                                        <img
                                            src={galleryPreviews[i]}
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
                                        onClick={() => handleRemoveGalleryFile(i)}
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
        </div>
    );
}

export default ProductImagesInput;
