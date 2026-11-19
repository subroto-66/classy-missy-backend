<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    /**
     * Display a listing of blog articles in the Admin dashboard.
     */
    public function index(Request $request): Response
    {
        $query = Blog::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category') && $request->input('category') !== 'all') {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('status')) {
            $status = $request->input('status');
            if ($status === 'published') {
                $query->where('is_published', true);
            } elseif ($status === 'draft') {
                $query->where('is_published', false);
            }
        }

        $blogs = $query->latest('id')->paginate(10)->withQueryString();

        $categories = Blog::whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->filter()
            ->values();

        return Inertia::render('admin/blogs/index', [
            'blogs' => $blogs,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'status']),
        ]);
    }

    /**
     * Store a newly created blog article in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'read_time' => ['nullable', 'string', 'max:50'],
            'published_at' => ['nullable', 'date'],
            'excerpt' => ['nullable', 'string', 'max:600'],
            'intro' => ['nullable', 'string', 'max:1000'],
            'content_text' => ['nullable', 'string'],
            'image' => ['nullable'],
            'image_file' => ['nullable', 'image', 'max:5120'],
            'is_published' => ['boolean'],
        ]);

        $validated['slug'] = Str::slug($validated['title']);
        while (Blog::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . mt_rand(100, 999);
        }

        $validated['is_published'] = $request->boolean('is_published', true);
        $validated['read_time'] = $validated['read_time'] ?: '5 min read';
        $validated['published_at'] = $validated['published_at'] ?: now()->format('Y-m-d');

        // Parse content if content_text is provided
        if (!empty($validated['content_text'])) {
            $contentRaw = trim($validated['content_text']);
            if (preg_match('/<[a-z][\s\S]*>/i', $contentRaw)) {
                $validated['content'] = [$contentRaw];
            } else {
                $paragraphs = array_filter(
                    array_map('trim', explode("\n\n", str_replace("\r\n", "\n", $contentRaw)))
                );
                $validated['content'] = array_values($paragraphs);
            }
        } else {
            $validated['content'] = [$validated['excerpt'] ?: $validated['title']];
        }

        if (empty($validated['intro']) && !empty($validated['excerpt'])) {
            $validated['intro'] = $validated['excerpt'];
        }

        // Image upload handling
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('blogs', 'public');
            $validated['image'] = Storage::url($path);
        } elseif ($request->hasFile('image')) {
            $path = $request->file('image')->store('blogs', 'public');
            $validated['image'] = Storage::url($path);
        } elseif ($request->has('image') && is_string($request->input('image'))) {
            $validated['image'] = trim($request->input('image')) ?: null;
        } else {
            $validated['image'] = 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1200&q=85';
        }

        $validated['image_alt'] = $validated['title'];

        unset($validated['image_file'], $validated['content_text']);

        $blog = Blog::create($validated);

        try {
            app(\App\Services\AdminNotificationService::class)->notifyAdmins(
                title: "New Blog Article Published",
                message: "\"{$blog->title}\" was published under {$blog->category}.",
                type: 'blog',
                link: '/admin/blogs',
                actionLabel: 'View Article',
                metadata: ['blog_id' => $blog->id, 'slug' => $blog->slug]
            );
        } catch (\Throwable $e) {}

        return back()->with('success', 'Blog article created successfully.');
    }

    /**
     * Update the specified blog article in storage.
     */
    public function update(Request $request, Blog $blog): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'read_time' => ['nullable', 'string', 'max:50'],
            'published_at' => ['nullable', 'date'],
            'excerpt' => ['nullable', 'string', 'max:600'],
            'intro' => ['nullable', 'string', 'max:1000'],
            'content_text' => ['nullable', 'string'],
            'image' => ['nullable'],
            'image_file' => ['nullable', 'image', 'max:5120'],
            'is_published' => ['boolean'],
        ]);

        if ($validated['title'] !== $blog->title) {
            $validated['slug'] = Str::slug($validated['title']);
            while (Blog::where('slug', $validated['slug'])->where('id', '!=', $blog->id)->exists()) {
                $validated['slug'] = Str::slug($validated['title']) . '-' . mt_rand(100, 999);
            }
        }

        $validated['is_published'] = $request->boolean('is_published', true);
        $validated['read_time'] = $validated['read_time'] ?: ($blog->read_time ?: '5 min read');

        // Parse content if content_text is provided
        if (isset($validated['content_text'])) {
            if (!empty($validated['content_text'])) {
                $contentRaw = trim($validated['content_text']);
                if (preg_match('/<[a-z][\s\S]*>/i', $contentRaw)) {
                    $validated['content'] = [$contentRaw];
                } else {
                    $paragraphs = array_filter(
                        array_map('trim', explode("\n\n", str_replace("\r\n", "\n", $contentRaw)))
                    );
                    $validated['content'] = array_values($paragraphs);
                }
            } else {
                $validated['content'] = [];
            }
            // Clear sections so rich content is displayed instead of stale sections
            $validated['sections'] = null;
            unset($validated['content_text']);
        }

        // Image upload handling
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('blogs', 'public');
            $validated['image'] = Storage::url($path);
        } elseif ($request->hasFile('image')) {
            $path = $request->file('image')->store('blogs', 'public');
            $validated['image'] = Storage::url($path);
        } elseif ($request->has('image') && is_string($request->input('image'))) {
            $validated['image'] = trim($request->input('image')) ?: $blog->image;
        }

        unset($validated['image_file']);

        $blog->update($validated);

        return back()->with('success', 'Blog article updated successfully.');
    }

    /**
     * Remove the specified blog article from storage.
     */
    public function destroy(Blog $blog): RedirectResponse
    {
        $blog->delete();

        return back()->with('success', 'Blog article deleted successfully.');
    }
}
