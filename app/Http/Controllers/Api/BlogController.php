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

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

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
                'imageAlt' => $blog->image_alt,
                'excerpt' => $blog->excerpt,
                'content' => $blog->content ?? [],
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $blogs,
        ]);
    }

    /**
     * Display the specified blog with full details.
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
                'message' => 'Blog not found.',
            ], 404);
        }

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
                'imageAlt' => $blog->image_alt,
                'excerpt' => $blog->excerpt,
                'intro' => $blog->intro ?? $blog->excerpt,
                'content' => $blog->content ?? [],
                'sections' => $blog->sections ?? [],
                'keyTakeaways' => $blog->key_takeaways ?? [],
                'key_takeaways' => $blog->key_takeaways ?? [],
            ],
        ]);
    }
}
