import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Calendar, Clock, Newspaper, Plus } from 'lucide-react';
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
import { RichTextEditor } from '@/components/rich-text-editor';
import { SingleImageUpload } from '@/components/single-image-upload';
import type { BlogArticle, PaginatedData } from '@/types';

type Props = {
    blogs: PaginatedData<BlogArticle> | BlogArticle[];
    categories?: string[];
    filters?: {
        search?: string;
        category?: string;
        status?: string;
    };
};

const DEFAULT_CATEGORIES = [
    'Skincare Basics',
    'Skin Health',
    'Ingredients',
    'Sun Care',
    'Product Guides',
    'Beauty Routine',
];

export default function BlogsIndex({ blogs, categories = [], filters = {} }: Props) {
    const blogList = Array.isArray(blogs) ? blogs : (blogs?.data || []);
    const totalBlogs = Array.isArray(blogs) ? blogs.length : (blogs?.total ?? 0);
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (val: string) => {
        setSearch(val);
        router.get('/admin/blogs', { ...filters, search: val }, {
            preserveState: true,
            replace: true,
        });
    };

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<BlogArticle | null>(null);
    const [deletingBlog, setDeletingBlog] = useState<BlogArticle | null>(null);

    const mergedCategories = Array.from(new Set([...categories, ...DEFAULT_CATEGORIES]));

    const createForm = useForm<{
        title: string;
        category: string;
        read_time: string;
        published_at: string;
        excerpt: string;
        intro: string;
        content_text: string;
        image: string;
        image_file: File | null;
        is_published: boolean;
    }>({
        title: '',
        category: 'Skincare Basics',
        read_time: '5 min read',
        published_at: new Date().toISOString().split('T')[0],
        excerpt: '',
        intro: '',
        content_text: '',
        image: '',
        image_file: null,
        is_published: true,
    });

    const editForm = useForm<{
        title: string;
        category: string;
        read_time: string;
        published_at: string;
        excerpt: string;
        intro: string;
        content_text: string;
        image: string;
        image_file: File | null;
        is_published: boolean;
        _method?: string;
    }>({
        title: '',
        category: 'Skincare Basics',
        read_time: '5 min read',
        published_at: '',
        excerpt: '',
        intro: '',
        content_text: '',
        image: '',
        image_file: null,
        is_published: true,
    });

    const deleteForm = useForm({});

    const handleOpenEdit = (b: BlogArticle) => {
        setEditingBlog(b);
        let contentStr = '';
        if (Array.isArray(b.content)) {
            const hasHtml = b.content.some((item) => /<[a-z][\s\S]*>/i.test(item));
            if (hasHtml) {
                contentStr = b.content.join('');
            } else {
                contentStr = b.content.map((p) => `<p>${p}</p>`).join('');
            }
        } else if (typeof b.content === 'string') {
            contentStr = b.content;
        } else if (b.sections && Array.isArray(b.sections)) {
            contentStr = b.sections
                .map((sec) => {
                    const heading = `<h2>${sec.heading}</h2>`;
                    const paras = (sec.paragraphs || []).map((p) => `<p>${p}</p>`).join('');
                    const bullets = (sec.bullets || []).length
                        ? `<ul>${sec.bullets.map((item) => `<li>${item}</li>`).join('')}</ul>`
                        : '';
                    return heading + paras + bullets;
                })
                .join('');
        }

        editForm.setData({
            title: b.title,
            category: b.category,
            read_time: b.read_time || '5 min read',
            published_at: b.published_at ? b.published_at.split('T')[0] : '',
            excerpt: b.excerpt || '',
            intro: b.intro || '',
            content_text: contentStr,
            image: b.image || '',
            image_file: null,
            is_published: b.is_published,
        });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/blogs', {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBlog) return;
        editForm.transform((data) => ({
            ...data,
            _method: 'PUT',
        }));
        editForm.post(`/admin/blogs/${editingBlog.id}`, {
            forceFormData: true,
            onSuccess: () => {
                setEditingBlog(null);
                editForm.reset();
            },
        });
    };

    const handleDeleteSubmit = () => {
        if (!deletingBlog) return;
        deleteForm.delete(`/admin/blogs/${deletingBlog.id}`, {
            onSuccess: () => {
                setDeletingBlog(null);
            },
        });
    };

    return (
        <>
            <Head title="Blogs & Articles Management" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <CatalogList
                    title="Blogs & Articles"
                    totalCount={totalBlogs}
                    countLabel="Articles"
                    addButtonLabel="Add Article"
                    onAdd={() => setIsCreateOpen(true)}
                    search={search}
                    onSearchChange={handleSearch}
                    searchPlaceholder="Search articles by title, excerpt, category..."
                    items={blogList}
                    paginationData={blogs}
                    gridClassName="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    emptyMessage="No blog articles found. Click &quot;Add Article&quot; to publish your first skincare guide."
                    renderCard={(b) => (
                        <CatalogCard
                            key={b.id}
                            title={b.title}
                            eyebrow={b.category}
                            description={b.excerpt || 'No excerpt'}
                            image={b.image}
                            imageHeight="h-40"
                            fallbackIcon={<Newspaper className="size-8" />}
                            status={b.is_published ? 'active' : 'inactive'}
                            statusLabel={b.is_published ? 'Published' : 'Draft'}
                            meta={
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-[10px] font-normal">
                                        <Clock className="mr-1 size-3" />
                                        {b.read_time || '5 min read'}
                                    </Badge>
                                </div>
                            }
                            footerLeft={
                                <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                                    <Calendar className="size-3" />
                                    {b.published_at ? b.published_at.split('T')[0] : 'Draft'}
                                </span>
                            }
                            onEdit={() => handleOpenEdit(b)}
                            onDelete={() => setDeletingBlog(b)}
                        />
                    )}
                />

                {/* Add Article Dialog */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add Blog Article</DialogTitle>
                            <DialogDescription>
                                Create and publish a new skincare article or beauty guide.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="b-title">Article Title *</Label>
                                <Input
                                    id="b-title"
                                    placeholder="e.g. Building a Simple Skincare Routine"
                                    value={createForm.data.title}
                                    onChange={(e) => createForm.setData('title', e.target.value)}
                                    required
                                />
                                {createForm.errors.title && (
                                    <p className="text-xs text-red-600">{createForm.errors.title}</p>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="b-category">Category / Topic *</Label>
                                    <Input
                                        id="b-category"
                                        list="blog-categories"
                                        placeholder="e.g. Skincare Basics"
                                        value={createForm.data.category}
                                        onChange={(e) => createForm.setData('category', e.target.value)}
                                        required
                                    />
                                    <datalist id="blog-categories">
                                        {mergedCategories.map((c) => (
                                            <option key={c} value={c} />
                                        ))}
                                    </datalist>
                                    {createForm.errors.category && (
                                        <p className="text-xs text-red-600">{createForm.errors.category}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="b-read_time">Reading Time</Label>
                                    <Input
                                        id="b-read_time"
                                        placeholder="e.g. 5 min read"
                                        value={createForm.data.read_time}
                                        onChange={(e) => createForm.setData('read_time', e.target.value)}
                                    />
                                </div>
                            </div>

                            <SingleImageUpload
                                file={createForm.data.image_file}
                                onFileChange={(file) => createForm.setData('image_file', file)}
                                existingUrl={createForm.data.image}
                                onExistingUrlChange={(url) => createForm.setData('image', url || '')}
                                label="Cover Image"
                            />
                            {createForm.errors.image && (
                                <p className="text-xs text-red-600">{createForm.errors.image}</p>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="b-excerpt">Short Summary / Excerpt</Label>
                                <textarea
                                    id="b-excerpt"
                                    rows={2}
                                    placeholder="Brief introduction displayed on card previews..."
                                    className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm shadow-xs focus:border-primary focus:outline-hidden dark:border-neutral-700"
                                    value={createForm.data.excerpt}
                                    onChange={(e) => createForm.setData('excerpt', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="b-content">Article Content *</Label>
                                    <span className="text-[11px] text-[#a5a3ae]">Rich Text Editor (HTML)</span>
                                </div>
                                <RichTextEditor
                                    value={createForm.data.content_text}
                                    onChange={(val) => createForm.setData('content_text', val)}
                                    placeholder="Write your comprehensive skincare guide, routine tips, ingredient analysis, or recommendations..."
                                    editorClassName="min-h-[220px] max-h-[400px] [&_.tiptap]:min-h-[200px]"
                                />
                                {createForm.errors.content_text && (
                                    <p className="text-xs text-red-600">{createForm.errors.content_text}</p>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 items-center pt-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="b-published_at">Publication Date</Label>
                                    <Input
                                        id="b-published_at"
                                        type="date"
                                        value={createForm.data.published_at}
                                        onChange={(e) => createForm.setData('published_at', e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-6">
                                    <input
                                        type="checkbox"
                                        id="b-is_published"
                                        checked={createForm.data.is_published}
                                        onChange={(e) => createForm.setData('is_published', e.target.checked)}
                                        className="size-4 rounded border-neutral-300 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="b-is_published" className="cursor-pointer text-sm font-medium">
                                        Publish immediately
                                    </Label>
                                </div>
                            </div>

                            <DialogFooter className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createForm.processing}>
                                    {createForm.processing ? 'Publishing...' : 'Create Article'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Article Dialog */}
                <Dialog open={!!editingBlog} onOpenChange={(open) => !open && setEditingBlog(null)}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Blog Article</DialogTitle>
                            <DialogDescription>
                                Update article details, content, or publication status.
                            </DialogDescription>
                        </DialogHeader>

                        {editingBlog && (
                            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="eb-title">Article Title *</Label>
                                    <Input
                                        id="eb-title"
                                        value={editForm.data.title}
                                        onChange={(e) => editForm.setData('title', e.target.value)}
                                        required
                                    />
                                    {editForm.errors.title && (
                                        <p className="text-xs text-red-600">{editForm.errors.title}</p>
                                    )}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="eb-category">Category / Topic *</Label>
                                        <Input
                                            id="eb-category"
                                            list="blog-categories"
                                            value={editForm.data.category}
                                            onChange={(e) => editForm.setData('category', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="eb-read_time">Reading Time</Label>
                                        <Input
                                            id="eb-read_time"
                                            value={editForm.data.read_time}
                                            onChange={(e) => editForm.setData('read_time', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <SingleImageUpload
                                    file={editForm.data.image_file}
                                    onFileChange={(file) => editForm.setData('image_file', file)}
                                    existingUrl={editForm.data.image}
                                    onExistingUrlChange={(url) => editForm.setData('image', url || '')}
                                    label="Cover Image"
                                />

                                <div className="space-y-1.5">
                                    <Label htmlFor="eb-excerpt">Short Summary / Excerpt</Label>
                                    <textarea
                                        id="eb-excerpt"
                                        rows={2}
                                        className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm shadow-xs focus:border-primary focus:outline-hidden dark:border-neutral-700"
                                        value={editForm.data.excerpt}
                                        onChange={(e) => editForm.setData('excerpt', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="eb-content">Article Content *</Label>
                                        <span className="text-[11px] text-[#a5a3ae]">Rich Text Editor (HTML)</span>
                                    </div>
                                    <RichTextEditor
                                        value={editForm.data.content_text}
                                        onChange={(val) => editForm.setData('content_text', val)}
                                        placeholder="Write your comprehensive skincare guide, routine tips, ingredient analysis, or recommendations..."
                                        editorClassName="min-h-[220px] max-h-[400px] [&_.tiptap]:min-h-[200px]"
                                    />
                                    {editForm.errors.content_text && (
                                        <p className="text-xs text-red-600">{editForm.errors.content_text}</p>
                                    )}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 items-center pt-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="eb-published_at">Publication Date</Label>
                                        <Input
                                            id="eb-published_at"
                                            type="date"
                                            value={editForm.data.published_at}
                                            onChange={(e) => editForm.setData('published_at', e.target.value)}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 pt-6">
                                        <input
                                            type="checkbox"
                                            id="eb-is_published"
                                            checked={editForm.data.is_published}
                                            onChange={(e) => editForm.setData('is_published', e.target.checked)}
                                            className="size-4 rounded border-neutral-300 text-primary focus:ring-primary"
                                        />
                                        <Label htmlFor="eb-is_published" className="cursor-pointer text-sm font-medium">
                                            Published & visible
                                        </Label>
                                    </div>
                                </div>

                                <DialogFooter className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditingBlog(null)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={editForm.processing}>
                                        {editForm.processing ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={!!deletingBlog} onOpenChange={(open) => !open && setDeletingBlog(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Delete Article</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete &quot;{deletingBlog?.title}&quot;? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDeletingBlog(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDeleteSubmit}
                                disabled={deleteForm.processing}
                            >
                                {deleteForm.processing ? 'Deleting...' : 'Delete'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
