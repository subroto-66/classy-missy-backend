<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    /**
     * Display a listing of blogs.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Blog::where('is_published', true)->latest('published_at');

        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($category = trim($request->input('category', ''))) {
            if (strtolower($category) !== 'all') {
                $query->where('category', $category);
            }
        }

        $allPublished = Blog::where('is_published', true)->get(['category']);
        $categoriesCounts = $allPublished->groupBy('category')->map->count();

        $blogs = $query->get()->map(function ($blog) {
            return [
                'id' => $blog->id,
                'title' => $blog->title,
                'slug' => $blog->slug,
                'category' => $blog->category,
                'publishedAt' => $blog->published_at ? $blog->published_at->format('Y-m-d') : null,
                'published_at' => $blog->published_at ? $blog->published_at->format('Y-m-d') : null,
                'readTime' => $blog->read_time,
                'read_time' => $blog->read_time,
                'image' => $blog->image,
                'imageAlt' => $blog->image_alt ?: $blog->title,
                'image_alt' => $blog->image_alt ?: $blog->title,
                'excerpt' => $blog->excerpt,
                'intro' => $blog->intro ?: $blog->excerpt,
                'content' => $blog->content ?? [],
                'sections' => $blog->sections ?? [],
                'keyTakeaways' => $blog->key_takeaways ?? [],
                'key_takeaways' => $blog->key_takeaways ?? [],
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $blogs,
            'meta' => [
                'total' => $blogs->count(),
                'categories' => $categoriesCounts,
            ],
        ]);
    }

    /**
     * Display the specified blog with full details and related articles.
     */
    public function show(string $slugOrId): JsonResponse
    {
        $blog = Blog::where('is_published', true)
            ->where(function ($q) use ($slugOrId) {
                $q->where('slug', $slugOrId)->orWhere('id', $slugOrId);
            })
            ->first();

        if (!$blog) {
            return response()->json([
                'status' => 'error',
                'message' => 'Blog article not found.',
            ], 404);
        }

        // Fetch related blogs from the same category or latest published
        $relatedQuery = Blog::where('is_published', true)
            ->where('id', '!=', $blog->id)
            ->where('category', $blog->category)
            ->latest('published_at')
            ->take(3);

        $related = $relatedQuery->get();

        if ($related->count() < 3) {
            $extra = Blog::where('is_published', true)
                ->where('id', '!=', $blog->id)
                ->whereNotIn('id', $related->pluck('id'))
                ->latest('published_at')
                ->take(3 - $related->count())
                ->get();
            $related = $related->merge($extra);
        }

        $relatedMapped = $related->map(function ($b) {
            return [
                'id' => $b->id,
                'title' => $b->title,
                'slug' => $b->slug,
                'category' => $b->category,
                'publishedAt' => $b->published_at ? $b->published_at->format('Y-m-d') : null,
                'published_at' => $b->published_at ? $b->published_at->format('Y-m-d') : null,
                'readTime' => $b->read_time,
                'read_time' => $b->read_time,
                'image' => $b->image,
                'imageAlt' => $b->image_alt ?: $b->title,
                'image_alt' => $b->image_alt ?: $b->title,
                'excerpt' => $b->excerpt,
            ];
        });

        // Previous and Next blogs for sequential reading
        $prevBlog = Blog::where('is_published', true)
            ->where('id', '<', $blog->id)
            ->latest('id')
            ->first(['id', 'title', 'slug', 'category']);

        $nextBlog = Blog::where('is_published', true)
            ->where('id', '>', $blog->id)
            ->oldest('id')
            ->first(['id', 'title', 'slug', 'category']);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $blog->id,
                'title' => $blog->title,
                'slug' => $blog->slug,
                'category' => $blog->category,
                'publishedAt' => $blog->published_at ? $blog->published_at->format('Y-m-d') : null,
                'published_at' => $blog->published_at ? $blog->published_at->format('Y-m-d') : null,
                'readTime' => $blog->read_time,
                'read_time' => $blog->read_time,
                'image' => $blog->image,
                'imageAlt' => $blog->image_alt ?: $blog->title,
                'image_alt' => $blog->image_alt ?: $blog->title,
                'excerpt' => $blog->excerpt,
                'intro' => $blog->intro ?: $blog->excerpt,
                'content' => $blog->content ?? [],
                'sections' => $blog->sections ?? [],
                'keyTakeaways' => $blog->key_takeaways ?? [],
                'key_takeaways' => $blog->key_takeaways ?? [],
                'relatedBlogs' => $relatedMapped,
                'related_blogs' => $relatedMapped,
                'prevBlog' => $prevBlog,
                'prev_blog' => $prevBlog,
                'nextBlog' => $nextBlog,
                'next_blog' => $nextBlog,
            ],
        ]);
    }
}
