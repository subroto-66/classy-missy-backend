import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';
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
import type { Brand, PaginatedData } from '@/types';

type Props = {
    brands: PaginatedData<Brand> | Brand[];
    filters?: {
        search?: string;
    };
};

export default function BrandsIndex({ brands, filters = {} }: Props) {
    const page = usePage();
    const prefix = '';

    const brandList = Array.isArray(brands) ? brands : (brands?.data || []);
    const totalBrands = Array.isArray(brands) ? brands.length : (brands?.total ?? 0);
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (val: string) => {
        setSearch(val);
        router.get(`${prefix}/admin/brands`, { search: val }, {
            preserveState: true,
            replace: true,
        });
    };

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);

    const createForm = useForm<{
        name: string;
        logo: string;
        logo_file: File | null;
        description: string;
        website: string;
        is_active: boolean;
    }>({
        name: '',
        logo: '',
        logo_file: null,
        description: '',
        website: '',
        is_active: true,
    });

    const editForm = useForm<{
        name: string;
        logo: string;
        logo_file: File | null;
        description: string;
        website: string;
        is_active: boolean;
        _method?: string;
    }>({
        name: '',
        logo: '',
        logo_file: null,
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
            logo_file: null,
            description: b.description || '',
            website: b.website || '',
            is_active: b.is_active,
        });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(`${prefix}/admin/brands`, {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBrand) return;
        editForm.transform((data) => ({
            ...data,
            _method: 'PUT',
        }));
        editForm.post(`${prefix}/admin/brands/${editingBrand.id}`, {
            forceFormData: true,
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
                <CatalogList
                    title="Partner Brands"
                    totalCount={totalBrands}
                    countLabel="Brands"
                    addButtonLabel="Add Brand"
                    onAdd={() => setIsCreateOpen(true)}
                    search={search}
                    onSearchChange={handleSearch}
                    searchPlaceholder="Search brands by name, description, website..."
                    items={brandList}
                    paginationData={brands}
                    gridClassName="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
                    emptyMessage="No brands found matching your search. Click &quot;Add Brand&quot; to create one."
                    renderCard={(b) => (
                        <CatalogCard
                            key={b.id}
                            title={b.name}
                            description={b.description || 'Authentic skincare and cosmetic formulas.'}
                            image={b.logo}
                            fallbackIcon={<Sparkles className="size-8" />}
                            status={b.is_active}
                            meta={
                                <Badge variant="secondary" className="text-xs">
                                    {b.products_count ?? 0} Products
                                </Badge>
                            }
                            footerLeft={
                                b.website ? (
                                    <span className="text-[11px] text-neutral-400 truncate max-w-[130px] block">
                                        {b.website.replace(/^https?:\/\//, '')}
                                    </span>
                                ) : null
                            }
                            onEdit={() => handleOpenEdit(b)}
                            onDelete={() => setDeletingBrand(b)}
                        />
                    )}
                />

                {/* Add Brand Modal */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Add Brand</DialogTitle>
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

                            <SingleImageUpload
                                file={createForm.data.logo_file}
                                onFileChange={(file) => createForm.setData('logo_file', file)}
                                existingUrl={createForm.data.logo}
                                onExistingUrlChange={(url) => createForm.setData('logo', url || '')}
                                label="Brand Logo"
                                description="Upload brand logo icon or mark (PNG, JPG, SVG, WEBP)"
                            />

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
                                <Button type="submit" disabled={createForm.processing} className="bg-primary hover:bg-[var(--primary-hover)] shadow-[0_2px_4px_rgba(var(--primary-rgb),0.4)] text-white">
                                    {createForm.processing ? 'Creating...' : 'Create Brand'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Brand Modal */}
                <Dialog open={!!editingBrand} onOpenChange={(open) => !open && setEditingBrand(null)}>
                    <DialogContent className="max-w-lg">
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

                            <SingleImageUpload
                                file={editForm.data.logo_file}
                                onFileChange={(file) => editForm.setData('logo_file', file)}
                                existingUrl={editForm.data.logo}
                                onExistingUrlChange={(url) => editForm.setData('logo', url || '')}
                                label="Brand Logo"
                                description="Upload brand logo icon or mark (PNG, JPG, SVG, WEBP)"
                            />

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
                                <Button type="submit" disabled={editForm.processing} className="bg-primary hover:bg-[var(--primary-hover)] shadow-[0_2px_4px_rgba(var(--primary-rgb),0.4)] text-white">
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

BrandsIndex.layout = () => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Brands',
            href: '/admin/brands',
        },
    ],
});
