import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import {
    CheckCircle,
    ExternalLink,
    Eye,
    Globe,
    Package,
    Pencil,
    Phone,
    Plus,
    Rocket,
    Search,
    Shield,
    Trash2,
    Truck,
} from 'lucide-react';
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
import type { LandingPage, LandingPagePackage, PaginatedData, Product } from '@/types';

type Props = {
    landingPages: PaginatedData<LandingPage> | LandingPage[];
    products: Product[];
    filters?: {
        search?: string;
        status?: string;
    };
};

const defaultPackages: LandingPagePackage[] = [
    {
        id: 'pack_1',
        name: '১টি প্যাক (স্ট্যান্ডার্ড ট্রায়াল)',
        quantity: 1,
        price: 1050,
        old_price: 1350,
        tag: 'একক ট্রায়াল',
        free_delivery: false,
        popular: false,
    },
    {
        id: 'pack_2',
        name: '২টি প্যাক (সুপার সেভার ডাবল কম্বো)',
        quantity: 1,
        price: 1750,
        old_price: 2250,
        tag: '🔥 সবচেয়ে জনপ্রিয় চয়েজ',
        free_delivery: false,
        popular: true,
    },
    {
        id: 'pack_3',
        name: '৩টি প্যাক (মেগা ফ্যামিলি ট্রিপল কম্বো)',
        quantity: 1,
        price: 2450,
        old_price: 3150,
        tag: '⭐ বেস্ট ভ্যালু + ফ্রি ডেলিভারি',
        free_delivery: true,
        popular: false,
    },
];

