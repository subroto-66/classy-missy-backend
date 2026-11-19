import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { ExternalLink, Hash, Images, Link as LinkIcon, Plus } from 'lucide-react';
import { CatalogCard } from '@/components/catalog-card';
import { CatalogList } from '@/components/catalog-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SingleImageUpload } from '@/components/single-image-upload';
import type { PaginatedData, Slider } from '@/types';

type Props = {
    sliders: PaginatedData<Slider> | Slider[];
    filters?: {
        search?: string;
        status?: string;
    };
};

export default function SlidersIndex({ sliders, filters = {} }: Props) {
    const sliderList = Array.isArray(sliders) ? sliders : (sliders?.data || []);
    const totalSliders = Array.isArray(sliders) ? sliders.length : (sliders?.total ?? 0);
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (val: string) => {
        setSearch(val);
        router.get('/admin/sliders', { search: val }, {
            preserveState: true,
            replace: true,
        });
    };

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
    const [deletingSlider, setDeletingSlider] = useState<Slider | null>(null);

    const createForm = useForm<{
        title: string;
        subtitle: string;
        badge_text: string;
        button_text: string;
        link: string;
        image: string;
        image_file: File | null;
        image_alt: string;
        order: number;
        is_active: boolean;
    }>({
        title: '',
        subtitle: '',
        badge_text: '',
        button_text: 'Explore Collection',
        link: '/brands',
        image: '',
        image_file: null,
        image_alt: '',
        order: totalSliders + 1,
        is_active: true,
    });

    const editForm = useForm<{
        title: string;
        subtitle: string;
        badge_text: string;
        button_text: string;
        link: string;
        image: string;
        image_file: File | null;
        image_alt: string;
        order: number;
        is_active: boolean;
        _method?: string;
    }>({
        title: '',
        subtitle: '',
        badge_text: '',
        button_text: '',
        link: '',
        image: '',
        image_file: null,
        image_alt: '',
        order: 0,
        is_active: true,
    });

    const deleteForm = useForm({});

    const handleOpenEdit = (slider: Slider) => {
        setEditingSlider(slider);
        editForm.setData({
            title: slider.title || '',
            subtitle: slider.subtitle || '',
            badge_text: slider.badge_text || '',
            button_text: slider.button_text || '',
            link: slider.link || '/',
            image: slider.image || '',
            image_file: null,
            image_alt: slider.image_alt || '',
            order: slider.order ?? 0,
            is_active: slider.is_active,
        });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/sliders', {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSlider) return;

        editForm.transform((data) => ({
            ...data,
            _method: 'PUT',
        })).post(`/admin/sliders/${editingSlider.id}`, {
            forceFormData: true,
            onSuccess: () => {
                setEditingSlider(null);
            },
        });
    };

    const handleDeleteSubmit = () => {
        if (!deletingSlider) return;
        deleteForm.delete(`/admin/sliders/${deletingSlider.id}`, {
            onSuccess: () => {
                setDeletingSlider(null);
            },
        });
    };

    return (
        <>
            <Head title="Home Page Sliders" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <CatalogList
                    title="Home Page Hero Sliders"
                    totalCount={totalSliders}
                    countLabel="Slides"
                    addButtonLabel="Add New Slide"
                    onAdd={() => setIsCreateOpen(true)}
                    search={search}
                    onSearchChange={handleSearch}
                    searchPlaceholder="Search slides by title, subtitle, or link..."
                    items={sliderList}
                    paginationData={sliders}
                    gridClassName="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                    emptyMessage="No home page slides found. Click &quot;Add New Slide&quot; to create your first banner slide."
                    renderCard={(s) => (
                        <CatalogCard
                            key={s.id}
                            title={s.title || 'Untitled Banner Slide'}
                            eyebrow={s.badge_text || `Display Order: ${s.order}`}
                            description={s.subtitle || s.link || 'Home page carousel hero slide'}
                            image={s.image}
                            imageHeight="h-44"
                            fallbackIcon={<Images className="size-8" />}
                            status={s.is_active ? 'live' : 'paused'}
                            headerBadge={
                                <div className="flex items-center gap-1.5">
                                    <Badge className="bg-primary/90 text-white font-semibold text-[11px] shadow-xs">
                                        #{s.order}
                                    </Badge>
                                    {s.badge_text && (
                                        <Badge variant="secondary" className="text-[10px]">
                                            {s.badge_text}
                                        </Badge>
                                    )}
                                </div>
                            }
                            footerLeft={
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate max-w-[200px]">
                                    <ExternalLink className="size-3.5 text-primary shrink-0" />
                                    <span className="truncate font-mono">{s.link || '/'}</span>
                                </div>
                            }
                            onEdit={() => handleOpenEdit(s)}
                            onDelete={() => setDeletingSlider(s)}
                        />
                    )}
                />

                {/* Add Slide Modal */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Images className="size-5 text-primary" />
                                Add Hero Banner Slide
                            </DialogTitle>
                            <DialogDescription>
                                Add a high-resolution banner image and call-to-action link for the storefront homepage slider.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                            <SingleImageUpload
                                file={createForm.data.image_file}
                                onFileChange={(file) => createForm.setData('image_file', file)}
                                existingUrl={createForm.data.image}
                                onExistingUrlChange={(url) => createForm.setData('image', url || '')}
                                label="Slide Banner Image *"
                                description="Recommended ratio 3:1 or 16:7 (e.g. 1920x640px or 1200x500px, PNG, JPG, WEBP)"
                            />
                            {createForm.errors.image && (
                                <p className="text-xs text-red-600">{createForm.errors.image}</p>
                            )}

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="slide-title">Title (Optional)</Label>
                                    <Input
                                        id="slide-title"
                                        placeholder="e.g. Curated Collection"
                                        value={createForm.data.title}
                                        onChange={(e) => createForm.setData('title', e.target.value)}
                                    />
                                    {createForm.errors.title && (
                                        <p className="text-xs text-red-600">{createForm.errors.title}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="slide-subtitle">Subtitle / Tagline (Optional)</Label>
                                    <Input
                                        id="slide-subtitle"
                                        placeholder="e.g. Neutral-toned women's fashion"
                                        value={createForm.data.subtitle}
                                        onChange={(e) => createForm.setData('subtitle', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="slide-link">Destination Link / URL *</Label>
                                    <Input
                                        id="slide-link"
                                        placeholder="e.g. /brands, /campaigns, /products"
                                        value={createForm.data.link}
                                        onChange={(e) => createForm.setData('link', e.target.value)}
                                        required
                                    />
                                    {createForm.errors.link && (
                                        <p className="text-xs text-red-600">{createForm.errors.link}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="slide-badge">Badge Tag (Optional)</Label>
                                    <Input
                                        id="slide-badge"
                                        placeholder="e.g. New Season, 30% OFF"
                                        value={createForm.data.badge_text}
                                        onChange={(e) => createForm.setData('badge_text', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="slide-order">Sort / Display Order</Label>
                                    <Input
                                        id="slide-order"
                                        type="number"
                                        min={0}
                                        placeholder="1"
                                        value={createForm.data.order}
                                        onChange={(e) => createForm.setData('order', Number(e.target.value))}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="slide-button">Button Text (Optional)</Label>
                                    <Input
                                        id="slide-button"
                                        placeholder="e.g. Shop Now"
                                        value={createForm.data.button_text}
                                        onChange={(e) => createForm.setData('button_text', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="slide-is-active"
                                    checked={createForm.data.is_active}
                                    onChange={(e) => createForm.setData('is_active', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="slide-is-active" className="cursor-pointer font-normal text-sm">
                                    Active (Display this slide on storefront carousel)
                                </Label>
                            </div>

                            <DialogFooter className="pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createForm.processing}>
                                    {createForm.processing ? 'Creating...' : 'Create Slide'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Slide Modal */}
                <Dialog open={Boolean(editingSlider)} onOpenChange={(open) => !open && setEditingSlider(null)}>
                    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Images className="size-5 text-primary" />
                                Edit Hero Banner Slide
                            </DialogTitle>
                            <DialogDescription>
                                Modify slide image, order, link destination or active visibility.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                            <SingleImageUpload
                                file={editForm.data.image_file}
                                onFileChange={(file) => editForm.setData('image_file', file)}
                                existingUrl={editForm.data.image}
                                onExistingUrlChange={(url) => editForm.setData('image', url || '')}
                                label="Slide Banner Image *"
                                description="Upload or paste image URL (PNG, JPG, WEBP up to 10MB)"
                            />
                            {editForm.errors.image && (
                                <p className="text-xs text-red-600">{editForm.errors.image}</p>
                            )}

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-slide-title">Title (Optional)</Label>
                                    <Input
                                        id="edit-slide-title"
                                        placeholder="e.g. Curated Collection"
                                        value={editForm.data.title}
                                        onChange={(e) => editForm.setData('title', e.target.value)}
                                    />
                                    {editForm.errors.title && (
                                        <p className="text-xs text-red-600">{editForm.errors.title}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-slide-subtitle">Subtitle / Tagline (Optional)</Label>
                                    <Input
                                        id="edit-slide-subtitle"
                                        placeholder="e.g. Neutral-toned women's fashion"
                                        value={editForm.data.subtitle}
                                        onChange={(e) => editForm.setData('subtitle', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-slide-link">Destination Link / URL *</Label>
                                    <Input
                                        id="edit-slide-link"
                                        placeholder="e.g. /brands, /campaigns, /products"
                                        value={editForm.data.link}
                                        onChange={(e) => editForm.setData('link', e.target.value)}
                                        required
                                    />
                                    {editForm.errors.link && (
                                        <p className="text-xs text-red-600">{editForm.errors.link}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-slide-badge">Badge Tag (Optional)</Label>
                                    <Input
                                        id="edit-slide-badge"
                                        placeholder="e.g. New Season, 30% OFF"
                                        value={editForm.data.badge_text}
                                        onChange={(e) => editForm.setData('badge_text', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-slide-order">Sort / Display Order</Label>
                                    <Input
                                        id="edit-slide-order"
                                        type="number"
                                        min={0}
                                        value={editForm.data.order}
                                        onChange={(e) => editForm.setData('order', Number(e.target.value))}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-slide-button">Button Text (Optional)</Label>
                                    <Input
                                        id="edit-slide-button"
                                        placeholder="e.g. Shop Now"
                                        value={editForm.data.button_text}
                                        onChange={(e) => editForm.setData('button_text', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="edit-slide-is-active"
                                    checked={editForm.data.is_active}
                                    onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="edit-slide-is-active" className="cursor-pointer font-normal text-sm">
                                    Active (Display this slide on storefront carousel)
                                </Label>
                            </div>

                            <DialogFooter className="pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditingSlider(null)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editForm.processing}>
                                    {editForm.processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Slide Confirmation Modal */}
                <Dialog open={Boolean(deletingSlider)} onOpenChange={(open) => !open && setDeletingSlider(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Delete Banner Slide</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete{' '}
                                <strong className="text-foreground">
                                    {deletingSlider?.title || `Slide #${deletingSlider?.order}`}
                                </strong>
                                ? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>

                        {deletingSlider && (
                            <div className="overflow-hidden rounded-lg border border-border">
                                <img
                                    src={deletingSlider.image}
                                    alt={deletingSlider.title || 'Slide'}
                                    className="h-32 w-full object-cover"
                                />
                            </div>
                        )}

                        <DialogFooter className="pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDeletingSlider(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDeleteSubmit}
                                disabled={deleteForm.processing}
                            >
                                {deleteForm.processing ? 'Deleting...' : 'Delete Slide'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

SlidersIndex.layout = () => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Home Sliders',
            href: '/admin/sliders',
        },
    ],
});
