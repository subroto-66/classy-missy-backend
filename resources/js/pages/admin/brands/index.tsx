import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Globe, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
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
import type { Brand } from '@/types';

type Props = {
    brands: Brand[];
};

export default function BrandsIndex({ brands = [] }: Props) {
    const page = usePage();
    const teamSlug = (page.props.currentTeam as { slug?: string } | undefined)?.slug || '';
    const prefix = teamSlug ? `/${teamSlug}` : '';

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);

    const createForm = useForm({
        name: '',
        logo: '',
        description: '',
        website: '',
        is_active: true,
    });

    const editForm = useForm({
        name: '',
        logo: '',
        description: '',
        website: '',
        is_active: true,
    });

    const deleteForm = useForm({});

    const handleOpenEdit = (b: Brand) => {
        setEditingBrand(b);
        editForm.setData({
            name: b.name,
            logo: b.logo || '',
            description: b.description || '',
            website: b.website || '',
            is_active: b.is_active,
        });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(`${prefix}/admin/brands`, {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBrand) return;
        editForm.put(`${prefix}/admin/brands/${editingBrand.id}`, {
            onSuccess: () => {
                setEditingBrand(null);
                editForm.reset();
            },
        });
    };

    const handleDeleteSubmit = () => {
        if (!deletingBrand) return;
        deleteForm.delete(`${prefix}/admin/brands/${deletingBrand.id}`, {
            onSuccess: () => {
                setDeletingBrand(null);
            },
        });
    };

    return (
        <>
            <Head title="Brands Management" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                Partner Brands
                            </h1>
                            <Badge variant="outline" className="text-xs">
                                {brands.length} Brands
                            </Badge>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Partner cosmetic & dermatological labels featured on Classy Missy.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-[#7367F0] hover:bg-[#685dd8] shadow-[0_2px_4px_rgba(115,103,240,0.4)] text-white flex items-center gap-1.5"
                    >
                        <Plus className="size-4" />
                        <span>Add Brand</span>
                    </Button>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {brands.map((b) => (
                        <Card key={b.id} className="border-neutral-200 shadow-sm dark:border-neutral-800">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-12 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-center p-1 dark:border-neutral-800 dark:bg-neutral-900">
                                        {b.logo ? (
                                            <img src={b.logo} alt={b.name} className="size-full object-cover rounded-lg" />
                                        ) : (
                                            <Sparkles className="size-5 text-neutral-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-neutral-900 truncate dark:text-neutral-100">
                                            {b.name}
                                        </h3>
                                        <span className="text-xs text-neutral-400">
                                            {b.products_count ?? 0} Products
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs text-neutral-500 line-clamp-2 min-h-[32px]">
                                    {b.description || 'Authentic skincare and cosmetic formulas.'}
                                </p>

                                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] dark:bg-emerald-950/40 dark:text-emerald-300">
                                        Active
                                    </Badge>
                                    <div className="flex items-center gap-1.5">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleOpenEdit(b)}
                                            className="h-7 text-xs px-2 flex items-center gap-1"
                                        >
                                            <Pencil className="size-3" />
                                            <span>Edit</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setDeletingBrand(b)}
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

                {/* Add Brand Modal */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add Brand</DialogTitle>
                            <DialogDescription>Add a beauty or skincare brand to your catalog.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="b-name">Brand Name *</Label>
                                <Input
                                    id="b-name"
                                    placeholder="e.g. CeraVe, The Ordinary"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    required
                                />
                                {createForm.errors.name && (
                                    <p className="text-xs text-red-600">{createForm.errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="b-logo">Logo URL</Label>
                                <Input
                                    id="b-logo"
                                    placeholder="https://..."
                                    value={createForm.data.logo}
                                    onChange={(e) => createForm.setData('logo', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="b-website">Official Website</Label>
                                <Input
                                    id="b-website"
                                    placeholder="https://..."
                                    value={createForm.data.website}
                                    onChange={(e) => createForm.setData('website', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="b-desc">Description</Label>
                                <Input
                                    id="b-desc"
                                    placeholder="Developed with dermatologists..."
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                />
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createForm.processing} className="bg-[#7367F0] hover:bg-[#685dd8] shadow-[0_2px_4px_rgba(115,103,240,0.4)] text-white">
                                    {createForm.processing ? 'Creating...' : 'Create Brand'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Brand Modal */}
                <Dialog open={!!editingBrand} onOpenChange={(open) => !open && setEditingBrand(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Brand: {editingBrand?.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-b-name">Brand Name *</Label>
                                <Input
                                    id="edit-b-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-b-logo">Logo URL</Label>
                                <Input
                                    id="edit-b-logo"
                                    value={editForm.data.logo}
                                    onChange={(e) => editForm.setData('logo', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-b-website">Website</Label>
                                <Input
                                    id="edit-b-website"
                                    value={editForm.data.website}
                                    onChange={(e) => editForm.setData('website', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-b-desc">Description</Label>
                                <Input
                                    id="edit-b-desc"
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                />
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => setEditingBrand(null)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editForm.processing} className="bg-[#7367F0] hover:bg-[#685dd8] shadow-[0_2px_4px_rgba(115,103,240,0.4)] text-white">
                                    {editForm.processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Brand Modal */}
                <Dialog open={!!deletingBrand} onOpenChange={(open) => !open && setDeletingBrand(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-red-600">Delete Brand</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete brand <strong>{deletingBrand?.name}</strong>?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="pt-2">
                            <Button variant="outline" onClick={() => setDeletingBrand(null)}>
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

BrandsIndex.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? `/${props.currentTeam.slug}/dashboard` : '/dashboard',
        },
        {
            title: 'Brands',
            href: props.currentTeam ? `/${props.currentTeam.slug}/admin/brands` : '/admin/brands',
        },
    ],
});
