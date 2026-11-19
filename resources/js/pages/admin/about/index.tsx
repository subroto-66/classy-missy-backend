import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    Heart,
    Info,
    Plus,
    Save,
    Shield,
    Sparkles,
    Star,
    Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SingleImageUpload } from '@/components/single-image-upload';

export type AboutValue = {
    icon: string;
    title: string;
    description: string;
};

export type AboutData = {
    id: number;
    banner_eyebrow: string | null;
    banner_title: string;
    banner_description: string | null;
    banner_image: string | null;
    banner_alt: string | null;

    approach_eyebrow: string | null;
    approach_title: string | null;
    approach_description: string | null;

    routine_tag: string | null;
    routine_title: string | null;
    routine_image: string | null;
    routine_alt: string | null;

    discovery_image_1: string | null;
    discovery_caption_1: string | null;

    discovery_image_2: string | null;
    discovery_caption_2: string | null;

    values_eyebrow: string | null;
    values_title: string | null;
    values: AboutValue[] | null;
};

type Props = {
    about: AboutData;
};

const ICON_OPTIONS = [
    { id: 'heart', label: 'Heart' },
    { id: 'shield', label: 'Shield' },
    { id: 'star', label: 'Star' },
    { id: 'sparkles', label: 'Sparkles' },
    { id: 'check', label: 'Checkmark' },
];

