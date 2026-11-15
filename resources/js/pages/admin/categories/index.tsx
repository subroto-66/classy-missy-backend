import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Package, Pencil, Plus, Tags, Trash2 } from 'lucide-react';
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
import type { Category } from '@/types';

type Props = {
    categories: Category[];
};

export default function CategoriesIndex({ categories = [] }: Props) {
    const page = usePage();
    const teamSlug = (page.props.currentTeam as { slug?: string } | undefined)?.slug || '';
    const prefix = teamSlug ? `/${teamSlug}` : '';

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

    const createForm = useForm({
        name: '',
        image: '',
        description: '',
        order: categories.length + 1,
        is_active: true,
    });

    const editForm = useForm({
        name: '',
        image: '',
        description: '',
        order: 1,
        is_active: true,
    });

    const deleteForm = useForm({});

    const handleOpenEdit = (c: Category) => {
        setEditingCategory(c);
        editForm.setData({
            name: c.name,
            image: c.image || '',
            description: c.description || '',
            order: c.order,
            is_active: c.is_active,
        });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(`${prefix}/admin/categories`, {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;
        editForm.put(`${prefix}/admin/categories/${editingCategory.id}`, {
            onSuccess: () => {
                setEditingCategory(null);
                editForm.reset();
            },
        });
    };

    const handleDeleteSubmit = () => {
        if (!deletingCategory) return;
        deleteForm.delete(`${prefix}/admin/categories/${deletingCategory.id}`, {
            onSuccess: () => {
                setDeletingCategory(null);
            },
        });
    };

    return (
        <>
            <Head title="Categories Management" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                Categories
                            </h1>
                            <Badge variant="outline" className="text-xs">
                                {categories.length} Sections
                            </Badge>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Organize beauty formulas by collection (Skincare, Makeup, Hair care, Fragrance).
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-[#7367F0] hover:bg-[#685dd8] shadow-[0_2px_4px_rgba(115,103,240,0.4)] text-white flex items-center gap-1.5"
                    >
                        <Plus className="size-4" />
                        <span>Add Category</span>
                    </Button>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((c) => (
                        <Card key={c.id} className="overflow-hidden border-neutral-200 shadow-sm dark:border-neutral-800">
                            <div className="relative h-36 w-full bg-neutral-100 dark:bg-neutral-800">
                                {c.image ? (
                                    <img src={c.image} alt={c.name} className="size-full object-cover" />
                                ) : (
                                    <div className="flex size-full items-center justify-center text-neutral-400">
                                        <Tags className="size-8" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    {c.is_active ? (
                                        <Badge className="bg-emerald-500/90 text-white text-[10px]">Active</Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-black/50 text-white text-[10px]">Disabled</Badge>
                                    )}
                                </div>
                            </div>

                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                                            {c.name}
                                        </h3>
                                        <p className="text-xs text-neutral-500 line-clamp-1">
                                            {c.description || 'No description'}
                                        </p>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">
                                        {c.products_count ?? 0} Products
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                    <span className="text-[11px] text-neutral-400">Display Order #{c.order}</span>
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
                                            onClick={() => setDeletingCategory(c)}
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

                {/* Add Category Dialog */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add Category</DialogTitle>
                            <DialogDescription>Create a collection to group related beauty products.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="c-name">Category Name *</Label>
                                <Input
                                    id="c-name"
                                    placeholder="e.g. Skincare"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    required
                                />
                                {createForm.errors.name && (
                                    <p className="text-xs text-red-600">{createForm.errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="c-image">Banner / Thumbnail Image URL</Label>
                                <Input
                                    id="c-image"
                                    placeholder="https://images.unsplash.com/photo-..."
                                    value={createForm.data.image}
                                    onChange={(e) => createForm.setData('image', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="c-desc">Description</Label>
                                <Input
                                    id="c-desc"
                                    placeholder="Everyday care for your skin"
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="c-order">Display Sequence Order</Label>
                                <Input
                                    id="c-order"
                                    type="number"
                                    value={createForm.data.order}
                                    onChange={(e) => createForm.setData('order', Number(e.target.value))}
                                />
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createForm.processing} className="bg-[#7367F0] hover:bg-[#685dd8] shadow-[0_2px_4px_rgba(115,103,240,0.4)] text-white">
                                    {createForm.processing ? 'Creating...' : 'Create Category'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Category Dialog */}
                <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Category: {editingCategory?.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-c-name">Category Name *</Label>
                                <Input
                                    id="edit-c-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-c-image">Image URL</Label>
                                <Input
                                    id="edit-c-image"
                                    value={editForm.data.image}
                                    onChange={(e) => editForm.setData('image', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-c-desc">Description</Label>
                                <Input
                                    id="edit-c-desc"
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-c-order">Order</Label>
                                <Input
                                    id="edit-c-order"
                                    type="number"
                                    value={editForm.data.order}
                                    onChange={(e) => editForm.setData('order', Number(e.target.value))}
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    id="edit-c-active"
                                    type="checkbox"
                                    checked={editForm.data.is_active}
                                    onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                    className="rounded border-neutral-300 text-[#7367F0] focus:ring-[#7367f0]"
                                />
                                <Label htmlFor="edit-c-active" className="text-xs cursor-pointer">
                                    Active Category
                                </Label>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => setEditingCategory(null)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editForm.processing} className="bg-[#7367F0] hover:bg-[#685dd8] shadow-[0_2px_4px_rgba(115,103,240,0.4)] text-white">
                                    {editForm.processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <Dialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-red-600">Delete Category</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete <strong>{deletingCategory?.name}</strong>?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="pt-2">
                            <Button variant="outline" onClick={() => setDeletingCategory(null)}>
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

CategoriesIndex.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? `/${props.currentTeam.slug}/dashboard` : '/dashboard',
        },
        {
            title: 'Categories',
            href: props.currentTeam ? `/${props.currentTeam.slug}/admin/categories` : '/admin/categories',
        },
    ],
});
