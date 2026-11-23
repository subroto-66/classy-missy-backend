import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Calendar, ExternalLink, Layers, Megaphone } from 'lucide-react';
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
import { formatDateRange, toInputDate } from '@/lib/utils';
import type { Campaign, PaginatedData, Product } from '@/types';

type Props = {
    campaigns: PaginatedData<Campaign> | Campaign[];
    products: Array<{ id: number; slug: string; name: string }>;
    filters?: {
        search?: string;
        placement?: string;
    };
};

const PLACEMENTS = [
    { id: 'all', label: 'All Placements' },
    { id: 'slider', label: 'Slider Carousel' },
    { id: 'promo', label: 'Top Promo Grid (4)' },
    { id: 'flash', label: 'Flash Banner (1)' },
    { id: 'middle', label: 'Middle Dual (2)' },
    { id: 'bottom', label: 'Bottom Showcase (4)' },
];

const PLACEMENT_LABELS: Record<string, string> = {
    slider: 'Slider Carousel',
    promo: 'Top Promo Grid',
    flash: 'Flash Banner',
    middle: 'Middle Dual',
    bottom: 'Bottom Showcase',
};

export default function CampaignsIndex({ campaigns, products = [], filters = {} }: Props) {
    const campaignList = Array.isArray(campaigns) ? campaigns : (campaigns?.data || []);
    const totalCampaigns = Array.isArray(campaigns) ? campaigns.length : (campaigns?.total ?? 0);
    const [search, setSearch] = useState(filters.search || '');
    const [selectedPlacement, setSelectedPlacement] = useState(filters.placement || 'all');

    const handleSearch = (val: string) => {
        setSearch(val);
        router.get('/admin/campaigns', {
            search: val,
            placement: selectedPlacement !== 'all' ? selectedPlacement : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePlacementFilter = (placementId: string) => {
        setSelectedPlacement(placementId);
        router.get('/admin/campaigns', {
            search: search || undefined,
            placement: placementId !== 'all' ? placementId : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);

    const createForm = useForm<{
        title: string;
        eyebrow: string;
        description: string;
        placement: string;
        link: string;
        order: number;
        image: string;
        image_file: File | null;
        discount_percentage: number;
        is_active: boolean;
        start_date: string;
        end_date: string;
    }>({
        title: '',
        eyebrow: 'Your glow, your routine',
        description: '',
        placement: selectedPlacement !== 'all' ? selectedPlacement : 'slider',
        link: '',
        order: 1,
        image: '',
        image_file: null,
        discount_percentage: 15,
        is_active: true,
        start_date: '',
        end_date: '',
    });

    const editForm = useForm<{
        title: string;
        eyebrow: string;
        description: string;
        placement: string;
        link: string;
        order: number;
        image: string;
        image_file: File | null;
        discount_percentage: number;
        is_active: boolean;
        start_date: string;
        end_date: string;
        _method?: string;
    }>({
        title: '',
        eyebrow: '',
        description: '',
        placement: 'slider',
        link: '',
        order: 0,
        image: '',
        image_file: null,
        discount_percentage: 0,
        is_active: true,
        start_date: '',
        end_date: '',
    });

    const deleteForm = useForm({});

    const handleOpenEdit = (c: Campaign) => {
        setEditingCampaign(c);
        editForm.setData({
            title: c.title,
            eyebrow: c.eyebrow || '',
            description: c.description || '',
            placement: c.placement || 'slider',
            link: c.link || '',
            order: c.order ?? 0,
            image: c.image || '',
            image_file: null,
            discount_percentage: c.discount_percentage,
            is_active: c.is_active,
            start_date: toInputDate(c.start_date),
            end_date: toInputDate(c.end_date),
        });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/campaigns', {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCampaign) return;

        editForm.transform((data) => ({
            ...data,
            _method: 'PUT',
        }));

        editForm.post(`/admin/campaigns/${editingCampaign.id}`, {
            forceFormData: true,
            onSuccess: () => {
                setEditingCampaign(null);
                editForm.reset();
            },
        });
    };

    const handleDeleteSubmit = () => {
        if (!deletingCampaign) return;
        deleteForm.delete(`/admin/campaigns/${deletingCampaign.id}`, {
            onSuccess: () => {
                setDeletingCampaign(null);
            },
        });
    };

    return (
        <>
            <Head title="Marketing Campaigns & Banners" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Placement Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
                    <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
                        <Layers className="size-3.5" />
                        Placement:
                    </span>
                    {PLACEMENTS.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => handlePlacementFilter(p.id)}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer ${selectedPlacement === p.id
                                    ? 'bg-primary text-white shadow-xs'
                                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                <CatalogList
                    title="Glow Campaigns & Home Banners"
                    totalCount={totalCampaigns}
                    countLabel="Campaigns"
                    addButtonLabel="Create Campaign"
                    onAdd={() => setIsCreateOpen(true)}
                    search={search}
                    onSearchChange={handleSearch}
                    searchPlaceholder="Search campaigns by title, tagline, description..."
                    items={campaignList}
                    paginationData={campaigns}
                    gridClassName="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                    emptyMessage="No campaigns found matching your filter. Click &quot;Create Campaign&quot; to launch one."
                    renderCard={(c) => (
                        <CatalogCard
                            key={c.id}
                            title={c.title}
                            eyebrow={c.eyebrow}
                            description={c.description || 'Featured campaign and banner across storefront.'}
                            image={c.image}
                            imageHeight="h-44"
                            fallbackIcon={<Megaphone className="size-8" />}
                            status={c.is_active ? 'live' : 'paused'}
                            headerBadge={
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <Badge variant="secondary" className="text-[10px] font-semibold">
                                        {PLACEMENT_LABELS[c.placement || 'slider'] || c.placement}
                                    </Badge>
                                    {c.discount_percentage > 0 && (
                                        <Badge className="bg-primary text-white font-bold text-xs shadow-xs">
                                            {c.discount_percentage}% OFF
                                        </Badge>
                                    )}
                                </div>
                            }
                            footerLeft={
                                <div className="flex items-center gap-2 text-xs text-muted-foreground truncate max-w-[200px]">
                                    {c.link ? (
                                        <>
                                            <ExternalLink className="size-3 text-primary shrink-0" />
                                            <span className="truncate font-mono">{c.link}</span>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="size-3.5 text-primary" />
                                            <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                                {formatDateRange(c.start_date, c.end_date)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            }
                            onEdit={() => handleOpenEdit(c)}
                            onDelete={() => setDeletingCampaign(c)}
                        />
                    )}
                />

                {/* Add Campaign Modal */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create Promotional Campaign / Banner</DialogTitle>
                            <DialogDescription>
                                Add a campaign banner, choose its homepage placement, link destination, and discount.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="camp-title">Campaign Title *</Label>
                                    <Input
                                        id="camp-title"
                                        placeholder="e.g. Glow Essentials, The Skin Reset"
                                        value={createForm.data.title}
                                        onChange={(e) => createForm.setData('title', e.target.value)}
                                        required
                                    />
                                    {createForm.errors.title && (
                                        <p className="text-xs text-red-600">{createForm.errors.title}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="camp-eyebrow">Tagline / Eyebrow</Label>
                                    <Input
                                        id="camp-eyebrow"
                                        placeholder="Your glow, your routine"
                                        value={createForm.data.eyebrow}
                                        onChange={(e) => createForm.setData('eyebrow', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="camp-placement">Home Page Placement *</Label>
                                    <select
                                        id="camp-placement"
                                        value={createForm.data.placement}
                                        onChange={(e) => createForm.setData('placement', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="slider">Campaign Slider Carousel</option>
                                        <option value="promo">Top Promo Grid (4 Cards below Hero)</option>
                                        <option value="flash">Flash Sale Banner (Full Width)</option>
                                        <option value="middle">Middle Dual Banners (2 Cards)</option>
                                        <option value="bottom">Bottom Showcase Banners (4 Cards)</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="camp-link">Destination Link / URL</Label>
                                    <Input
                                        id="camp-link"
                                        placeholder="e.g. /brands, /campaigns, /products"
                                        value={createForm.data.link}
                                        onChange={(e) => createForm.setData('link', e.target.value)}
                                    />
                                </div>
                            </div>

                            <SingleImageUpload
                                file={createForm.data.image_file}
                                onFileChange={(file) => createForm.setData('image_file', file)}
                                existingUrl={createForm.data.image}
                                onExistingUrlChange={(url) => createForm.setData('image', url || '')}
                                label="Campaign Banner Image / Video"
                                description="Upload banner image or video (PNG, JPG, WEBP, MP4 up to 20MB)"
                            />

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="camp-discount">Discount Percentage (%)</Label>
                                    <Input
                                        id="camp-discount"
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={createForm.data.discount_percentage}
                                        onChange={(e) => createForm.setData('discount_percentage', Number(e.target.value))}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="camp-order">Display Order</Label>
                                    <Input
                                        id="camp-order"
                                        type="number"
                                        min={0}
                                        value={createForm.data.order}
                                        onChange={(e) => createForm.setData('order', Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="camp-desc">Description</Label>
                                <Input
                                    id="camp-desc"
                                    placeholder="Discover feel-good skincare picks..."
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="camp-start-date">Start Date</Label>
                                    <Input
                                        id="camp-start-date"
                                        type="date"
                                        value={createForm.data.start_date}
                                        onChange={(e) => createForm.setData('start_date', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="camp-end-date">End Date</Label>
                                    <Input
                                        id="camp-end-date"
                                        type="date"
                                        value={createForm.data.end_date}
                                        onChange={(e) => createForm.setData('end_date', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    id="camp-active"
                                    type="checkbox"
                                    checked={createForm.data.is_active}
                                    onChange={(e) => createForm.setData('is_active', e.target.checked)}
                                    className="rounded border-neutral-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="camp-active" className="text-xs cursor-pointer">
                                    Set as Live Campaign / Banner on Homepage
                                </Label>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createForm.processing} className="bg-primary hover:bg-[var(--primary-hover)] shadow-[0_2px_4px_rgba(var(--primary-rgb),0.4)] text-white">
                                    {createForm.processing ? 'Creating...' : 'Launch Campaign'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Campaign Modal */}
                <Dialog open={!!editingCampaign} onOpenChange={(open) => !open && setEditingCampaign(null)}>
                    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Campaign: {editingCampaign?.title}</DialogTitle>
                            <DialogDescription>
                                Update placement position, banner asset, destination link, or timing.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-camp-title">Campaign Title *</Label>
                                    <Input
                                        id="edit-camp-title"
                                        value={editForm.data.title}
                                        onChange={(e) => editForm.setData('title', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-camp-eyebrow">Eyebrow</Label>
                                    <Input
                                        id="edit-camp-eyebrow"
                                        value={editForm.data.eyebrow}
                                        onChange={(e) => editForm.setData('eyebrow', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-camp-placement">Home Page Placement *</Label>
                                    <select
                                        id="edit-camp-placement"
                                        value={editForm.data.placement}
                                        onChange={(e) => editForm.setData('placement', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="slider">Campaign Slider Carousel</option>
                                        <option value="promo">Top Promo Grid (4 Cards below Hero)</option>
                                        <option value="flash">Flash Sale Banner (Full Width)</option>
                                        <option value="middle">Middle Dual Banners (2 Cards)</option>
                                        <option value="bottom">Bottom Showcase Banners (4 Cards)</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-camp-link">Destination Link / URL</Label>
                                    <Input
                                        id="edit-camp-link"
                                        value={editForm.data.link}
                                        onChange={(e) => editForm.setData('link', e.target.value)}
                                    />
                                </div>
                            </div>

                            <SingleImageUpload
                                file={editForm.data.image_file}
                                onFileChange={(file) => editForm.setData('image_file', file)}
                                existingUrl={editForm.data.image}
                                onExistingUrlChange={(url) => editForm.setData('image', url || '')}
                                label="Campaign Banner Image / Video"
                                description="Upload banner image or video (PNG, JPG, WEBP, MP4 up to 20MB)"
                            />

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-camp-discount">Discount Percentage (%)</Label>
                                    <Input
                                        id="edit-camp-discount"
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={editForm.data.discount_percentage}
                                        onChange={(e) => editForm.setData('discount_percentage', Number(e.target.value))}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-camp-order">Display Order</Label>
                                    <Input
                                        id="edit-camp-order"
                                        type="number"
                                        min={0}
                                        value={editForm.data.order}
                                        onChange={(e) => editForm.setData('order', Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-camp-desc">Description</Label>
                                <Input
                                    id="edit-camp-desc"
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-camp-start-date">Start Date</Label>
                                    <Input
                                        id="edit-camp-start-date"
                                        type="date"
                                        value={editForm.data.start_date}
                                        onChange={(e) => editForm.setData('start_date', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-camp-end-date">End Date</Label>
                                    <Input
                                        id="edit-camp-end-date"
                                        type="date"
                                        value={editForm.data.end_date}
                                        onChange={(e) => editForm.setData('end_date', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    id="edit-camp-active"
                                    type="checkbox"
                                    checked={editForm.data.is_active}
                                    onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                    className="rounded border-neutral-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="edit-camp-active" className="text-xs cursor-pointer">
                                    Active Campaign
                                </Label>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => setEditingCampaign(null)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editForm.processing} className="bg-primary hover:bg-[var(--primary-hover)] shadow-[0_2px_4px_rgba(var(--primary-rgb),0.4)] text-white">
                                    {editForm.processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Campaign Modal */}
                <Dialog open={!!deletingCampaign} onOpenChange={(open) => !open && setDeletingCampaign(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-red-600">Delete Campaign</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete <strong>{deletingCampaign?.title}</strong>?
                            </DialogDescription>
                        </DialogHeader>

                        {deletingCampaign?.image && (
                            <div className="overflow-hidden rounded-lg border border-border">
                                <img
                                    src={deletingCampaign.image}
                                    alt={deletingCampaign.title}
                                    className="h-32 w-full object-cover"
                                />
                            </div>
                        )}

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setDeletingCampaign(null)}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDeleteSubmit}
                                disabled={deleteForm.processing}
                            >
                                {deleteForm.processing ? 'Deleting...' : 'Delete'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

CampaignsIndex.layout = () => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Campaigns',
            href: '/admin/campaigns',
        },
    ],
});
