import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Filter,
    Images,
    Package,
    Pencil,
    Plus,
    Search,
    Sparkles,
    Trash2,
} from 'lucide-react';
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
import { ProductImagesInput } from '@/components/product-images-input';
import { RichTextEditor } from '@/components/rich-text-editor';
import type { Brand, Category, Product } from '@/types';

type Props = {
    products: Product[];
    categories: Category[];
    brands: Brand[];
    filters: {
        search?: string;
        category_id?: string;
        brand_id?: string;
        stock?: string;
    };
};

export default function ProductsIndex({
    products = [],
    categories = [],
    brands = [],
    filters = {},
}: Props) {
    const page = usePage();
    const teamSlug = (page.props.currentTeam as { slug?: string } | undefined)?.slug || '';
    const prefix = teamSlug ? `/${teamSlug}` : '';

    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || '');
    const [selectedBrand, setSelectedBrand] = useState(filters.brand_id || '');
    const [selectedStock, setSelectedStock] = useState(filters.stock || '');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

    const createForm = useForm<{
        name: string;
        brand_id: string | number;
        category_id: string | number;
        sku: string;
        price: string;
        old_price: string;
        cost_price: string;
        stock_quantity: number;
        low_stock_threshold: number;
        badge: string;
        image: string;
        image_file: File | null;
        gallery_files: File[];
        description: string;
        problems: string;
        is_active: boolean;
        is_featured: boolean;
    }>({
        name: '',
        brand_id: brands[0]?.id || '',
        category_id: categories[0]?.id || '',
        sku: '',
        price: '',
        old_price: '',
        cost_price: '',
        stock_quantity: 20,
        low_stock_threshold: 5,
        badge: 'Best seller',
        image: '',
        image_file: null,
        gallery_files: [],
        description: '',
        problems: 'Sensitive skin, Radiance',
        is_active: true,
        is_featured: false,
    });

    const editForm = useForm<{
        name: string;
        brand_id: string | number;
        category_id: string | number;
        sku: string;
        price: string;
        old_price: string;
        cost_price: string;
        stock_quantity: number;
        low_stock_threshold: number;
        badge: string;
        image: string;
        image_file: File | null;
        existing_gallery: string[];
        gallery_files: File[];
        description: string;
        problems: string;
        is_active: boolean;
        is_featured: boolean;
        _method?: string;
    }>({
        name: '',
        brand_id: '' as string | number,
        category_id: '' as string | number,
        sku: '',
        price: '',
        old_price: '',
        cost_price: '',
        stock_quantity: 0,
        low_stock_threshold: 5,
        badge: '',
        image: '',
        image_file: null,
        existing_gallery: [],
        gallery_files: [],
        description: '',
        problems: '',
        is_active: true,
        is_featured: false,
    });

    const deleteForm = useForm({});

    const handleFilterChange = (params: {
        search?: string;
        category_id?: string;
        brand_id?: string;
        stock?: string;
    }) => {
        router.get(`${prefix}/admin/products`, {
            search: params.search ?? search,
            category_id: params.category_id ?? selectedCategory,
            brand_id: params.brand_id ?? selectedBrand,
            stock: params.stock ?? selectedStock,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleOpenEdit = (p: Product) => {
        setEditingProduct(p);
        editForm.setData({
            name: p.name,
            brand_id: p.brand_id || '',
            category_id: p.category_id || '',
            sku: p.sku,
            price: String(p.price),
            old_price: p.old_price ? String(p.old_price) : '',
            cost_price: p.cost_price ? String(p.cost_price) : '',
            stock_quantity: p.stock_quantity,
            low_stock_threshold: p.low_stock_threshold,
            badge: p.badge || '',
            image: p.image || '',
            image_file: null,
            existing_gallery: Array.isArray(p.gallery) ? p.gallery : [],
            gallery_files: [],
            description: p.description || '',
            problems: Array.isArray(p.problems) ? p.problems.join(', ') : '',
            is_active: p.is_active,
            is_featured: p.is_featured,
        });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const problemsArray = createForm.data.problems
            ? createForm.data.problems.split(',').map((s) => s.trim()).filter(Boolean)
            : [];

        createForm.transform((data) => ({
            ...data,
            problems: problemsArray,
        }));

        createForm.post(`${prefix}/admin/products`, {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        const problemsArray = editForm.data.problems
            ? editForm.data.problems.split(',').map((s) => s.trim()).filter(Boolean)
            : [];

        editForm.transform((data) => ({
            ...data,
            _method: 'PUT',
            problems: problemsArray,
        }));

        editForm.post(`${prefix}/admin/products/${editingProduct.id}`, {
            forceFormData: true,
            onSuccess: () => {
                setEditingProduct(null);
                editForm.reset();
            },
        });
    };

    const handleDeleteSubmit = () => {
        if (!deletingProduct) return;
        deleteForm.delete(`${prefix}/admin/products/${deletingProduct.id}`, {
            onSuccess: () => {
                setDeletingProduct(null);
            },
        });
    };

    return (
        <>
            <Head title="Products Catalogue & Inventory" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                Product Catalogue & Stock
                            </h1>
                            <Badge variant="outline" className="text-xs">
                                {products.length} Skincare Products
                            </Badge>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Manage inventory, pricing, badges, and formulations for Classy Missy beauty products.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-[#7367F0] hover:bg-[#685dd8] shadow-[0_2px_4px_rgba(115,103,240,0.4)] text-white flex items-center gap-1.5"
                    >
                        <Plus className="size-4" />
                        <span>Add New Product</span>
                    </Button>
                </div>

                {/* Filter Toolbar */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 size-4 text-neutral-400" />
                        <Input
                            placeholder="Search by product name or SKU..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                handleFilterChange({ search: e.target.value });
                            }}
                            className="pl-9 text-xs"
                        />
                    </div>

                    <div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                handleFilterChange({ category_id: e.target.value });
                            }}
                            className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-800 shadow-sm focus:border-[#7367f0] focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                        >
                            <option value="">All Categories</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <select
                            value={selectedBrand}
                            onChange={(e) => {
                                setSelectedBrand(e.target.value);
                                handleFilterChange({ brand_id: e.target.value });
                            }}
                            className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-800 shadow-sm focus:border-[#7367f0] focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                        >
                            <option value="">All Brands</option>
                            {brands.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <select
                            value={selectedStock}
                            onChange={(e) => {
                                setSelectedStock(e.target.value);
                                handleFilterChange({ stock: e.target.value });
                            }}
                            className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-800 shadow-sm focus:border-[#7367f0] focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                        >
                            <option value="">All Stock Levels</option>
                            <option value="low">Low Stock (≤ threshold)</option>
                            <option value="out">Out of Stock</option>
                        </select>
                    </div>
                </div>

                {/* Products Table */}
                <Card className="border-neutral-200 shadow-sm dark:border-neutral-800">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-semibold text-neutral-500 uppercase tracking-wider dark:border-neutral-800 dark:bg-neutral-900/50">
                                    <tr>
                                        <th className="px-6 py-3.5">Product</th>
                                        <th className="px-6 py-3.5">Category & Brand</th>
                                        <th className="px-6 py-3.5">Price</th>
                                        <th className="px-6 py-3.5">Inventory</th>
                                        <th className="px-6 py-3.5">Badge</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-sm text-neutral-500">
                                                No products found. Click "Add New Product" to populate your catalog.
                                            </td>
                                        </tr>
                                    ) : (
                                        products.map((p) => {
                                            const isLow = p.stock_quantity <= p.low_stock_threshold;
                                            return (
                                                <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors dark:hover:bg-neutral-800/40">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-800">
                                                                {p.image ? (
                                                                    <img src={p.image} alt={p.name} className="size-full object-cover" />
                                                                ) : (
                                                                    <div className="flex size-full items-center justify-center text-neutral-400">
                                                                        <Package className="size-5" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 max-w-xs">
                                                                <div className="font-semibold text-neutral-900 truncate dark:text-neutral-100">
                                                                    {p.name}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs text-neutral-400">
                                                                    <span>SKU: {p.sku}</span>
                                                                    {Array.isArray(p.gallery) && p.gallery.length > 0 && (
                                                                        <span className="inline-flex items-center gap-1 rounded bg-[#7367f0]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#7367F0] dark:bg-[#7367f0]/20">
                                                                            <Images className="size-2.5" />
                                                                            <span>{p.gallery.length} photos</span>
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                                                                {p.category?.name || 'Skincare'}
                                                            </div>
                                                            <div className="text-[11px] text-[#7367F0] font-medium dark:text-rose-400">
                                                                {p.brand?.name || '—'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                                                            ৳{Number(p.price).toLocaleString()}
                                                        </div>
                                                        {p.old_price && (
                                                            <div className="text-[11px] text-neutral-400 line-through">
                                                                ৳{Number(p.old_price).toLocaleString()}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                            {isLow && (
                                                                <AlertTriangle className="size-3.5 text-amber-500" />
                                                            )}
                                                            <span className={`text-xs font-semibold ${isLow ? 'text-amber-600' : 'text-neutral-700 dark:text-neutral-300'}`}>
                                                                {p.stock_quantity} units
                                                            </span>
                                                        </div>
                                                        <div className="text-[10px] text-neutral-400">
                                                            Alert at ≤ {p.low_stock_threshold}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {p.badge ? (
                                                            <Badge className="bg-[#7367f0]/10 text-[#7367F0] border-[#7367f0]/20 text-[10px] dark:bg-rose-950/40 dark:text-rose-300">
                                                                <Sparkles className="mr-1 size-2.5" /> {p.badge}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-xs text-neutral-400">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {p.is_active ? (
                                                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] dark:bg-emerald-950/40 dark:text-emerald-300">
                                                                Active
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[10px]">
                                                                Draft
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleOpenEdit(p)}
                                                                className="h-8 px-2.5 text-xs flex items-center gap-1"
                                                            >
                                                                <Pencil className="size-3" />
                                                                <span>Edit</span>
                                                            </Button>

                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setDeletingProduct(p)}
                                                                className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                                                            >
                                                                <Trash2 className="size-3" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Add Product Modal */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add New Skincare Product</DialogTitle>
                            <DialogDescription>
                                Fill in specifications, pricing, formula highlights, and inventory thresholds.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="p-name">Product Name *</Label>
                                <Input
                                    id="p-name"
                                    placeholder="e.g. Skin Perfecting 2% BHA Liquid Exfoliant"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    required
                                />
                                {createForm.errors.name && (
                                    <p className="text-xs text-red-600">{createForm.errors.name}</p>
                                )}
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="p-cat">Category</Label>
                                    <select
                                        id="p-cat"
                                        value={createForm.data.category_id}
                                        onChange={(e) => createForm.setData('category_id', e.target.value)}
                                        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-[#7367f0] focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="p-brand">Brand</Label>
                                    <select
                                        id="p-brand"
                                        value={createForm.data.brand_id}
                                        onChange={(e) => createForm.setData('brand_id', e.target.value)}
                                        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-[#7367f0] focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                    >
                                        <option value="">Select Brand</option>
                                        {brands.map((b) => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="p-sku">SKU (optional)</Label>
                                    <Input
                                        id="p-sku"
                                        placeholder="Auto-generated if empty"
                                        value={createForm.data.sku}
                                        onChange={(e) => createForm.setData('sku', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="p-price">Price (৳) *</Label>
                                    <Input
                                        id="p-price"
                                        type="number"
                                        placeholder="2550"
                                        value={createForm.data.price}
                                        onChange={(e) => createForm.setData('price', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="p-old-price">Old / Regular Price (৳)</Label>
                                    <Input
                                        id="p-old-price"
                                        type="number"
                                        placeholder="2750"
                                        value={createForm.data.old_price}
                                        onChange={(e) => createForm.setData('old_price', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="p-stock">Stock Quantity *</Label>
                                    <Input
                                        id="p-stock"
                                        type="number"
                                        value={createForm.data.stock_quantity}
                                        onChange={(e) => createForm.setData('stock_quantity', Number(e.target.value))}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="p-low">Low Stock Alert At</Label>
                                    <Input
                                        id="p-low"
                                        type="number"
                                        value={createForm.data.low_stock_threshold}
                                        onChange={(e) => createForm.setData('low_stock_threshold', Number(e.target.value))}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="p-badge">Badge Label</Label>
                                    <Input
                                        id="p-badge"
                                        placeholder="e.g. Glow of the day, Best seller"
                                        value={createForm.data.badge}
                                        onChange={(e) => createForm.setData('badge', e.target.value)}
                                    />
                                </div>
                            </div>

                            <ProductImagesInput
                                thumbnailFile={createForm.data.image_file}
                                onThumbnailFileChange={(file) => createForm.setData('image_file', file)}
                                existingThumbnail={createForm.data.image}
                                onExistingThumbnailChange={(url) => createForm.setData('image', url || '')}
                                galleryFiles={createForm.data.gallery_files}
                                onGalleryFilesChange={(files) => createForm.setData('gallery_files', files)}
                            />

                            <div className="space-y-1.5">
                                <Label htmlFor="p-problems">Problems Solved (comma separated)</Label>
                                <Input
                                    id="p-problems"
                                    placeholder="Sensitive skin, Radiance, Skin barrier"
                                    value={createForm.data.problems}
                                    onChange={(e) => createForm.setData('problems', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="p-desc">Product Description & Formula Details</Label>
                                    <span className="text-[11px] text-[#a5a3ae]">Rich Text Editor (HTML)</span>
                                </div>
                                <RichTextEditor
                                    value={createForm.data.description}
                                    onChange={(val) => createForm.setData('description', val)}
                                    placeholder="Detailed formula and benefit overview, key active ingredients, usage instructions..."
                                />
                            </div>

                            <div className="flex items-center gap-6 pt-1">
                                <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={createForm.data.is_active}
                                        onChange={(e) => createForm.setData('is_active', e.target.checked)}
                                        className="rounded border-neutral-300 text-[#7367F0] focus:ring-[#7367f0]"
                                    />
                                    <span>Active in Catalogue</span>
                                </label>

                                <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={createForm.data.is_featured}
                                        onChange={(e) => createForm.setData('is_featured', e.target.checked)}
                                        className="rounded border-neutral-300 text-[#7367F0] focus:ring-[#7367f0]"
                                    />
                                    <span>Feature on Homepage</span>
                                </label>
                            </div>

                            <DialogFooter className="pt-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="bg-[#7367F0] hover:bg-[#685dd8] shadow-[0_2px_4px_rgba(115,103,240,0.4)] text-white"
                                >
                                    {createForm.processing ? 'Saving...' : 'Create Product'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Product Modal */}
                <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
                    <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Product: {editingProduct?.name}</DialogTitle>
                            <DialogDescription>
                                Update pricing, stock count, formula highlights, or description.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-p-name">Product Name *</Label>
                                <Input
                                    id="edit-p-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-p-cat">Category</Label>
                                    <select
                                        id="edit-p-cat"
                                        value={editForm.data.category_id}
                                        onChange={(e) => editForm.setData('category_id', e.target.value)}
                                        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-[#7367f0] focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-p-brand">Brand</Label>
                                    <select
                                        id="edit-p-brand"
                                        value={editForm.data.brand_id}
                                        onChange={(e) => editForm.setData('brand_id', e.target.value)}
                                        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-[#7367f0] focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                    >
                                        <option value="">Select Brand</option>
                                        {brands.map((b) => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-p-sku">SKU *</Label>
                                    <Input
                                        id="edit-p-sku"
                                        value={editForm.data.sku}
                                        onChange={(e) => editForm.setData('sku', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-p-price">Price (৳) *</Label>
                                    <Input
                                        id="edit-p-price"
                                        type="number"
                                        value={editForm.data.price}
                                        onChange={(e) => editForm.setData('price', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-p-old-price">Old Price (৳)</Label>
                                    <Input
                                        id="edit-p-old-price"
                                        type="number"
                                        value={editForm.data.old_price}
                                        onChange={(e) => editForm.setData('old_price', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-p-stock">Stock Quantity *</Label>
                                    <Input
                                        id="edit-p-stock"
                                        type="number"
                                        value={editForm.data.stock_quantity}
                                        onChange={(e) => editForm.setData('stock_quantity', Number(e.target.value))}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-p-low">Low Stock Alert At</Label>
                                    <Input
                                        id="edit-p-low"
                                        type="number"
                                        value={editForm.data.low_stock_threshold}
                                        onChange={(e) => editForm.setData('low_stock_threshold', Number(e.target.value))}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-p-badge">Badge Label</Label>
                                    <Input
                                        id="edit-p-badge"
                                        value={editForm.data.badge}
                                        onChange={(e) => editForm.setData('badge', e.target.value)}
                                    />
                                </div>
                            </div>

                            <ProductImagesInput
                                thumbnailFile={editForm.data.image_file}
                                onThumbnailFileChange={(file) => editForm.setData('image_file', file)}
                                existingThumbnail={editForm.data.image}
                                onExistingThumbnailChange={(url) => editForm.setData('image', url || '')}
                                existingGallery={editForm.data.existing_gallery}
                                onExistingGalleryChange={(urls) => editForm.setData('existing_gallery', urls)}
                                galleryFiles={editForm.data.gallery_files}
                                onGalleryFilesChange={(files) => editForm.setData('gallery_files', files)}
                            />

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-p-problems">Problems Solved (comma separated)</Label>
                                <Input
                                    id="edit-p-problems"
                                    value={editForm.data.problems}
                                    onChange={(e) => editForm.setData('problems', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="edit-p-desc">Product Description & Formula Details</Label>
                                    <span className="text-[11px] text-[#a5a3ae]">Rich Text Editor (HTML)</span>
                                </div>
                                <RichTextEditor
                                    value={editForm.data.description}
                                    onChange={(val) => editForm.setData('description', val)}
                                    placeholder="Update formulation, benefits, and instructions..."
                                />
                            </div>

                            <div className="flex items-center gap-6 pt-1">
                                <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editForm.data.is_active}
                                        onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                        className="rounded border-neutral-300 text-[#7367F0] focus:ring-[#7367f0]"
                                    />
                                    <span>Active in Catalogue</span>
                                </label>

                                <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editForm.data.is_featured}
                                        onChange={(e) => editForm.setData('is_featured', e.target.checked)}
                                        className="rounded border-neutral-300 text-[#7367F0] focus:ring-[#7367f0]"
                                    />
                                    <span>Feature on Homepage</span>
                                </label>
                            </div>

                            <DialogFooter className="pt-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditingProduct(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="bg-[#7367F0] hover:bg-[#685dd8] shadow-[0_2px_4px_rgba(115,103,240,0.4)] text-white"
                                >
                                    {editForm.processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Product Modal */}
                <Dialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-red-600">Delete Product</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete <strong>{deletingProduct?.name}</strong>? This will remove it from the store catalog.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="pt-3">
                            <Button variant="outline" onClick={() => setDeletingProduct(null)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteSubmit}
                                disabled={deleteForm.processing}
                            >
                                {deleteForm.processing ? 'Deleting...' : 'Confirm Delete'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

ProductsIndex.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? `/${props.currentTeam.slug}/dashboard` : '/dashboard',
        },
        {
            title: 'Products',
            href: props.currentTeam ? `/${props.currentTeam.slug}/admin/products` : '/admin/products',
        },
    ],
});
