<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Get reviews for a specific product.
     */
    public function index(string $productId): JsonResponse
    {
        $product = Product::where('slug', $productId)
            ->orWhere('id', $productId)
            ->first();

        if (!$product) {
            return response()->json([
                'status' => 'error',
                'message' => 'Product not found.',
            ], 404);
        }

        $reviews = Review::where('product_id', $product->id)
            ->where('is_approved', true)
            ->latest()
            ->get()
            ->map(function ($rev) {
                return [
                    'id' => (string) $rev->id,
                    'name' => $rev->name,
                    'rating' => $rev->rating,
                    'text' => $rev->review,
                    'review' => $rev->review,
                    'createdAt' => $rev->created_at?->toIso8601String(),
                    'date' => $rev->created_at?->format('M d, Y'),
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $reviews,
        ]);
    }

    /**
     * Submit a review for a product.
     */
    public function store(Request $request, string $productId): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'rating' => 'required|integer|min:1|max:5',
            'text' => 'nullable|string|max:1000',
            'review' => 'nullable|string|max:1000',
        ]);

        $product = Product::where('slug', $productId)
            ->orWhere('id', $productId)
            ->first();

        if (!$product) {
            return response()->json([
                'status' => 'error',
                'message' => 'Product not found.',
            ], 404);
        }

        $reviewText = $request->input('text', $request->input('review', ''));
        if (empty($reviewText)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Review content cannot be empty.',
            ], 422);
        }

        $user = $request->user();

        $review = Review::create([
            'product_id' => $product->id,
            'user_id' => $user?->id,
            'name' => $request->name,
            'rating' => (int) $request->rating,
            'review' => $reviewText,
            'is_approved' => true,
        ]);

        // Update product rating and reviews_count
        $avgRating = Review::where('product_id', $product->id)->where('is_approved', true)->avg('rating');
        $count = Review::where('product_id', $product->id)->where('is_approved', true)->count();
        $product->update([
            'rating' => round($avgRating, 2),
            'reviews_count' => $count,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Thank you! Your review has been submitted.',
            'data' => [
                'id' => (string) $review->id,
                'name' => $review->name,
                'rating' => $review->rating,
                'text' => $review->review,
                'review' => $review->review,
                'createdAt' => $review->created_at?->toIso8601String(),
                'date' => $review->created_at?->format('M d, Y'),
            ],
        ], 201);
    }

    /**
     * Get reviews by authenticated user.
     */
    public function userReviews(Request $request): JsonResponse
    {
        $user = $request->user() ?: auth('sanctum')->user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated',
            ], 401);
        }

        $query = Review::with('product')
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('name', $user->name);
            })
            ->latest();

        $reviews = $query->get()->map(function ($rev) {
            return [
                'id' => (string) $rev->id,
                'product' => $rev->product ? $rev->product->name : 'Product',
                'product_slug' => $rev->product?->slug,
                'rating' => $rev->rating,
                'review' => $rev->review,
                'date' => $rev->created_at?->format('M d, Y'),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $reviews,
        ]);
    }
}