export default function AboutIndex({ about }: Props) {
    const defaultValues: AboutValue[] = [
        {
            icon: 'heart',
            title: 'Care comes first',
            description: 'We make it easier to explore products selected with everyday skincare routines in mind.',
        },
        {
            icon: 'shield',
            title: 'A thoughtful collection',
            description: 'Browse products by brand, category, price, or the skin concern you want to focus on.',
        },
        {
            icon: 'star',
            title: 'Your routine, your way',
            description: 'Save favorites, compare options, and build a routine at a pace that feels right for you.',
        },
    ];

    const form = useForm<{
        banner_eyebrow: string;
        banner_title: string;
        banner_description: string;
        banner_image: string;
        banner_image_file: File | null;
        banner_alt: string;

        approach_eyebrow: string;
        approach_title: string;
        approach_description: string;

        routine_tag: string;
        routine_title: string;
        routine_image: string;
        routine_image_file: File | null;
        routine_alt: string;

        discovery_image_1: string;
        discovery_image_1_file: File | null;
        discovery_caption_1: string;

        discovery_image_2: string;
        discovery_image_2_file: File | null;
        discovery_caption_2: string;

        values_eyebrow: string;
        values_title: string;
        values: AboutValue[];
        _method: string;
    }>({
        banner_eyebrow: about.banner_eyebrow || 'A little more care, every day',
        banner_title: about.banner_title || 'About Classy Missy',
        banner_description: about.banner_description || '',
        banner_image: about.banner_image || '',
        banner_image_file: null,
        banner_alt: about.banner_alt || '',

        approach_eyebrow: about.approach_eyebrow || 'Our approach',
        approach_title: about.approach_title || 'Beauty shopping, made more thoughtful.',
        approach_description: about.approach_description || '',

        routine_tag: about.routine_tag || 'Make room for self-care',
        routine_title: about.routine_title || 'Discover products that feel right for your routine.',
        routine_image: about.routine_image || '',
        routine_image_file: null,
        routine_alt: about.routine_alt || '',

        discovery_image_1: about.discovery_image_1 || '',
        discovery_image_1_file: null,
        discovery_caption_1: about.discovery_caption_1 || 'Thoughtful discovery',

        discovery_image_2: about.discovery_image_2 || '',
        discovery_image_2_file: null,
        discovery_caption_2: about.discovery_caption_2 || 'Everyday essentials',

        values_eyebrow: about.values_eyebrow || 'What matters to us',
        values_title: about.values_title || 'Care in every detail',
        values: Array.isArray(about.values) && about.values.length > 0 ? about.values : defaultValues,
        _method: 'PUT',
    });

    const [activeTab, setActiveTab] = useState<'banner' | 'approach' | 'gallery' | 'values'>('banner');

    const handleAddValue = () => {
        form.setData('values', [
            ...form.data.values,
            { icon: 'sparkles', title: 'New Core Value', description: 'Describe this principle or value.' },
        ]);
    };

    const handleRemoveValue = (index: number) => {
        form.setData('values', form.data.values.filter((_, idx) => idx !== index));
    };

    const handleUpdateValue = (index: number, field: keyof AboutValue, value: string) => {
        const next = [...form.data.values];
        next[index] = { ...next[index], [field]: value };
        form.setData('values', next);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/about', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Edit About Us Page" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Info className="size-6 text-primary" />
                            About Us Page Editor
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Customize the brand story, approach, showcase photos, and core values displayed at <span className="font-mono text-xs">/about-us</span>.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={form.processing}
                            className="bg-primary hover:bg-[var(--primary-hover)] text-white shadow-xs"
                        >
                            <Save className="size-4 mr-1.5" />
                            {form.processing ? 'Saving...' : 'Save All Changes'}
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-border pb-3">
                    {[
                        { id: 'banner', label: '1. Hero & Banner' },
                        { id: 'approach', label: '2. Our Approach' },
                        { id: 'gallery', label: '3. Routine & Gallery' },
                        { id: 'values', label: '4. Core Values' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`rounded-lg px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                                activeTab === tab.id
                                    ? 'bg-primary text-white shadow-xs'
                                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* TAB 1: Banner & Hero */}
                    {activeTab === 'banner' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Header Banner Section</CardTitle>
                                <CardDescription>
                                    The top header banner displayed at the head of the About Us page.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="banner_eyebrow">Banner Eyebrow / Tagline</Label>
                                        <Input
                                            id="banner_eyebrow"
                                            value={form.data.banner_eyebrow}
                                            onChange={(e) => form.setData('banner_eyebrow', e.target.value)}
                                            placeholder="e.g. A little more care, every day"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="banner_title">Page Title *</Label>
                                        <Input
                                            id="banner_title"
                                            value={form.data.banner_title}
                                            onChange={(e) => form.setData('banner_title', e.target.value)}
                                            placeholder="e.g. About Classy Missy"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="banner_description">Banner Introduction Paragraph</Label>
                                    <textarea
                                        id="banner_description"
                                        rows={3}
                                        value={form.data.banner_description}
                                        onChange={(e) => form.setData('banner_description', e.target.value)}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Brief introduction paragraph about the brand..."
                                    />
                                </div>

                                <SingleImageUpload
                                    file={form.data.banner_image_file}
                                    onFileChange={(file) => form.setData('banner_image_file', file)}
                                    existingUrl={form.data.banner_image}
                                    onExistingUrlChange={(url) => form.setData('banner_image', url || '')}
                                    label="Banner Image"
                                    description="Featured editorial banner photo (PNG, JPG, WEBP up to 10MB)"
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* TAB 2: Our Approach */}
                    {activeTab === 'approach' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Our Approach Section</CardTitle>
                                <CardDescription>
                                    Details your brand ethos, philosophy, and shopping experience.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="approach_eyebrow">Section Eyebrow</Label>
                                        <Input
                                            id="approach_eyebrow"
                                            value={form.data.approach_eyebrow}
                                            onChange={(e) => form.setData('approach_eyebrow', e.target.value)}
                                            placeholder="e.g. Our approach"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="approach_title">Heading Title</Label>
                                        <Input
                                            id="approach_title"
                                            value={form.data.approach_title}
                                            onChange={(e) => form.setData('approach_title', e.target.value)}
                                            placeholder="e.g. Beauty shopping, made more thoughtful."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="approach_description">Approach Content (Separate paragraphs by blank line)</Label>
                                    <textarea
                                        id="approach_description"
                                        rows={6}
                                        value={form.data.approach_description}
                                        onChange={(e) => form.setData('approach_description', e.target.value)}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary font-sans leading-relaxed"
                                        placeholder="Write your paragraphs here. Use double Enter / blank line to separate into multiple paragraphs."
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Tip: Each double line break will be formatted as a distinct paragraph on the frontend.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* TAB 3: Routine & Gallery */}
                    {activeTab === 'gallery' && (
                        <div className="space-y-6">
                            {/* Feature Large Photo */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Main Routine Feature Showcase</CardTitle>
                                    <CardDescription>
                                        Large prominent feature image with gradient overlay tag and title.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="routine_tag">Overlay Tagline</Label>
                                            <Input
                                                id="routine_tag"
                                                value={form.data.routine_tag}
                                                onChange={(e) => form.setData('routine_tag', e.target.value)}
                                                placeholder="e.g. Make room for self-care"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="routine_title">Overlay Title</Label>
                                            <Input
                                                id="routine_title"
                                                value={form.data.routine_title}
                                                onChange={(e) => form.setData('routine_title', e.target.value)}
                                                placeholder="e.g. Discover products that feel right for your routine."
                                            />
                                        </div>
                                    </div>

                                    <SingleImageUpload
                                        file={form.data.routine_image_file}
                                        onFileChange={(file) => form.setData('routine_image_file', file)}
                                        existingUrl={form.data.routine_image}
                                        onExistingUrlChange={(url) => form.setData('routine_image', url || '')}
                                        label="Routine Large Feature Image"
                                        description="Large vertical/square editorial photo (PNG, JPG, WEBP up to 10MB)"
                                    />
                                </CardContent>
                            </Card>

                            {/* Two Side Discovery Photos */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Side Discovery Gallery Cards</CardTitle>
                                    <CardDescription>
                                        Two stacked gallery cards alongside the main routine showcase photo.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Card 1 */}
                                    <div className="rounded-lg border border-border p-4 space-y-3">
                                        <h4 className="text-sm font-semibold text-foreground">Discovery Photo 1</h4>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="discovery_caption_1">Caption / Label</Label>
                                            <Input
                                                id="discovery_caption_1"
                                                value={form.data.discovery_caption_1}
                                                onChange={(e) => form.setData('discovery_caption_1', e.target.value)}
                                                placeholder="e.g. Thoughtful discovery"
                                            />
                                        </div>
                                        <SingleImageUpload
                                            file={form.data.discovery_image_1_file}
                                            onFileChange={(file) => form.setData('discovery_image_1_file', file)}
                                            existingUrl={form.data.discovery_image_1}
                                            onExistingUrlChange={(url) => form.setData('discovery_image_1', url || '')}
                                            label="Photo 1 Asset"
                                            description="Upload or paste image URL (PNG, JPG, WEBP)"
                                        />
                                    </div>

                                    {/* Card 2 */}
                                    <div className="rounded-lg border border-border p-4 space-y-3">
                                        <h4 className="text-sm font-semibold text-foreground">Discovery Photo 2</h4>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="discovery_caption_2">Caption / Label</Label>
                                            <Input
                                                id="discovery_caption_2"
                                                value={form.data.discovery_caption_2}
                                                onChange={(e) => form.setData('discovery_caption_2', e.target.value)}
                                                placeholder="e.g. Everyday essentials"
                                            />
                                        </div>
                                        <SingleImageUpload
                                            file={form.data.discovery_image_2_file}
                                            onFileChange={(file) => form.setData('discovery_image_2_file', file)}
                                            existingUrl={form.data.discovery_image_2}
                                            onExistingUrlChange={(url) => form.setData('discovery_image_2', url || '')}
                                            label="Photo 2 Asset"
                                            description="Upload or paste image URL (PNG, JPG, WEBP)"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* TAB 4: Core Values */}
                    {activeTab === 'values' && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>What Matters To Us (Core Values)</CardTitle>
                                        <CardDescription>
                                            Highlight the core promises and pillars that differentiate your brand.
                                        </CardDescription>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddValue}
                                        className="cursor-pointer"
                                    >
                                        <Plus className="size-4 mr-1" />
                                        Add Value
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="values_eyebrow">Section Eyebrow</Label>
                                        <Input
                                            id="values_eyebrow"
                                            value={form.data.values_eyebrow}
                                            onChange={(e) => form.setData('values_eyebrow', e.target.value)}
                                            placeholder="e.g. What matters to us"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="values_title">Section Title</Label>
                                        <Input
                                            id="values_title"
                                            value={form.data.values_title}
                                            onChange={(e) => form.setData('values_title', e.target.value)}
                                            placeholder="e.g. Care in every detail"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Label>Values Cards ({form.data.values.length})</Label>

                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {form.data.values.map((val, idx) => (
                                            <div
                                                key={idx}
                                                className="relative rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-muted-foreground">
                                                        #{idx + 1}
                                                    </span>
                                                    {form.data.values.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveValue(idx)}
                                                            className="text-muted-foreground hover:text-red-600 transition"
                                                            title="Remove value"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label className="text-xs">Icon</Label>
                                                    <select
                                                        value={val.icon}
                                                        onChange={(e) => handleUpdateValue(idx, 'icon', e.target.value)}
                                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                                                    >
                                                        {ICON_OPTIONS.map((opt) => (
                                                            <option key={opt.id} value={opt.id}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label className="text-xs">Title</Label>
                                                    <Input
                                                        value={val.title}
                                                        onChange={(e) => handleUpdateValue(idx, 'title', e.target.value)}
                                                        className="h-9 text-xs"
                                                        placeholder="Value Title"
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label className="text-xs">Description</Label>
                                                    <textarea
                                                        rows={3}
                                                        value={val.description}
                                                        onChange={(e) => handleUpdateValue(idx, 'description', e.target.value)}
                                                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                                        placeholder="Value description..."
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-3">
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="bg-primary hover:bg-[var(--primary-hover)] text-white shadow-xs px-6"
                        >
                            <Save className="size-4 mr-2" />
                            {form.processing ? 'Saving...' : 'Save All Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

AboutIndex.layout = () => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'About Us Page',
            href: '/admin/about',
        },
    ],
});
