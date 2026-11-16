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
import { SingleImageUpload } from '@/components/single-image-upload';
import type { Category } from '@/types';

type Props = {
    categories: Category[];
};

export default function CategoriesIndex({ categories = [] }: Props) {
    const page = usePage();
    const prefix = '';

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

    const createForm = useForm<{
        name: string;
        image: string;
        image_file: File | null;
        description: string;
        order: number;
        is_active: boolean;
    }>({
        name: '',
        image: '',
        image_file: null,
        description: '',
        order: categories.length + 1,
        is_active: true,
    });

    const editForm = useForm<{
        name: string;
        image: string;
        image_file: File | null;
        description: string;
        order: number;
        is_active: boolean;
        _method?: string;
    }>({
        name: '',
        image: '',
        image_file: null,
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
            image_file: null,
            description: c.description || '',
            order: c.order,
            is_active: c.is_active,
        });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(`${prefix}/admin/categories`, {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;
        editForm.transform((data) => ({
            ...data,
            _method: 'PUT',
        }));
        editForm.post(`${prefix}/admin/categories/${editingCategory.id}`, {
            forceFormData: true,
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
                    <DialogContent className="max-w-lg">
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

                            <SingleImageUpload
                                file={createForm.data.image_file}
                                onFileChange={(file) => createForm.setData('image_file', file)}
                                existingUrl={createForm.data.image}
                                onExistingUrlChange={(url) => createForm.setData('image', url || '')}
                                label="Category Cover Image"
                                description="Upload category cover photo (PNG, JPG, WEBP up to 5MB)"
                            />

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
                    <DialogContent className="max-w-lg">
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

                            <SingleImageUpload
                                file={editForm.data.image_file}
                                onFileChange={(file) => editForm.setData('image_file', file)}
                                existingUrl={editForm.data.image}
                                onExistingUrlChange={(url) => editForm.setData('image', url || '')}
                                label="Category Cover Image"
                                description="Upload category cover photo (PNG, JPG, WEBP up to 5MB)"
                            />

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

CategoriesIndex.layout = () => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Categories',
            href: '/admin/categories',
        },
    ],
});