export default function LandingPagesIndex({ landingPages, products, filters = {} }: Props) {
    const pagesList = Array.isArray(landingPages) ? landingPages : (landingPages?.data || []);
    const totalPages = Array.isArray(landingPages) ? landingPages.length : (landingPages?.total ?? 0);
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (val: string) => {
        setSearch(val);
        router.get('/admin/landing-pages', { search: val }, {
            preserveState: true,
            replace: true,
        });
    };

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<LandingPage | null>(null);
    const [deletingPage, setDeletingPage] = useState<LandingPage | null>(null);
    const [activeTab, setActiveTab] = useState<'general' | 'packages' | 'benefits' | 'content'>('general');

    // Form setup for Create
    const createForm = useForm({
        product_id: '',
        title: '',
        slug: '',
        badge: '🔥 হট অফার',
        hotline: '01799-912525',
        whatsapp: '01979-912525',
        announcement_text: '🔥 স্পেশাল ডিসকাউন্ট অফার! ক্যাশ অন ডেলিভারি ও পার্সেল দেখে নেওয়ার সুযোগ।',
        countdown_enabled: true,
        countdown_hours: 4,
        headline: '',
        subheadline: '',
        hero_description: '',
        video_url: '',
        banner_image: '',
        banner_image_file: null as File | null,
        packages: defaultPackages,
        delivery_inside_dhaka: 70,
        delivery_outside_dhaka: 130,
        guarantee_text: 'ল্যাব টেস্টে ভেজাল প্রমাণিত হলে শতভাগ মানিব্যাক গ্যারান্টি!',
        is_active: true,
        is_default_for_product: true,
        meta_title: '',
        meta_description: '',
    });

    // Form setup for Edit
    const editForm = useForm({
        product_id: '',
        title: '',
        slug: '',
        badge: '',
        hotline: '',
        whatsapp: '',
        announcement_text: '',
        countdown_enabled: true,
        countdown_hours: 4,
        headline: '',
        subheadline: '',
        hero_description: '',
        video_url: '',
        banner_image: '',
        banner_image_file: null as File | null,
        packages: defaultPackages,
        delivery_inside_dhaka: 70,
        delivery_outside_dhaka: 130,
        guarantee_text: '',
        is_active: true,
        is_default_for_product: true,
        meta_title: '',
        meta_description: '',
    });

    const deleteForm = useForm({});

    const openCreateModal = () => {
        createForm.reset();
        createForm.setData({
            product_id: products[0]?.id ? String(products[0].id) : '',
            title: 'New Product Landing Page',
            slug: 'new-product-combo',
            badge: '🔥 মোস্ট পপুলার কম্বো',
            hotline: '01799-912525',
            whatsapp: '01979-912525',
            announcement_text: '🔥 স্পেশাল ডিসকাউন্ট অফার! ক্যাশ অন ডেলিভারি ও পার্সেল দেখে নেওয়ার সুযোগ।',
            countdown_enabled: true,
            countdown_hours: 4,
            headline: products[0]?.name ? `${products[0].name} (স্পেশাল অফার)` : 'Exclusive Product Offer',
            subheadline: '১০০% অরিজিনাল ও প্রিমিয়াম কোয়ালিটি নিশ্চয়তা',
            hero_description: 'সরাসরি প্রস্তুতকারক থেকে সংগৃহীত শতভাগ খাঁটি ও পরীক্ষিত পণ্য। সারা দেশে ক্যাশ অন হোম ডেলিভারি।',
            video_url: '',
            banner_image: products[0]?.image || '',
            banner_image_file: null,
            packages: defaultPackages,
            delivery_inside_dhaka: 70,
            delivery_outside_dhaka: 130,
            guarantee_text: 'ল্যাব টেস্টে ভেজাল প্রমাণিত হলে শতভাগ মানিব্যাক গ্যারান্টি!',
            is_active: true,
            is_default_for_product: true,
            meta_title: '',
            meta_description: '',
        });
        setActiveTab('general');
        setIsCreateOpen(true);
    };

    const openEditModal = (page: LandingPage) => {
        setEditingPage(page);
        editForm.setData({
            product_id: page.product_id ? String(page.product_id) : '',
            title: page.title || '',
            slug: page.slug || '',
            badge: page.badge || '',
            hotline: page.hotline || '01799-912525',
            whatsapp: page.whatsapp || '01979-912525',
            announcement_text: page.announcement_text || '',
            countdown_enabled: Boolean(page.countdown_enabled),
            countdown_hours: page.countdown_hours || 4,
            headline: page.headline || '',
            subheadline: page.subheadline || '',
            hero_description: page.hero_description || '',
            video_url: page.video_url || '',
            banner_image: page.banner_image || '',
            banner_image_file: null,
            packages: page.packages?.length ? page.packages : defaultPackages,
            delivery_inside_dhaka: Number(page.delivery_inside_dhaka || 70),
            delivery_outside_dhaka: Number(page.delivery_outside_dhaka || 130),
            guarantee_text: page.guarantee_text || '',
            is_active: Boolean(page.is_active),
            is_default_for_product: Boolean(page.is_default_for_product),
            meta_title: page.meta_title || '',
            meta_description: page.meta_description || '',
        });
        setActiveTab('general');
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/landing-pages', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPage) return;
        editForm.put(`/admin/landing-pages/${editingPage.id}`, {
            onSuccess: () => {
                setEditingPage(null);
            },
        });
    };

    const handleDeleteSubmit = () => {
        if (!deletingPage) return;
        deleteForm.delete(`/admin/landing-pages/${deletingPage.id}`, {
            onSuccess: () => {
                setDeletingPage(null);
            },
        });
    };

    return (
        <>
            <Head title="Landing Pages & Sales Funnels" />

            <div className="space-y-6">
                {/* Header & Stats */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                Single Product Landing Pages
                            </h1>
                            <Badge variant="secondary" className="font-mono text-xs">
                                {totalPages} Total
                            </Badge>
                        </div>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Create and manage high-converting single product sales funnels with on-page Cash on Delivery checkout.
                        </p>
                    </div>

                    <Button onClick={openCreateModal} className="shrink-0 gap-2">
                        <Plus className="size-4" />
                        Create Landing Page
                    </Button>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                        <Input
                            placeholder="Search by title, headline, or slug..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9 text-sm"
                        />
                    </div>
                </div>

                {/* Landing Pages List */}
                {pagesList.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800">
                            <Rocket className="size-6" />
                        </div>
                        <h3 className="mt-3 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                            No landing pages created yet
                        </h3>
                        <p className="mt-1 text-sm text-neutral-500">
                            Create your first sales funnel landing page to drive direct traffic from Facebook, TikTok, or Google Ads.
                        </p>
                        <Button onClick={openCreateModal} className="mt-4 gap-2">
                            <Plus className="size-4" />
                            Create Landing Page
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {pagesList.map((lp) => {
                            const isLive = lp.is_active;
                            const packageCount = lp.packages?.length || 0;
                            const defaultProduct = lp.product;

                            return (
                                <div
                                    key={lp.id}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                                >
                                    <div className="space-y-3.5">
                                        {/* Status & Badge */}
                                        <div className="flex items-center justify-between gap-2">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                    isLive
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                                        : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                                                }`}
                                            >
                                                <span
                                                    className={`size-1.5 rounded-full ${
                                                        isLive ? 'bg-emerald-500' : 'bg-neutral-400'
                                                    }`}
                                                />
                                                {isLive ? 'Active Funnel' : 'Draft / Inactive'}
                                            </span>

                                            {lp.badge && (
                                                <Badge variant="outline" className="text-[11px] font-medium">
                                                    {lp.badge}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Image preview & Title */}
                                        <div className="flex gap-3.5">
                                            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800">
                                                <img
                                                    src={lp.banner_image || defaultProduct?.image || '/logo.svg'}
                                                    alt=""
                                                    className="size-full object-cover"
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="line-clamp-1 font-bold text-sm text-neutral-900 dark:text-neutral-100">
                                                    {lp.title}
                                                </h3>
                                                <p className="line-clamp-1 text-xs text-neutral-500 mt-0.5">
                                                    {lp.headline || lp.subheadline || 'Single Product Funnel'}
                                                </p>
                                                <div className="mt-1 flex items-center gap-1 font-mono text-[11px] text-amber-600 dark:text-amber-400">
                                                    <Globe className="size-3" />
                                                    <span>/landing/{lp.slug}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info tags */}
                                        <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600 dark:text-neutral-400 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                                            <div className="flex items-center gap-1.5">
                                                <Package className="size-3.5 text-neutral-400" />
                                                <span>{packageCount} Packages</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Truck className="size-3.5 text-neutral-400" />
                                                <span>৳{lp.delivery_inside_dhaka || 70} / ৳{lp.delivery_outside_dhaka || 130}</span>
                                            </div>
                                            {lp.hotline && (
                                                <div className="flex items-center gap-1.5 col-span-2 text-[11px] text-neutral-500 truncate">
                                                    <Phone className="size-3 text-neutral-400" />
                                                    <span>Hotline: {lp.hotline}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5">
                                            {/* Preview Live Standalone Funnel */}
                                            <a
                                                href={`http://localhost:5173/landing/${lp.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300"
                                                title="Open standalone landing page"
                                            >
                                                <Eye className="size-3.5 text-amber-600" />
                                                <span>Preview</span>
                                                <ExternalLink className="size-2.5 opacity-60" />
                                            </a>

                                            {/* Product view */}
                                            <a
                                                href={`http://localhost:5173/product/${lp.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2 py-1 text-[11px] text-neutral-500 hover:text-black dark:border-neutral-700"
                                                title="View in product route"
                                            >
                                                <span>/product</span>
                                            </a>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditModal(lp)}
                                                className="size-8 p-0"
                                                title="Edit Landing Page"
                                            >
                                                <Pencil className="size-4" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeletingPage(lp)}
                                                className="size-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                                title="Delete"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* CREATE MODAL */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <Rocket className="size-5 text-amber-600" />
                            Create Single Product Landing Page
                        </DialogTitle>
                        <DialogDescription>
                            Configure a dedicated sales funnel with product combo packages and on-page cash on delivery checkout.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Tabs navigation */}
                    <div className="flex border-b border-neutral-200 text-xs font-semibold dark:border-neutral-800">
                        <button
                            type="button"
                            onClick={() => setActiveTab('general')}
                            className={`pb-2.5 px-3 border-b-2 transition ${
                                activeTab === 'general'
                                    ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                                    : 'border-transparent text-neutral-500 hover:text-black'
                            }`}
                        >
                            1. General & Hero
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('packages')}
                            className={`pb-2.5 px-3 border-b-2 transition ${
                                activeTab === 'packages'
                                    ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                                    : 'border-transparent text-neutral-500 hover:text-black'
                            }`}
                        >
                            2. Packages & Delivery
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('benefits')}
                            className={`pb-2.5 px-3 border-b-2 transition ${
                                activeTab === 'benefits'
                                    ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                                    : 'border-transparent text-neutral-500 hover:text-black'
                            }`}
                        >
                            3. Guarantee & SEO
                        </button>
                    </div>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                        {activeTab === 'general' && (
                            <div className="space-y-4">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="create-title">Page Title *</Label>
                                        <Input
                                            id="create-title"
                                            required
                                            value={createForm.data.title}
                                            onChange={(e) => createForm.setData('title', e.target.value)}
                                            placeholder="e.g. Multiple Natural Honey Combo Landing"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="create-slug">URL Slug *</Label>
                                        <Input
                                            id="create-slug"
                                            required
                                            value={createForm.data.slug}
                                            onChange={(e) => createForm.setData('slug', e.target.value)}
                                            placeholder="e.g. multiple-honey-combo"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="create-product">Associated Store Product (Optional)</Label>
                                        <select
                                            id="create-product"
                                            value={createForm.data.product_id}
                                            onChange={(e) => {
                                                const pId = e.target.value;
                                                const sel = products.find((p) => String(p.id) === pId);
                                                createForm.setData((prev) => ({
                                                    ...prev,
                                                    product_id: pId,
                                                    headline: sel?.name || prev.headline,
                                                    banner_image: sel?.image || prev.banner_image,
                                                }));
                                            }}
                                            className="w-full text-sm rounded-lg border border-neutral-300 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-800"
                                        >
                                            <option value="">-- No linked product --</option>
                                            {products.map((prod) => (
                                                <option key={prod.id} value={prod.id}>
                                                    {prod.name} (৳{prod.price})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="create-badge">Offer Badge Text</Label>
                                        <Input
                                            id="create-badge"
                                            value={createForm.data.badge}
                                            onChange={(e) => createForm.setData('badge', e.target.value)}
                                            placeholder="e.g. 🔥 মোস্ট পপুলার কম্বো"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="create-hotline">Hotline Phone</Label>
                                        <Input
                                            id="create-hotline"
                                            value={createForm.data.hotline}
                                            onChange={(e) => createForm.setData('hotline', e.target.value)}
                                            placeholder="01799-912525"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="create-whatsapp">WhatsApp Number</Label>
                                        <Input
                                            id="create-whatsapp"
                                            value={createForm.data.whatsapp}
                                            onChange={(e) => createForm.setData('whatsapp', e.target.value)}
                                            placeholder="01979-912525"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="create-announcement">Urgency Bar Announcement Text</Label>
                                    <Input
                                        id="create-announcement"
                                        value={createForm.data.announcement_text}
                                        onChange={(e) => createForm.setData('announcement_text', e.target.value)}
                                        placeholder="🔥 স্পেশাল ডিসকাউন্ট অফার! ক্যাশ অন ডেলিভারি ও পার্সেল দেখে নেওয়ার সুযোগ।"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="create-headline">Hero Main Headline (Bangla)</Label>
                                    <Input
                                        id="create-headline"
                                        value={createForm.data.headline}
                                        onChange={(e) => createForm.setData('headline', e.target.value)}
                                        placeholder="Multiple Natural Honey Combo (খাঁটি প্রাকৃতিক মাল্টিপল মধু কম্বো)"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="create-subheadline">Hero Subtitle</Label>
                                    <Input
                                        id="create-subheadline"
                                        value={createForm.data.subheadline}
                                        onChange={(e) => createForm.setData('subheadline', e.target.value)}
                                        placeholder="১০০% খাঁটি ও প্রাকৃতিক সুন্দরবনের খলিসা মধু, কালোজিরা ও লিচু ফুলের মধুর প্রিমিয়াম কম্বো"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="create-desc">Hero Description</Label>
                                    <textarea
                                        id="create-desc"
                                        rows={3}
                                        className="w-full text-sm rounded-lg border border-neutral-300 p-2.5 dark:border-neutral-700 dark:bg-neutral-800"
                                        value={createForm.data.hero_description}
                                        onChange={(e) => createForm.setData('hero_description', e.target.value)}
                                        placeholder="কোনো ধরনের কেমিক্যাল, চিনি বা ভেজাল ছাড়া সরাসরি সংগৃহীত..."
                                    />
                                </div>

                                <SingleImageUpload
                                    file={createForm.data.banner_image_file}
                                    onFileChange={(file) => createForm.setData('banner_image_file', file)}
                                    existingUrl={createForm.data.banner_image}
                                    onExistingUrlChange={(url) => createForm.setData('banner_image', url || '')}
                                    label="Hero Product Image"
                                    description="Upload product photo or provide image URL"
                                />
                            </div>
                        )}

                        {activeTab === 'packages' && (
                            <div className="space-y-4">
                                <p className="text-xs text-neutral-500">
                                    Configure 3 package combinations displayed on the landing page for high conversion:
                                </p>

                                {createForm.data.packages.map((pkg, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2 dark:border-neutral-700 dark:bg-neutral-800/50"
                                    >
                                        <div className="flex items-center justify-between font-bold text-xs">
                                            <span>প্যাকেজ {idx + 1}</span>
                                            {pkg.popular && (
                                                <Badge variant="default" className="text-[10px]">
                                                    Most Popular
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="grid gap-2 sm:grid-cols-3">
                                            <div className="space-y-1 sm:col-span-2">
                                                <Label className="text-[11px]">প্যাকেজের নাম</Label>
                                                <Input
                                                    value={pkg.name}
                                                    onChange={(e) => {
                                                        const copy = [...createForm.data.packages];
                                                        copy[idx].name = e.target.value;
                                                        createForm.setData('packages', copy);
                                                    }}
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[11px]">ট্যাগ / হাইলাইট</Label>
                                                <Input
                                                    value={pkg.tag || ''}
                                                    onChange={(e) => {
                                                        const copy = [...createForm.data.packages];
                                                        copy[idx].tag = e.target.value;
                                                        createForm.setData('packages', copy);
                                                    }}
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-2 sm:grid-cols-3 items-center">
                                            <div className="space-y-1">
                                                <Label className="text-[11px]">অফার প্রাইস (৳)</Label>
                                                <Input
                                                    type="number"
                                                    value={pkg.price}
                                                    onChange={(e) => {
                                                        const copy = [...createForm.data.packages];
                                                        copy[idx].price = Number(e.target.value);
                                                        createForm.setData('packages', copy);
                                                    }}
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[11px]">আগের প্রাইস (৳)</Label>
                                                <Input
                                                    type="number"
                                                    value={pkg.old_price}
                                                    onChange={(e) => {
                                                        const copy = [...createForm.data.packages];
                                                        copy[idx].old_price = Number(e.target.value);
                                                        createForm.setData('packages', copy);
                                                    }}
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 pt-4">
                                                <input
                                                    type="checkbox"
                                                    id={`create-pkg-free-${idx}`}
                                                    checked={pkg.free_delivery}
                                                    onChange={(e) => {
                                                        const copy = [...createForm.data.packages];
                                                        copy[idx].free_delivery = e.target.checked;
                                                        createForm.setData('packages', copy);
                                                    }}
                                                    className="rounded border-neutral-300"
                                                />
                                                <Label htmlFor={`create-pkg-free-${idx}`} className="text-xs">
                                                    ফ্রি ডেলিভারি
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                                    <div className="space-y-1">
                                        <Label className="text-xs">ডেলিভারি চার্জ (ঢাকা সিটি - ৳)</Label>
                                        <Input
                                            type="number"
                                            value={createForm.data.delivery_inside_dhaka}
                                            onChange={(e) =>
                                                createForm.setData('delivery_inside_dhaka', Number(e.target.value))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">ডেলিভারি চার্জ (ঢাকার বাইরে - ৳)</Label>
                                        <Input
                                            type="number"
                                            value={createForm.data.delivery_outside_dhaka}
                                            onChange={(e) =>
                                                createForm.setData('delivery_outside_dhaka', Number(e.target.value))
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'benefits' && (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="create-guarantee">গ্যারান্টি ও কোয়ালিটি প্রতিশ্রুতি টেক্সট</Label>
                                    <Input
                                        id="create-guarantee"
                                        value={createForm.data.guarantee_text}
                                        onChange={(e) => createForm.setData('guarantee_text', e.target.value)}
                                        placeholder="ল্যাব টেস্টে ভেজাল প্রমাণিত হলে শতভাগ মানিব্যাক গ্যারান্টি!"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="create-meta-title">SEO Meta Title</Label>
                                    <Input
                                        id="create-meta-title"
                                        value={createForm.data.meta_title}
                                        onChange={(e) => createForm.setData('meta_title', e.target.value)}
                                        placeholder="Multiple Honey Combo - খাঁটি প্রাকৃতিক মধু"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="create-meta-desc">SEO Meta Description</Label>
                                    <textarea
                                        id="create-meta-desc"
                                        rows={2}
                                        className="w-full text-sm rounded-lg border border-neutral-300 p-2 dark:border-neutral-700 dark:bg-neutral-800"
                                        value={createForm.data.meta_description}
                                        onChange={(e) => createForm.setData('meta_description', e.target.value)}
                                        placeholder="অরিজিনাল প্রাকৃতিক মধু কিনুন ক্যাশ অন ডেলিভারিতে..."
                                    />
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <input
                                        type="checkbox"
                                        id="create-is-active"
                                        checked={createForm.data.is_active}
                                        onChange={(e) => createForm.setData('is_active', e.target.checked)}
                                        className="rounded border-neutral-300"
                                    />
                                    <Label htmlFor="create-is-active" className="text-sm font-semibold">
                                        Active & Live (ল্যান্ডিং পেজ চালু থাকবে)
                                    </Label>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                {createForm.processing ? 'Creating...' : 'Create Landing Page'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* EDIT MODAL */}
            <Dialog open={!!editingPage} onOpenChange={(open) => !open && setEditingPage(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <Pencil className="size-5 text-amber-600" />
                            Edit Landing Page: {editingPage?.title}
                        </DialogTitle>
                        <DialogDescription>
                            Update content, combo packages, pricing, and live settings for this sales funnel.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Tabs navigation */}
                    <div className="flex border-b border-neutral-200 text-xs font-semibold dark:border-neutral-800">
                        <button
                            type="button"
                            onClick={() => setActiveTab('general')}
                            className={`pb-2.5 px-3 border-b-2 transition ${
                                activeTab === 'general'
                                    ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                                    : 'border-transparent text-neutral-500 hover:text-black'
                            }`}
                        >
                            1. General & Hero
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('packages')}
                            className={`pb-2.5 px-3 border-b-2 transition ${
                                activeTab === 'packages'
                                    ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                                    : 'border-transparent text-neutral-500 hover:text-black'
                            }`}
                        >
                            2. Packages & Delivery
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('benefits')}
                            className={`pb-2.5 px-3 border-b-2 transition ${
                                activeTab === 'benefits'
                                    ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                                    : 'border-transparent text-neutral-500 hover:text-black'
                            }`}
                        >
                            3. Guarantee & SEO
                        </button>
                    </div>

                    <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                        {activeTab === 'general' && (
                            <div className="space-y-4">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-title">Page Title *</Label>
                                        <Input
                                            id="edit-title"
                                            required
                                            value={editForm.data.title}
                                            onChange={(e) => editForm.setData('title', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-slug">URL Slug *</Label>
                                        <Input
                                            id="edit-slug"
                                            required
                                            value={editForm.data.slug}
                                            onChange={(e) => editForm.setData('slug', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-product">Associated Store Product</Label>
                                        <select
                                            id="edit-product"
                                            value={editForm.data.product_id}
                                            onChange={(e) => editForm.setData('product_id', e.target.value)}
                                            className="w-full text-sm rounded-lg border border-neutral-300 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-800"
                                        >
                                            <option value="">-- No linked product --</option>
                                            {products.map((prod) => (
                                                <option key={prod.id} value={prod.id}>
                                                    {prod.name} (৳{prod.price})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-badge">Offer Badge Text</Label>
                                        <Input
                                            id="edit-badge"
                                            value={editForm.data.badge}
                                            onChange={(e) => editForm.setData('badge', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-hotline">Hotline Phone</Label>
                                        <Input
                                            id="edit-hotline"
                                            value={editForm.data.hotline}
                                            onChange={(e) => editForm.setData('hotline', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-whatsapp">WhatsApp Number</Label>
                                        <Input
                                            id="edit-whatsapp"
                                            value={editForm.data.whatsapp}
                                            onChange={(e) => editForm.setData('whatsapp', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-announcement">Urgency Bar Announcement Text</Label>
                                    <Input
                                        id="edit-announcement"
                                        value={editForm.data.announcement_text}
                                        onChange={(e) => editForm.setData('announcement_text', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-headline">Hero Main Headline (Bangla)</Label>
                                    <Input
                                        id="edit-headline"
                                        value={editForm.data.headline}
                                        onChange={(e) => editForm.setData('headline', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-subheadline">Hero Subtitle</Label>
                                    <Input
                                        id="edit-subheadline"
                                        value={editForm.data.subheadline}
                                        onChange={(e) => editForm.setData('subheadline', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-desc">Hero Description</Label>
                                    <textarea
                                        id="edit-desc"
                                        rows={3}
                                        className="w-full text-sm rounded-lg border border-neutral-300 p-2.5 dark:border-neutral-700 dark:bg-neutral-800"
                                        value={editForm.data.hero_description}
                                        onChange={(e) => editForm.setData('hero_description', e.target.value)}
                                    />
                                </div>

                                <SingleImageUpload
                                    file={editForm.data.banner_image_file}
                                    onFileChange={(file) => editForm.setData('banner_image_file', file)}
                                    existingUrl={editForm.data.banner_image}
                                    onExistingUrlChange={(url) => editForm.setData('banner_image', url || '')}
                                    label="Hero Product Image"
                                    description="Upload product photo or provide image URL"
                                />
                            </div>
                        )}

                        {activeTab === 'packages' && (
                            <div className="space-y-4">
                                <p className="text-xs text-neutral-500">
                                    Customize the 3 package options displayed on the landing page:
                                </p>

                                {editForm.data.packages.map((pkg, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2 dark:border-neutral-700 dark:bg-neutral-800/50"
                                    >
                                        <div className="flex items-center justify-between font-bold text-xs">
                                            <span>প্যাকেজ {idx + 1}</span>
                                            {pkg.popular && (
                                                <Badge variant="default" className="text-[10px]">
                                                    Most Popular
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="grid gap-2 sm:grid-cols-3">
                                            <div className="space-y-1 sm:col-span-2">
                                                <Label className="text-[11px]">প্যাকেজের নাম</Label>
                                                <Input
                                                    value={pkg.name}
                                                    onChange={(e) => {
                                                        const copy = [...editForm.data.packages];
                                                        copy[idx].name = e.target.value;
                                                        editForm.setData('packages', copy);
                                                    }}
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[11px]">ট্যাগ / হাইলাইট</Label>
                                                <Input
                                                    value={pkg.tag || ''}
                                                    onChange={(e) => {
                                                        const copy = [...editForm.data.packages];
                                                        copy[idx].tag = e.target.value;
                                                        editForm.setData('packages', copy);
                                                    }}
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-2 sm:grid-cols-3 items-center">
                                            <div className="space-y-1">
                                                <Label className="text-[11px]">অফার প্রাইস (৳)</Label>
                                                <Input
                                                    type="number"
                                                    value={pkg.price}
                                                    onChange={(e) => {
                                                        const copy = [...editForm.data.packages];
                                                        copy[idx].price = Number(e.target.value);
                                                        editForm.setData('packages', copy);
                                                    }}
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[11px]">আগের প্রাইস (৳)</Label>
                                                <Input
                                                    type="number"
                                                    value={pkg.old_price}
                                                    onChange={(e) => {
                                                        const copy = [...editForm.data.packages];
                                                        copy[idx].old_price = Number(e.target.value);
                                                        editForm.setData('packages', copy);
                                                    }}
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 pt-4">
                                                <input
                                                    type="checkbox"
                                                    id={`edit-pkg-free-${idx}`}
                                                    checked={pkg.free_delivery}
                                                    onChange={(e) => {
                                                        const copy = [...editForm.data.packages];
                                                        copy[idx].free_delivery = e.target.checked;
                                                        editForm.setData('packages', copy);
                                                    }}
                                                    className="rounded border-neutral-300"
                                                />
                                                <Label htmlFor={`edit-pkg-free-${idx}`} className="text-xs">
                                                    ফ্রি ডেলিভারি
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                                    <div className="space-y-1">
                                        <Label className="text-xs">ডেলিভারি চার্জ (ঢাকা সিটি - ৳)</Label>
                                        <Input
                                            type="number"
                                            value={editForm.data.delivery_inside_dhaka}
                                            onChange={(e) =>
                                                editForm.setData('delivery_inside_dhaka', Number(e.target.value))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">ডেলিভারি চার্জ (ঢাকার বাইরে - ৳)</Label>
                                        <Input
                                            type="number"
                                            value={editForm.data.delivery_outside_dhaka}
                                            onChange={(e) =>
                                                editForm.setData('delivery_outside_dhaka', Number(e.target.value))
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'benefits' && (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-guarantee">গ্যারান্টি ও কোয়ালিটি প্রতিশ্রুতি টেক্সট</Label>
                                    <Input
                                        id="edit-guarantee"
                                        value={editForm.data.guarantee_text}
                                        onChange={(e) => editForm.setData('guarantee_text', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-meta-title">SEO Meta Title</Label>
                                    <Input
                                        id="edit-meta-title"
                                        value={editForm.data.meta_title}
                                        onChange={(e) => editForm.setData('meta_title', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-meta-desc">SEO Meta Description</Label>
                                    <textarea
                                        id="edit-meta-desc"
                                        rows={2}
                                        className="w-full text-sm rounded-lg border border-neutral-300 p-2 dark:border-neutral-700 dark:bg-neutral-800"
                                        value={editForm.data.meta_description}
                                        onChange={(e) => editForm.setData('meta_description', e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <input
                                        type="checkbox"
                                        id="edit-is-active"
                                        checked={editForm.data.is_active}
                                        onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                        className="rounded border-neutral-300"
                                    />
                                    <Label htmlFor="edit-is-active" className="text-sm font-semibold">
                                        Active & Live (ল্যান্ডিং পেজ চালু থাকবে)
                                    </Label>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                            <Button type="button" variant="outline" onClick={() => setEditingPage(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* DELETE MODAL */}
            <Dialog open={!!deletingPage} onOpenChange={(open) => !open && setDeletingPage(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Landing Page</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete landing page{' '}
                            <strong>{deletingPage?.title}</strong>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-3">
                        <Button variant="outline" onClick={() => setDeletingPage(null)}>
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
        </>
    );
}

LandingPagesIndex.layout = () => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Landing Pages',
            href: '/admin/landing-pages',
        },
    ],
});
