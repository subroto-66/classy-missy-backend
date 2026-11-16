import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Tags } from 'lucide-react';
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
import type { Category, PaginatedData } from '@/types';

type Props = {
    categories: PaginatedData<Category> | Category[];
    filters?: {
        search?: string;
    };
};

export default function CategoriesIndex({ categories, filters = {} }: Props) {
    const page = usePage();
    const prefix = '';

    const categoryList = Array.isArray(categories) ? categories : (categories?.data || []);
    const totalCategories = Array.isArray(categories) ? categories.length : (categories?.total ?? 0);
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (val: string) => {
        setSearch(val);
        router.get(`${prefix}/admin/categories`, { search: val }, {
            preserveState: true,
            replace: true,
        });
    };

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
        order: totalCategories + 1,
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
                <CatalogList
                    title="Categories"
                    totalCount={totalCategories}
                    countLabel="Sections"
                    addButtonLabel="Add Category"
                    onAdd={() => setIsCreateOpen(true)}
                    search={search}
                    onSearchChange={handleSearch}
                    searchPlaceholder="Search categories by name, description..."
                    items={categoryList}
                    paginationData={categories}
                    gridClassName="grid gap-5 sm:grid-cols-2 lg:grid-cols-5"
                    emptyMessage="No categories found matching your search. Click &quot;Add Category&quot; to create one."
                    renderCard={(c) => (
                        <CatalogCard
                            key={c.id}
                            title={c.name}
                            description={c.description || 'No description'}
                            image={c.image}
                            imageHeight="h-32"
                            fallbackIcon={<Tags className="size-8" />}
                            status={c.is_active}
                            meta={
                                <Badge variant="secondary" className="text-xs">
                                    {c.products_count ?? 0} Products
                                </Badge>
                            }
                            footerLeft={
                                <span className="text-[11px] text-neutral-400">
                                    Display Order #{c.order}
                                </span>
                            }
                            onEdit={() => handleOpenEdit(c)}
                            onDelete={() => setDeletingCategory(c)}
                        />
                    )}
                />

                {/* Add Category Dialog */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Add Category</DialogTitle>
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
                                <Button type="submit" disabled={createForm.processing} className="bg-primary hover:bg-[var(--primary-hover)] shadow-[0_2px_4px_rgba(var(--primary-rgb),0.4)] text-white">
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
                            <DialogTitle>Edit Category</DialogTitle>
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
                                    className="rounded border-neutral-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="edit-c-active" className="text-xs cursor-pointer">
                                    Active Category
                                </Label>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => setEditingCategory(null)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editForm.processing} className="bg-primary hover:bg-[var(--primary-hover)] shadow-[0_2px_4px_rgba(var(--primary-rgb),0.4)] text-white">
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
