import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Calendar, Megaphone, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import type { Campaign, Product } from '@/types';

type Props = {
    campaigns: Campaign[];
    products: Array<{ id: number; slug: string; name: string }>;
};

export default function CampaignsIndex({ campaigns = [], products = [] }: Props) {
    const page = usePage();
    const prefix = '';

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);

    const createForm = useForm<{
        title: string;
        eyebrow: string;
        description: string;
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
        createForm.post(`${prefix}/admin/campaigns`, {
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
        editForm.post(`${prefix}/admin/campaigns/${editingCampaign.id}`, {
            forceFormData: true,
            onSuccess: () => {
                setEditingCampaign(null);
                editForm.reset();
            },
        });
    };

    const handleDeleteSubmit = () => {
        if (!deletingCampaign) return;
        deleteForm.delete(`${prefix}/admin/campaigns/${deletingCampaign.id}`, {
            onSuccess: () => {
                setDeletingCampaign(null);
            },
        });
    };

    return (
        <>
            <Head title="Marketing Campaigns" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                Glow Campaigns & Promotions
                            </h1>
                            <Badge className="bg-[#7367f0]/10 text-[#7367F0] border-[#7367f0]/20 dark:bg-rose-950/40 dark:text-rose-300">
                                Promotional Banners
                            </Badge>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Launch seasonal skincare routines, curated product edits, and flash discounts.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-[#7367F0] hover:bg-[#685dd8] shadow-[0_2px_4px_rgba(115,103,240,0.4)] text-white flex items-center gap-1.5"
                    >
                        <Plus className="size-4" />
                        <span>Create Campaign</span>
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {campaigns.map((c) => (
                        <Card key={c.id} className="overflow-hidden border-neutral-200 shadow-sm dark:border-neutral-800">
                            <div className="relative h-48 w-full bg-neutral-100 dark:bg-neutral-800">
                                {c.image ? (
                                    <img src={c.image} alt={c.title} className="size-full object-cover" />
                                ) : (
                                    <div className="flex size-full items-center justify-center text-neutral-400">
                                        <Megaphone className="size-8" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                <div className="absolute bottom-3 left-4 right-4 text-white">
                                    {c.eyebrow && (
                                        <p className="text-[11px] font-semibold tracking-wider uppercase text-rose-300">
                                            {c.eyebrow}
                                        </p>
                                    )}
                                    <h3 className="text-lg font-bold">{c.title}</h3>
                                </div>
                                <div className="absolute top-3 right-3 flex items-center gap-2">
                                    {c.discount_percentage > 0 && (
                                        <Badge className="bg-[#7367F0] text-white font-bold text-xs shadow">
                                            {c.discount_percentage}% OFF
                                        </Badge>
                                    )}
                                    {c.is_active ? (
                                        <Badge className="bg-emerald-500 text-white text-[10px]">Live</Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-black/60 text-white text-[10px]">Paused</Badge>
                                    )}
                                </div>
                            </div>

                            <CardContent className="p-4 space-y-3">
                                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                                    {c.description || 'Curated skincare selection featured across storefront banners.'}
                                </p>

                                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs text-neutral-400 dark:border-neutral-800">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="size-3.5 text-[#7367F0]" />
                                        <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                            {formatDateRange(c.start_date, c.end_date)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleOpenEdit(c)}
                                            className="h-7 text-xs px-2 flex items-center gap-1"
                                        >
                                            <Pencil className="size-3" />
                                            <span>Edit</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setDeletingCampaign(c)}
                                            className="h-7 text-xs px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                                        >
                                            <Trash2 className="size-3" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Add Campaign Modal */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Create Promotional Campaign</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
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

                            <SingleImageUpload
                                file={createForm.data.image_file}
                                onFileChange={(file) => createForm.setData('image_file', file)}
                                existingUrl={createForm.data.image}
                                onExistingUrlChange={(url) => createForm.setData('image', url || '')}
                                label="Campaign Banner Image"
                                description="Upload campaign promotional banner (PNG, JPG, WEBP up to 5MB)"
                            />

                            <div className="space-y-1.5">
                                <Label htmlFor="camp-discount">Discount Percentage (%)</Label>
                                <Input
                                    id="camp-discount"
                                    type="number"
                                    value={createForm.data.discount_percentage}
                                    onChange={(e) => createForm.setData('discount_percentage', Number(e.target.value))}
                                />
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
                                    className="rounded border-neutral-300 text-[#7367F0] focus:ring-[#7367f0]"
                                />
                                <Label htmlFor="camp-active" className="text-xs cursor-pointer">
                                    Set as Live Campaign on Homepage
                                </Label>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createForm.processing} className="bg-[#7367F0] hover:bg-[#685dd8] shadow-[0_2px_4px_rgba(115,103,240,0.4)] text-white">
                                    {createForm.processing ? 'Creating...' : 'Launch Campaign'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Campaign Modal */}
                <Dialog open={!!editingCampaign} onOpenChange={(open) => !open && setEditingCampaign(null)}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Edit Campaign: {editingCampaign?.title}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
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

                            <SingleImageUpload
                                file={editForm.data.image_file}
                                onFileChange={(file) => editForm.setData('image_file', file)}
                                existingUrl={editForm.data.image}
                                onExistingUrlChange={(url) => editForm.setData('image', url || '')}
                                label="Campaign Banner Image"
                                description="Upload campaign promotional banner (PNG, JPG, WEBP up to 5MB)"
                            />

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-camp-discount">Discount Percentage (%)</Label>
                                <Input
                                    id="edit-camp-discount"
                                    type="number"
                                    value={editForm.data.discount_percentage}
                                    onChange={(e) => editForm.setData('discount_percentage', Number(e.target.value))}
                                />
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
                                    className="rounded border-neutral-300 text-[#7367F0] focus:ring-[#7367f0]"
                                />
                                <Label htmlFor="edit-camp-active" className="text-xs cursor-pointer">
                                    Active Campaign
                                </Label>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => setEditingCampaign(null)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editForm.processing} className="bg-[#7367F0] hover:bg-[#685dd8] shadow-[0_2px_4px_rgba(115,103,240,0.4)] text-white">
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
                        <DialogFooter className="pt-2">
                            <Button variant="outline" onClick={() => setDeletingCampaign(null)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteSubmit} disabled={deleteForm.processing}>
                                {deleteForm.processing ? 'Deleting...' : 'Confirm Delete'}
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
