import { useRef, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Activity,
    Check,
    Code2,
    Eye,
    Globe,
    Image as ImageIcon,
    Info,
    Laptop,
    Moon,
    Palette,
    RefreshCw,
    RotateCcw,
    Search,
    Share2,
    Shield,
    Sparkles,
    Sun,
    Upload,
    UploadCloud,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { ThemeColorPicker } from '@/components/theme-color-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit as editAppearance } from '@/routes/appearance';

type Props = {
    branding?: {
        logo?: string;
        logo_dark?: string | null;
        title?: string;
        subtitle?: string;
    };
    storefront?: {
        frontend_logo?: string;
        frontend_logo_dark?: string | null;
        favicon?: string;
        site_title?: string;
        site_tagline?: string;
        primary_color?: string;
    };
    seo?: {
        meta_title?: string;
        meta_description?: string;
        meta_keywords?: string;
        meta_og_image?: string | null;
    };
    tracking?: {
        facebook_pixel_id?: string;
        facebook_pixel_code?: string;
        google_analytics_id?: string;
        google_analytics_code?: string;
    };
};

const PRESET_COLORS = [
    { name: 'Classy Noir', hex: '#171717', desc: 'Sleek luxury black (Default)' },
    { name: 'Amber Gold', hex: '#FF7900', desc: 'Vibrant signature orange' },
    { name: 'Rose Petal', hex: '#E11D48', desc: 'Chic boutique rose' },
    { name: 'Emerald', hex: '#059669', desc: 'Prestige forest emerald' },
    { name: 'Royal Violet', hex: '#7C3AED', desc: 'Opulent amethyst' },
    { name: 'Sapphire Blue', hex: '#2563EB', desc: 'Modern cobalt blue' },
    { name: 'Fuchsia Pink', hex: '#DB2777', desc: 'Glamorous energetic pink' },
    { name: 'Sunset Ochre', hex: '#D97706', desc: 'Warm boutique bronze' },
];

export default function Appearance({
    branding,
    storefront,
    seo,
    tracking,
}: Props) {
    const page = usePage();
    const sharedBranding = page.props.appBranding as {
        logo?: string;
        logo_dark?: string | null;
        favicon?: string;
        title?: string;
        subtitle?: string;
    } | undefined;

    // Active Settings Tab
    const [activeTab, setActiveTab] = useState<'logos' | 'theme' | 'seo' | 'tracking'>('logos');

    // === 1. Storefront Logos & Favicon State ===
    const currentFrontendLogo = storefront?.frontend_logo || '/logo.svg';
    const currentFrontendLogoDark = storefront?.frontend_logo_dark || null;
    const currentFavicon = storefront?.favicon || sharedBranding?.favicon || '/favicon.svg';

    const [siteTitle, setSiteTitle] = useState(storefront?.site_title || 'Classy Missy');
    const [siteTagline, setSiteTagline] = useState(storefront?.site_tagline || "Women's Fashion & Lifestyle");

    // Light Logo State
    const [frontendLogoFile, setFrontendLogoFile] = useState<File | null>(null);
    const [frontendLogoPreview, setFrontendLogoPreview] = useState<string | null>(null);
    const frontendLogoInputRef = useRef<HTMLInputElement>(null);

    // Dark Logo State
    const [frontendLogoDarkFile, setFrontendLogoDarkFile] = useState<File | null>(null);
    const [frontendLogoDarkPreview, setFrontendLogoDarkPreview] = useState<string | null>(null);
    const frontendLogoDarkInputRef = useRef<HTMLInputElement>(null);

    // Favicon State
    const [faviconFile, setFaviconFile] = useState<File | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);

    const [savingStorefront, setSavingStorefront] = useState(false);

    // === 2. Admin Panel Logo State ===
    const currentAdminLogo = branding?.logo || sharedBranding?.logo || '/logo.svg';
    const currentAdminLogoDark = branding?.logo_dark || sharedBranding?.logo_dark || null;
    const [adminTitle, setAdminTitle] = useState(branding?.title || sharedBranding?.title || 'Classy Missy');
    const [adminSubtitle, setAdminSubtitle] = useState(branding?.subtitle || sharedBranding?.subtitle || 'Admin Panel');

    const [adminLogoFile, setAdminLogoFile] = useState<File | null>(null);
    const [adminLogoPreview, setAdminLogoPreview] = useState<string | null>(null);
    const adminLogoInputRef = useRef<HTMLInputElement>(null);

    const [adminLogoDarkFile, setAdminLogoDarkFile] = useState<File | null>(null);
    const [adminLogoDarkPreview, setAdminLogoDarkPreview] = useState<string | null>(null);
    const adminLogoDarkInputRef = useRef<HTMLInputElement>(null);

    const [savingAdmin, setSavingAdmin] = useState(false);

    // === 3. Theme & Primary Color State ===
    const [selectedColor, setSelectedColor] = useState(storefront?.primary_color || '#171717');
    const [customColor, setCustomColor] = useState(storefront?.primary_color || '#171717');
    const [savingTheme, setSavingTheme] = useState(false);

    // === 4. SEO & Meta State ===
    const [metaTitle, setMetaTitle] = useState(seo?.meta_title || 'Classy Missy - Trendy Women\'s Fashion & Online Boutique');
    const [metaDescription, setMetaDescription] = useState(
        seo?.meta_description ||
        'Discover chic and trendy women\'s fashion, luxury clothing, and premium dresses at Classy Missy. Exclusive collection with fast delivery across Bangladesh.'
    );
    const [metaKeywords, setMetaKeywords] = useState(
        seo?.meta_keywords || 'classy missy, womens fashion, dresses, clothing, bangladesh ecommerce, boutique'
    );
    const currentOgImage = seo?.meta_og_image || null;
    const [ogImageFile, setOgImageFile] = useState<File | null>(null);
    const [ogImagePreview, setOgImagePreview] = useState<string | null>(null);
    const [savingSeo, setSavingSeo] = useState(false);
    const ogImageInputRef = useRef<HTMLInputElement>(null);

    // === 5. Tracking & Codes State ===
    const [pixelId, setPixelId] = useState(tracking?.facebook_pixel_id || '');
    const [pixelCode, setPixelCode] = useState(tracking?.facebook_pixel_code || '');
    const [gaId, setGaId] = useState(tracking?.google_analytics_id || '');
    const [gaCode, setGaCode] = useState(tracking?.google_analytics_code || '');
    const [savingTracking, setSavingTracking] = useState(false);

    // Handlers: Storefront Branding
    const handleSaveStorefront = (e: React.FormEvent) => {
        e.preventDefault();
        setSavingStorefront(true);

        const formData = new FormData();
        if (frontendLogoFile) formData.append('frontend_logo', frontendLogoFile);
        if (frontendLogoDarkFile) formData.append('frontend_logo_dark', frontendLogoDarkFile);
        if (faviconFile) formData.append('favicon', faviconFile);
        formData.append('site_title', siteTitle.trim());
        formData.append('site_tagline', siteTagline.trim());

        router.post('/settings/appearance/storefront', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setSavingStorefront(false);
                setFrontendLogoFile(null);
                setFrontendLogoDarkFile(null);
                setFaviconFile(null);
                toast.success('Storefront light & dark logos, favicon, and brand title updated!');
            },
            onError: (err) => {
                setSavingStorefront(false);
                toast.error(Object.values(err)[0] as string || 'Failed to update storefront settings');
            },
        });
    };

    const handleResetLogo = (target: 'frontend_light' | 'frontend_dark' | 'favicon') => {
        const label =
            target === 'frontend_light'
                ? 'Storefront Light Logo'
                : target === 'frontend_dark'
                ? 'Storefront Dark Logo'
                : 'Favicon';

        if (!confirm(`Are you sure you want to reset the ${label}?`)) return;
        setSavingStorefront(true);

        const actionKey =
            target === 'frontend_light'
                ? 'reset_logo_light'
                : target === 'frontend_dark'
                ? 'reset_logo_dark'
                : 'reset_favicon';

        router.post(
            '/settings/appearance/storefront',
            { action: actionKey },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSavingStorefront(false);
                    if (target === 'frontend_light') {
                        setFrontendLogoFile(null);
                        setFrontendLogoPreview(null);
                    } else if (target === 'frontend_dark') {
                        setFrontendLogoDarkFile(null);
                        setFrontendLogoDarkPreview(null);
                    } else {
                        setFaviconFile(null);
                        setFaviconPreview(null);
                    }
                    toast.success(`${label} reset successfully!`);
                },
                onError: () => setSavingStorefront(false),
            }
        );
    };

    // Handlers: Admin Panel Branding
    const handleSaveAdmin = (e: React.FormEvent) => {
        e.preventDefault();
        setSavingAdmin(true);

        const formData = new FormData();
        if (adminLogoFile) formData.append('logo', adminLogoFile);
        if (adminLogoDarkFile) formData.append('logo_dark', adminLogoDarkFile);
        formData.append('title', adminTitle.trim() || 'Classy Missy');
        formData.append('subtitle', adminSubtitle.trim() || 'Admin Panel');

        router.post('/settings/appearance/logo', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setSavingAdmin(false);
                setAdminLogoFile(null);
                setAdminLogoDarkFile(null);
                toast.success('Admin logos & branding saved!');
            },
            onError: (err) => {
                setSavingAdmin(false);
                toast.error(Object.values(err)[0] as string || 'Failed to update admin branding');
            },
        });
    };

    const handleResetAdmin = (target: 'light' | 'dark' | 'all') => {
        const label =
            target === 'light'
                ? 'Admin Light Logo'
                : target === 'dark'
                ? 'Admin Dark Logo'
                : 'All Admin Branding';

        if (!confirm(`Are you sure you want to reset ${label}?`)) return;
        setSavingAdmin(true);

        const actionKey =
            target === 'light'
                ? 'reset_admin_light'
                : target === 'dark'
                ? 'reset_admin_dark'
                : 'reset';

        router.post(
            '/settings/appearance/logo',
            { action: actionKey },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSavingAdmin(false);
                    if (target === 'light') {
                        setAdminLogoFile(null);
                        setAdminLogoPreview(null);
                    } else if (target === 'dark') {
                        setAdminLogoDarkFile(null);
                        setAdminLogoDarkPreview(null);
                    } else {
                        setAdminLogoFile(null);
                        setAdminLogoPreview(null);
                        setAdminLogoDarkFile(null);
                        setAdminLogoDarkPreview(null);
                        setAdminTitle('Classy Missy');
                        setAdminSubtitle('Admin Panel');
                    }
                    toast.success(`${label} reset successfully.`);
                },
                onError: () => setSavingAdmin(false),
            }
        );
    };

    // Handlers: Primary Theme Color
    const handleSaveTheme = (colorToSave: string) => {
        setSavingTheme(true);
        router.post(
            '/settings/appearance/theme',
            { primary_color: colorToSave },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSavingTheme(false);
                    setSelectedColor(colorToSave);
                    toast.success(`Storefront primary color set to ${colorToSave}!`);
                },
                onError: (err) => {
                    setSavingTheme(false);
                    toast.error(Object.values(err)[0] as string || 'Failed to update theme color');
                },
            }
        );
    };

    const handleResetTheme = () => {
        setSavingTheme(true);
        router.post(
            '/settings/appearance/theme',
            { action: 'reset' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSavingTheme(false);
                    setSelectedColor('#171717');
                    setCustomColor('#171717');
                    toast.success('Theme color reset to default #171717.');
                },
                onError: () => setSavingTheme(false),
            }
        );
    };

    // Handlers: SEO
    const handleSaveSeo = (e: React.FormEvent) => {
        e.preventDefault();
        setSavingSeo(true);

        const formData = new FormData();
        formData.append('meta_title', metaTitle.trim());
        formData.append('meta_description', metaDescription.trim());
        formData.append('meta_keywords', metaKeywords.trim());
        if (ogImageFile) formData.append('meta_og_image', ogImageFile);

        router.post('/settings/appearance/seo', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setSavingSeo(false);
                setOgImageFile(null);
                toast.success('SEO and Meta tags saved successfully!');
            },
            onError: (err) => {
                setSavingSeo(false);
                toast.error(Object.values(err)[0] as string || 'Failed to update SEO tags');
            },
        });
    };

    const handleResetSeo = () => {
        if (!confirm('Reset SEO settings to default?')) return;
        setSavingSeo(true);
        router.post(
            '/settings/appearance/seo',
            { action: 'reset' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSavingSeo(false);
                    setMetaTitle('Classy Missy - Trendy Women\'s Fashion & Online Boutique');
                    setMetaDescription('Discover chic and trendy women\'s fashion, luxury clothing, and premium dresses at Classy Missy. Exclusive collection with fast delivery across Bangladesh.');
                    setMetaKeywords('classy missy, womens fashion, dresses, clothing, bangladesh ecommerce, boutique');
                    setOgImageFile(null);
                    setOgImagePreview(null);
                    toast.success('SEO settings reset to default.');
                },
                onError: () => setSavingSeo(false),
            }
        );
    };

    // Handlers: Tracking Codes
    const handleSaveTracking = (e: React.FormEvent) => {
        e.preventDefault();
        setSavingTracking(true);

        router.post(
            '/settings/appearance/tracking',
            {
                facebook_pixel_id: pixelId,
                facebook_pixel_code: pixelCode,
                google_analytics_id: gaId,
                google_analytics_code: gaCode,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSavingTracking(false);
                    toast.success('Facebook Pixel & Google Analytics settings saved!');
                },
                onError: (err) => {
                    setSavingTracking(false);
                    toast.error(Object.values(err)[0] as string || 'Failed to save tracking settings');
                },
            }
        );
    };

    // Active Display URLs
    const displayFrontendLight = frontendLogoPreview || currentFrontendLogo;
    const displayFrontendDark =
        frontendLogoDarkPreview || currentFrontendLogoDark || currentFrontendLogo;
    const displayFavicon = faviconPreview || currentFavicon;

    const displayAdminLight = adminLogoPreview || currentAdminLogo;
    const displayAdminDark = adminLogoDarkPreview || currentAdminLogoDark || currentAdminLogo;

    const activeOgImage = ogImagePreview || currentOgImage;

    return (
        <>
            <Head title="Store Settings & Branding" />

            <div className="space-y-6">
                {/* Header & Quick Store Preview */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#dbdade]/70 dark:border-[#434968]">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <span>Store Settings & Branding</span>
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                                Live Dynamic
                            </Badge>
                        </h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            Manage storefront & admin light and dark logos, favicon, primary theme color, SEO metadata, and tracking codes.
                        </p>
                    </div>

                    <a
                        href="http://localhost:5173"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 self-start sm:self-auto shadow-xs"
                    >
                        <Globe className="size-3.5" />
                        <span>Preview Live Storefront</span>
                    </a>
                </div>

                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-[#25293c] border border-neutral-200 dark:border-[#434968]">
                    <button
                        type="button"
                        onClick={() => setActiveTab('logos')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            activeTab === 'logos'
                                ? 'bg-white text-primary shadow-xs dark:bg-[#2f3349] dark:text-primary'
                                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                        }`}
                    >
                        <ImageIcon className="size-4" />
                        <span>Logos & Favicon</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('theme')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            activeTab === 'theme'
                                ? 'bg-white text-primary shadow-xs dark:bg-[#2f3349] dark:text-primary'
                                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                        }`}
                    >
                        <Palette className="size-4" />
                        <span>Store Theme & Color</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('seo')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            activeTab === 'seo'
                                ? 'bg-white text-primary shadow-xs dark:bg-[#2f3349] dark:text-primary'
                                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                        }`}
                    >
                        <Search className="size-4" />
                        <span>SEO & Meta Data</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('tracking')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            activeTab === 'tracking'
                                ? 'bg-white text-primary shadow-xs dark:bg-[#2f3349] dark:text-primary'
                                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                        }`}
                    >
                        <Code2 className="size-4" />
                        <span>Facebook & Google Tracking</span>
                    </button>
                </div>

                {/* ========================================================
                    TAB 1: LOGOS & FAVICON (WITH SEPARATE LIGHT & DARK FIELDS)
                   ======================================================== */}
                {activeTab === 'logos' && (
                    <div className="space-y-6">
                        {/* Storefront Logos Card */}
                        <div className="rounded-xl border border-[#dbdade]/70 bg-white p-5 shadow-xs dark:border-[#434968] dark:bg-[#2f3349]">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[#dbdade]/50 dark:border-[#434968]">
                                <div>
                                    <Heading
                                        variant="small"
                                        title="Storefront Light & Dark Logos"
                                        description="Upload dedicated logos for light surfaces (Header & Navbar) and dark surfaces (Footer & Dark Mode)."
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleResetLogo('favicon')}
                                        disabled={savingStorefront}
                                        className="text-xs text-neutral-600 hover:text-primary dark:text-neutral-300"
                                    >
                                        <RotateCcw className="size-3.5 mr-1" />
                                        <span>Reset Favicon</span>
                                    </Button>
                                </div>
                            </div>

                            <form onSubmit={handleSaveStorefront} className="mt-5 space-y-6">
                                {/* SEPARATE FIELDS: LIGHT LOGO & DARK LOGO */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                    {/* 1. STOREFRONT LIGHT LOGO FIELD */}
                                    <div className="rounded-xl border border-[#dbdade]/80 bg-[#f8f7fa]/60 p-4 dark:border-[#434968] dark:bg-[#25293c]/40 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                                                        <Sun className="size-4" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                                            Light Storefront Logo
                                                        </h4>
                                                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                                            For Header, Navbar & Auth Pages
                                                        </p>
                                                    </div>
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleResetLogo('frontend_light')}
                                                    disabled={savingStorefront}
                                                    className="h-7 text-[11px] text-neutral-500 hover:text-red-600 px-2"
                                                    title="Reset to default light logo"
                                                >
                                                    <RotateCcw className="size-3 mr-1" />
                                                    Reset
                                                </Button>
                                            </div>

                                            {/* Light Preview Box */}
                                            <div className="mt-3 flex flex-col items-center justify-center p-4 rounded-lg border border-[#dbdade]/70 bg-white text-center shadow-xs">
                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                                                    Header Light Preview
                                                </span>
                                                <div className="h-12 flex items-center justify-center max-w-[220px]">
                                                    <img
                                                        key={`light-preview-${displayFrontendLight}`}
                                                        src={displayFrontendLight}
                                                        alt="Storefront Light Logo"
                                                        className="h-10 w-auto object-contain"
                                                    />
                                                </div>
                                            </div>

                                            {/* Light File Input */}
                                            <input
                                                ref={frontendLogoInputRef}
                                                type="file"
                                                accept="image/png,image/svg+xml,image/jpeg,image/webp"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setFrontendLogoFile(file);
                                                        setFrontendLogoPreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                            />

                                            {/* Light Upload Dropzone */}
                                            <div
                                                onClick={() => frontendLogoInputRef.current?.click()}
                                                className="mt-3 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#dbdade] bg-white p-4 text-center cursor-pointer hover:border-primary/70 hover:bg-primary/5 dark:border-[#434968] dark:bg-[#25293c] transition-all"
                                            >
                                                <div className="flex size-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 mb-1.5">
                                                    <UploadCloud className="size-4" />
                                                </div>
                                                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                                    <span className="text-primary hover:underline">Upload Light Logo</span>
                                                </p>
                                                <p className="text-[10px] text-neutral-400 mt-0.5">
                                                    PNG, SVG, WebP with dark/colored text (Max 3MB)
                                                </p>
                                                {frontendLogoFile && (
                                                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 border border-emerald-200">
                                                        <Check className="size-3" />
                                                        <span className="truncate max-w-[180px]">Selected: {frontendLogoFile.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. STOREFRONT DARK LOGO FIELD */}
                                    <div className="rounded-xl border border-[#434968] bg-[#1a1d2d]/60 p-4 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                                        <Moon className="size-4" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-white">
                                                            Dark Storefront Logo
                                                        </h4>
                                                        <p className="text-[10px] text-neutral-400">
                                                            For Dark Footer & Dark Backgrounds
                                                        </p>
                                                    </div>
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleResetLogo('frontend_dark')}
                                                    disabled={savingStorefront}
                                                    className="h-7 text-[11px] text-neutral-400 hover:text-red-400 px-2"
                                                    title="Reset to auto/light logo"
                                                >
                                                    <RotateCcw className="size-3 mr-1" />
                                                    Reset
                                                </Button>
                                            </div>

                                            {/* Dark Preview Box */}
                                            <div className="mt-3 flex flex-col items-center justify-center p-4 rounded-lg border border-[#434968] bg-[#101010] text-center shadow-xs">
                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                                                    Dark Footer Preview
                                                </span>
                                                <div className="h-12 flex items-center justify-center max-w-[220px]">
                                                    <img
                                                        key={`dark-preview-${displayFrontendDark}`}
                                                        src={displayFrontendDark}
                                                        alt="Storefront Dark Logo"
                                                        className={`h-10 w-auto object-contain ${
                                                            !frontendLogoDarkPreview && !currentFrontendLogoDark
                                                                ? 'brightness-0 invert opacity-90'
                                                                : ''
                                                        }`}
                                                    />
                                                </div>
                                            </div>

                                            {/* Dark File Input */}
                                            <input
                                                ref={frontendLogoDarkInputRef}
                                                type="file"
                                                accept="image/png,image/svg+xml,image/jpeg,image/webp"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setFrontendLogoDarkFile(file);
                                                        setFrontendLogoDarkPreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                            />

                                            {/* Dark Upload Dropzone */}
                                            <div
                                                onClick={() => frontendLogoDarkInputRef.current?.click()}
                                                className="mt-3 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#434968] bg-[#161824] p-4 text-center cursor-pointer hover:border-indigo-400/80 hover:bg-indigo-500/10 transition-all"
                                            >
                                                <div className="flex size-9 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 mb-1.5">
                                                    <UploadCloud className="size-4" />
                                                </div>
                                                <p className="text-xs font-semibold text-white">
                                                    <span className="text-indigo-400 hover:underline">Upload Dark Logo</span>
                                                </p>
                                                <p className="text-[10px] text-neutral-400 mt-0.5">
                                                    PNG, SVG, WebP with white/light text (Max 3MB)
                                                </p>
                                                {frontendLogoDarkFile && (
                                                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-950/60 px-2 py-0.5 text-xs text-emerald-300 border border-emerald-800">
                                                        <Check className="size-3" />
                                                        <span className="truncate max-w-[180px]">Selected: {frontendLogoDarkFile.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Favicon Upload & Browser Tab Mockup */}
                                <div className="pt-4 border-t border-[#dbdade]/50 dark:border-[#434968]">
                                    <Label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                        Browser Tab Favicon
                                    </Label>
                                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                                        Square icon displayed on browser tabs, bookmarks, and search results. Supported: .ico, .svg, .png (32x32 to 512x512).
                                    </p>

                                    <div className="mt-3 flex flex-col sm:flex-row items-center gap-4">
                                        {/* Browser Tab Mockup */}
                                        <div className="w-full sm:w-auto min-w-[260px] p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                                            <span className="text-[10px] text-neutral-400 font-medium block mb-1.5">Browser Tab Appearance</span>
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-t-md bg-white dark:bg-[#2f3349] border-t-2 border-primary shadow-xs">
                                                <img
                                                    key={displayFavicon}
                                                    src={displayFavicon}
                                                    alt="Favicon"
                                                    className="size-4 object-contain rounded-xs"
                                                />
                                                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[150px]">
                                                    {siteTitle || 'Classy Missy'}
                                                </span>
                                                <span className="text-[10px] text-neutral-400">×</span>
                                            </div>
                                        </div>

                                        <input
                                            ref={faviconInputRef}
                                            type="file"
                                            accept=".ico,image/x-icon,image/svg+xml,image/png,image/jpeg,image/webp"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setFaviconFile(file);
                                                    setFaviconPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />

                                        <div
                                            onClick={() => faviconInputRef.current?.click()}
                                            className="flex-1 w-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#dbdade]/80 bg-[#f8f7fa]/60 p-4 text-center cursor-pointer hover:border-primary/60 dark:border-[#434968] dark:bg-[#25293c]/50 transition-all"
                                        >
                                            <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                                                <span className="text-primary font-semibold hover:underline">Choose Favicon File</span> (.ico, .svg, .png max 2MB)
                                            </p>
                                            {faviconFile && (
                                                <span className="mt-1 text-xs text-emerald-600 font-medium">
                                                    Selected: {faviconFile.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Brand Name & Tagline Inputs */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <Label htmlFor="site-title" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                            Storefront Name
                                        </Label>
                                        <Input
                                            id="site-title"
                                            type="text"
                                            value={siteTitle}
                                            onChange={(e) => setSiteTitle(e.target.value)}
                                            placeholder="Classy Missy"
                                            className="mt-1 text-xs"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="site-tagline" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                            Brand Tagline
                                        </Label>
                                        <Input
                                            id="site-tagline"
                                            type="text"
                                            value={siteTagline}
                                            onChange={(e) => setSiteTagline(e.target.value)}
                                            placeholder="Women's Fashion & Lifestyle"
                                            className="mt-1 text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <Button
                                        type="submit"
                                        disabled={savingStorefront}
                                        className="bg-primary hover:bg-[var(--primary-hover)] text-white text-xs font-semibold px-5"
                                    >
                                        <Upload className="mr-1.5 size-3.5" />
                                        {savingStorefront ? 'Saving...' : 'Save Storefront Brand, Logos & Favicon'}
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* Admin Panel Logo Card (Also with Separate Light & Dark Fields) */}
                        <div className="rounded-xl border border-[#dbdade]/70 bg-white p-5 shadow-xs dark:border-[#434968] dark:bg-[#2f3349]">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[#dbdade]/50 dark:border-[#434968]">
                                <div>
                                    <Heading
                                        variant="small"
                                        title="Admin Panel Light & Dark Logos"
                                        description="Change the logo emblem and title displayed in the admin sidebar, header, and login screens for both light and dark themes."
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleResetAdmin('all')}
                                        disabled={savingAdmin}
                                        className="text-xs text-neutral-600 hover:text-primary dark:text-neutral-300 self-start sm:self-auto"
                                    >
                                        <RotateCcw className="size-3.5 mr-1" />
                                        <span>Reset Admin Branding</span>
                                    </Button>
                                </div>
                            </div>

                            <form onSubmit={handleSaveAdmin} className="mt-5 space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Admin Light Logo Field */}
                                    <div className="rounded-xl border border-[#dbdade]/80 bg-[#f8f7fa]/60 p-4 dark:border-[#434968] dark:bg-[#25293c]/40">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-1.5">
                                                <Sun className="size-4 text-amber-500" />
                                                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                                    Admin Light Mode Logo
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleResetAdmin('light')}
                                                disabled={savingAdmin}
                                                className="h-6 text-[11px] text-neutral-500 hover:text-red-600 px-1.5"
                                            >
                                                Reset
                                            </Button>
                                        </div>

                                        <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#dbdade]/60 bg-white text-center">
                                            <div className="h-10 flex items-center justify-center max-w-[180px]">
                                                <img
                                                    key={displayAdminLight}
                                                    src={displayAdminLight}
                                                    alt="Admin Logo (Light)"
                                                    className="h-8 w-auto object-contain"
                                                />
                                            </div>
                                        </div>

                                        <input
                                            ref={adminLogoInputRef}
                                            type="file"
                                            accept="image/png,image/svg+xml,image/jpeg,image/webp"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setAdminLogoFile(file);
                                                    setAdminLogoPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />

                                        <div
                                            onClick={() => adminLogoInputRef.current?.click()}
                                            className="mt-3 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#dbdade] bg-white p-3 text-center cursor-pointer hover:border-primary/60 dark:border-[#434968] dark:bg-[#25293c] transition-all"
                                        >
                                            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                                <span className="text-primary hover:underline">Upload Admin Light Logo</span>
                                            </p>
                                            {adminLogoFile && (
                                                <span className="mt-1 text-xs text-emerald-600 font-medium truncate max-w-[180px]">
                                                    {adminLogoFile.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Admin Dark Logo Field */}
                                    <div className="rounded-xl border border-[#434968] bg-[#1a1d2d]/60 p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-1.5">
                                                <Moon className="size-4 text-indigo-400" />
                                                <span className="text-xs font-bold text-white">
                                                    Admin Dark Mode Logo
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleResetAdmin('dark')}
                                                disabled={savingAdmin}
                                                className="h-6 text-[11px] text-neutral-400 hover:text-red-400 px-1.5"
                                            >
                                                Reset
                                            </Button>
                                        </div>

                                        <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#434968] bg-[#25293c] text-center">
                                            <div className="h-10 flex items-center justify-center max-w-[180px]">
                                                <img
                                                    key={displayAdminDark}
                                                    src={displayAdminDark}
                                                    alt="Admin Logo (Dark)"
                                                    className="h-8 w-auto object-contain"
                                                />
                                            </div>
                                        </div>

                                        <input
                                            ref={adminLogoDarkInputRef}
                                            type="file"
                                            accept="image/png,image/svg+xml,image/jpeg,image/webp"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setAdminLogoDarkFile(file);
                                                    setAdminLogoDarkPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />

                                        <div
                                            onClick={() => adminLogoDarkInputRef.current?.click()}
                                            className="mt-3 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#434968] bg-[#161824] p-3 text-center cursor-pointer hover:border-indigo-400/80 transition-all"
                                        >
                                            <p className="text-xs font-semibold text-white">
                                                <span className="text-indigo-400 hover:underline">Upload Admin Dark Logo</span>
                                            </p>
                                            {adminLogoDarkFile && (
                                                <span className="mt-1 text-xs text-emerald-300 font-medium truncate max-w-[180px]">
                                                    {adminLogoDarkFile.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="admin-title" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                            Admin Brand Title
                                        </Label>
                                        <Input
                                            id="admin-title"
                                            type="text"
                                            value={adminTitle}
                                            onChange={(e) => setAdminTitle(e.target.value)}
                                            className="mt-1 text-xs"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="admin-sub" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                            Admin Subtitle Badge
                                        </Label>
                                        <Input
                                            id="admin-sub"
                                            type="text"
                                            value={adminSubtitle}
                                            onChange={(e) => setAdminSubtitle(e.target.value)}
                                            className="mt-1 text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={savingAdmin}
                                        className="bg-primary hover:bg-[var(--primary-hover)] text-white text-xs font-semibold px-5"
                                    >
                                        <Upload className="mr-1.5 size-3.5" />
                                        {savingAdmin ? 'Saving...' : 'Save Admin Branding'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ========================================================
                    TAB 2: STOREFRONT THEME & COLOR
                   ======================================================== */}
                {activeTab === 'theme' && (
                    <div className="space-y-6">
                        {/* Primary Color Card */}
                        <div className="rounded-xl border border-[#dbdade]/70 bg-white p-5 shadow-xs dark:border-[#434968] dark:bg-[#2f3349]">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[#dbdade]/50 dark:border-[#434968]">
                                <div>
                                    <Heading
                                        variant="small"
                                        title="Storefront Primary Accent Color"
                                        description="Controls all primary buttons, badges, product prices, checkout CTAs, and links on the storefront."
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResetTheme}
                                    disabled={savingTheme}
                                    className="text-xs text-neutral-600 hover:text-primary dark:text-neutral-300 self-start sm:self-auto"
                                >
                                    <RotateCcw className="size-3.5 mr-1" />
                                    <span>Reset to Default (#171717)</span>
                                </Button>
                            </div>

                            {/* Preset Color Swatches */}
                            <div className="mt-5 space-y-4">
                                <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                    Curated Color Palettes
                                </Label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {PRESET_COLORS.map((preset) => {
                                        const isSelected = selectedColor.toUpperCase() === preset.hex.toUpperCase();
                                        return (
                                            <button
                                                key={preset.hex}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedColor(preset.hex);
                                                    setCustomColor(preset.hex);
                                                    handleSaveTheme(preset.hex);
                                                }}
                                                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10 dark:border-white dark:bg-white/5'
                                                        : 'border-[#dbdade]/70 hover:border-neutral-400 bg-white dark:border-[#434968] dark:bg-[#25293c]'
                                                }`}
                                            >
                                                <div
                                                    className="size-8 rounded-lg shrink-0 shadow-inner flex items-center justify-center text-white"
                                                    style={{ backgroundColor: preset.hex }}
                                                >
                                                    {isSelected && <Check className="size-4 stroke-[3]" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                                                        {preset.name}
                                                    </div>
                                                    <div className="text-[10px] text-neutral-400 font-mono">
                                                        {preset.hex}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Custom Color Input */}
                                <div className="pt-4 border-t border-[#dbdade]/50 dark:border-[#434968]">
                                    <Label htmlFor="custom-hex" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                        Custom Hexadecimal Color
                                    </Label>
                                    <div className="mt-2 flex items-center gap-3 max-w-sm">
                                        <div className="relative size-10 rounded-lg overflow-hidden border border-neutral-300 dark:border-[#434968] shrink-0">
                                            <input
                                                type="color"
                                                value={customColor}
                                                onChange={(e) => {
                                                    setCustomColor(e.target.value);
                                                    setSelectedColor(e.target.value);
                                                }}
                                                className="absolute -top-2 -left-2 size-14 cursor-pointer"
                                            />
                                        </div>
                                        <Input
                                            id="custom-hex"
                                            type="text"
                                            value={customColor}
                                            onChange={(e) => {
                                                setCustomColor(e.target.value);
                                                if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(e.target.value)) {
                                                    setSelectedColor(e.target.value);
                                                }
                                            }}
                                            placeholder="#171717"
                                            className="font-mono text-xs uppercase"
                                        />
                                        <Button
                                            type="button"
                                            disabled={savingTheme}
                                            onClick={() => handleSaveTheme(customColor)}
                                            className="bg-primary hover:bg-[var(--primary-hover)] text-white text-xs font-semibold shrink-0"
                                        >
                                            {savingTheme ? 'Saving...' : 'Apply Color'}
                                        </Button>
                                    </div>
                                </div>

                                {/* Live Storefront Component Preview */}
                                <div className="pt-4 border-t border-[#dbdade]/50 dark:border-[#434968]">
                                    <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-2">
                                        Live Storefront Component Simulation
                                    </Label>
                                    <div className="p-4 rounded-xl border border-neutral-200 dark:border-[#434968] bg-[#fafafa] dark:bg-[#25293c] space-y-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            {/* Primary Button */}
                                            <button
                                                type="button"
                                                style={{ backgroundColor: selectedColor }}
                                                className="px-4 py-2 rounded-lg text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-90"
                                            >
                                                Add to Cart
                                            </button>

                                            {/* Outlined Button */}
                                            <button
                                                type="button"
                                                style={{ borderColor: selectedColor, color: selectedColor }}
                                                className="px-4 py-2 rounded-lg text-xs font-bold border-2 bg-transparent transition-opacity hover:opacity-90"
                                            >
                                                View Product
                                            </button>

                                            {/* Badge */}
                                            <span
                                                style={{ backgroundColor: `${selectedColor}15`, color: selectedColor }}
                                                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                                            >
                                                Save 35% OFF
                                            </span>

                                            {/* Price Tag */}
                                            <span
                                                style={{ color: selectedColor }}
                                                className="text-base font-bold"
                                            >
                                                ৳ 2,450
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Panel Dark Mode Setting */}
                        <div className="rounded-xl border border-[#dbdade]/70 bg-white p-5 shadow-xs dark:border-[#434968] dark:bg-[#2f3349]">
                            <Heading
                                variant="small"
                                title="Admin Panel Appearance Mode"
                                description="Select light, dark, or system mode for your admin workspace."
                            />
                            <div className="mt-3">
                                <AppearanceTabs />
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================
                    TAB 3: SEO & META DATA
                   ======================================================== */}
                {activeTab === 'seo' && (
                    <div className="space-y-6">
                        <div className="rounded-xl border border-[#dbdade]/70 bg-white p-5 shadow-xs dark:border-[#434968] dark:bg-[#2f3349]">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[#dbdade]/50 dark:border-[#434968]">
                                <div>
                                    <Heading
                                        variant="small"
                                        title="Search Engine Optimization (SEO) & Social Graph"
                                        description="Configure search engine titles, descriptions, and social media preview cards (Open Graph) for Facebook, WhatsApp, and Twitter."
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResetSeo}
                                    disabled={savingSeo}
                                    className="text-xs text-neutral-600 hover:text-primary dark:text-neutral-300 self-start sm:self-auto"
                                >
                                    <RotateCcw className="size-3.5 mr-1" />
                                    <span>Reset SEO</span>
                                </Button>
                            </div>

                            <form onSubmit={handleSaveSeo} className="mt-5 space-y-5">
                                {/* Google SERP Live Simulation */}
                                <div>
                                    <Label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-2">
                                        Google Search Snippet Preview
                                    </Label>
                                    <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#25293c] shadow-xs">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="size-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                                <img src={displayFavicon} alt="" className="size-3 object-contain" />
                                            </div>
                                            <span className="text-[11px] text-neutral-700 dark:text-neutral-300">
                                                https://classymissy.com
                                            </span>
                                        </div>
                                        <h3 className="text-base text-[#1a0dab] dark:text-[#8ab4f8] hover:underline font-medium cursor-pointer">
                                            {metaTitle || 'Classy Missy - Trendy Women\'s Fashion & Online Boutique'}
                                        </h3>
                                        <p className="text-xs text-[#4d5156] dark:text-[#bdc1c6] mt-1 leading-relaxed line-clamp-2">
                                            {metaDescription || 'Discover chic and trendy women\'s fashion, luxury clothing, and premium dresses at Classy Missy.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Meta Title */}
                                <div>
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="meta-title" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                            Meta Title
                                        </Label>
                                        <span className={`text-[10px] font-mono ${metaTitle.length > 60 ? 'text-amber-500' : 'text-neutral-400'}`}>
                                            {metaTitle.length}/60 chars recommended
                                        </span>
                                    </div>
                                    <Input
                                        id="meta-title"
                                        type="text"
                                        value={metaTitle}
                                        onChange={(e) => setMetaTitle(e.target.value)}
                                        placeholder="e.g. Classy Missy - Trendy Women's Fashion & Online Boutique"
                                        className="mt-1 text-xs"
                                        maxLength={150}
                                    />
                                </div>

                                {/* Meta Description */}
                                <div>
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="meta-desc" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                            Meta Description
                                        </Label>
                                        <span className={`text-[10px] font-mono ${metaDescription.length > 160 ? 'text-amber-500' : 'text-neutral-400'}`}>
                                            {metaDescription.length}/160 chars recommended
                                        </span>
                                    </div>
                                    <textarea
                                        id="meta-desc"
                                        rows={3}
                                        value={metaDescription}
                                        onChange={(e) => setMetaDescription(e.target.value)}
                                        placeholder="Brief summary of your store shown in search engine results..."
                                        className="mt-1 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-xs shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-[#434968] dark:text-neutral-100"
                                        maxLength={300}
                                    />
                                </div>

                                {/* Meta Keywords */}
                                <div>
                                    <Label htmlFor="meta-kw" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                        Meta Keywords (Comma separated)
                                    </Label>
                                    <Input
                                        id="meta-kw"
                                        type="text"
                                        value={metaKeywords}
                                        onChange={(e) => setMetaKeywords(e.target.value)}
                                        placeholder="classy missy, dresses, women clothing, fashion bd, boutique"
                                        className="mt-1 text-xs"
                                    />
                                </div>

                                {/* Social Share (OG) Image */}
                                <div className="pt-3 border-t border-[#dbdade]/50 dark:border-[#434968]">
                                    <Label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-1">
                                        Social Media Share Image (Open Graph / Twitter Card)
                                    </Label>
                                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-3">
                                        Recommended resolution: 1200 x 630 px. Displayed when link is shared on Facebook, WhatsApp, LinkedIn, Twitter.
                                    </p>

                                    {activeOgImage && (
                                        <div className="mb-3 max-w-sm rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
                                            <img
                                                src={activeOgImage}
                                                alt="OG Preview"
                                                className="w-full aspect-[1200/630] object-cover"
                                            />
                                        </div>
                                    )}

                                    <input
                                        ref={ogImageInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setOgImageFile(file);
                                                setOgImagePreview(URL.createObjectURL(file));
                                            }
                                        }}
                                    />

                                    <div
                                        onClick={() => ogImageInputRef.current?.click()}
                                        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#dbdade]/80 bg-[#f8f7fa]/60 p-4 text-center cursor-pointer hover:border-primary/60 dark:border-[#434968] dark:bg-[#25293c]/50 transition-all"
                                    >
                                        <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                                            <span className="text-primary font-semibold hover:underline">Upload Social Share Banner</span> (1200x630 PNG, JPG, WebP max 4MB)
                                        </p>
                                        {ogImageFile && (
                                            <span className="mt-1 text-xs text-emerald-600 font-medium">
                                                Selected: {ogImageFile.name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <Button
                                        type="submit"
                                        disabled={savingSeo}
                                        className="bg-primary hover:bg-[var(--primary-hover)] text-white text-xs font-semibold px-5"
                                    >
                                        <Upload className="mr-1.5 size-3.5" />
                                        {savingSeo ? 'Saving...' : 'Save SEO & Meta Data'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ========================================================
                    TAB 4: FACEBOOK & GOOGLE TRACKING CODES
                   ======================================================== */}
                {activeTab === 'tracking' && (
                    <div className="space-y-6">
                        <div className="rounded-xl border border-[#dbdade]/70 bg-white p-5 shadow-xs dark:border-[#434968] dark:bg-[#2f3349]">
                            <div className="pb-4 border-b border-[#dbdade]/50 dark:border-[#434968]">
                                <Heading
                                    variant="small"
                                    title="Marketing & Analytics Tracking"
                                    description="Integrate Meta Pixel for ad conversions and Google Analytics 4 (GA4) or Google Tag Manager for visitor insights."
                                />
                            </div>

                            <form onSubmit={handleSaveTracking} className="mt-5 space-y-6">
                                {/* Facebook Pixel Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 rounded-md bg-[#1877f2]/10 text-[#1877f2] flex items-center justify-center font-bold text-xs">
                                                f
                                            </div>
                                            <Label htmlFor="fb-pixel-id" className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                                Meta (Facebook) Pixel
                                            </Label>
                                        </div>

                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                            pixelId ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-neutral-100 text-neutral-500'
                                        }`}>
                                            {pixelId ? 'Active' : 'Not Connected'}
                                        </span>
                                    </div>

                                    <div>
                                        <Label htmlFor="fb-pixel-id" className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                                            Pixel ID
                                        </Label>
                                        <Input
                                            id="fb-pixel-id"
                                            type="text"
                                            value={pixelId}
                                            onChange={(e) => setPixelId(e.target.value)}
                                            placeholder="e.g. 123456789012345"
                                            className="mt-1 font-mono text-xs"
                                        />
                                        <p className="text-[10px] text-neutral-400 mt-1">
                                            Providing the ID automatically initializes standard PageView, ViewContent, AddToCart, and Purchase events.
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="fb-custom-code" className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                                            Custom Meta Pixel Script (Optional)
                                        </Label>
                                        <textarea
                                            id="fb-custom-code"
                                            rows={3}
                                            value={pixelCode}
                                            onChange={(e) => setPixelCode(e.target.value)}
                                            placeholder="<!-- Facebook Pixel Custom Code -->"
                                            className="mt-1 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 font-mono text-[11px] shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-[#434968] dark:text-neutral-100"
                                        />
                                    </div>
                                </div>

                                {/* Google Analytics Section */}
                                <div className="pt-5 border-t border-[#dbdade]/50 dark:border-[#434968] space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">
                                                G
                                            </div>
                                            <Label htmlFor="ga-id" className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                                Google Analytics 4 / Google Tag Manager
                                            </Label>
                                        </div>

                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                            gaId ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-neutral-100 text-neutral-500'
                                        }`}>
                                            {gaId ? 'Active' : 'Not Connected'}
                                        </span>
                                    </div>

                                    <div>
                                        <Label htmlFor="ga-id" className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                                            Measurement ID or GTM Container ID
                                        </Label>
                                        <Input
                                            id="ga-id"
                                            type="text"
                                            value={gaId}
                                            onChange={(e) => setGaId(e.target.value)}
                                            placeholder="e.g. G-XXXXXXXXXX or GTM-XXXXXXX"
                                            className="mt-1 font-mono text-xs"
                                        />
                                        <p className="text-[10px] text-neutral-400 mt-1">
                                            Automatically loads gtag.js and tracks visitor page views across your storefront.
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="ga-custom-code" className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                                            Custom Google Tracking Script (Optional)
                                        </Label>
                                        <textarea
                                            id="ga-custom-code"
                                            rows={3}
                                            value={gaCode}
                                            onChange={(e) => setGaCode(e.target.value)}
                                            placeholder="<!-- Google Analytics / GTM Custom Script -->"
                                            className="mt-1 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 font-mono text-[11px] shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-[#434968] dark:text-neutral-100"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <Button
                                        type="submit"
                                        disabled={savingTracking}
                                        className="bg-primary hover:bg-[var(--primary-hover)] text-white text-xs font-semibold px-5"
                                    >
                                        <Upload className="mr-1.5 size-3.5" />
                                        {savingTracking ? 'Saving...' : 'Save Tracking Configurations'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Store Settings & Brand',
            href: editAppearance(),
        },
    ],
};
