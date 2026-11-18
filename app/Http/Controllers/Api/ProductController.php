<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Campaign;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of products with flexible filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['brand', 'category'])->where('is_active', true);

        // Text Search
        if ($search = $request->input('search', $request->input('q'))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhereHas('brand', function ($bq) use ($search) {
                      $bq->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('category', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Category filter (slug, name, or id - single or array)
        if ($categories = $request->input('category')) {
            $catList = is_array($categories) ? $categories : explode(',', (string) $categories);
            $query->whereHas('category', function ($q) use ($catList) {
                $q->whereIn('slug', $catList)
                  ->orWhereIn('name', $catList)
                  ->orWhereIn('id', $catList);
            });
        }

        // Brand filter (slug, name, or id - single or array)
        if ($brands = $request->input('brand')) {
            $brandList = is_array($brands) ? $brands : explode(',', (string) $brands);
            $query->whereHas('brand', function ($q) use ($brandList) {
                $q->whereIn('slug', $brandList)
                  ->orWhereIn('name', $brandList)
                  ->orWhereIn('id', $brandList);
            });
        }

        // Campaign filter
        if ($campaignParam = $request->input('campaign')) {
            $campaignSlugs = is_array($campaignParam) ? $campaignParam : explode(',', (string) $campaignParam);
            $campaigns = Campaign::whereIn('slug', $campaignSlugs)->where('is_active', true)->get();
            $productIds = [];
            foreach ($campaigns as $camp) {
                if (is_array($camp->product_ids)) {
                    $productIds = array_merge($productIds, $camp->product_ids);
                }
            }
            if (!empty($productIds)) {
                $query->where(function ($q) use ($productIds) {
                    $q->whereIn('id', $productIds)
                      ->orWhereIn('slug', $productIds);
                });
            }
        }

        // Problem filter
        if ($problems = $request->input('problem')) {
            $probList = is_array($problems) ? $problems : explode(',', (string) $problems);
            $query->where(function ($q) use ($probList) {
                foreach ($probList as $prob) {
                    $q->orWhereJsonContains('problems', $prob);
                }
            });
        }

        // Price range
        $minPrice = $request->input('minPrice', $request->input('min_price'));
        if ($minPrice !== null && is_numeric($minPrice)) {
            $query->where('price', '>=', (float) $minPrice);
        }

        $maxPrice = $request->input('maxPrice', $request->input('max_price'));
        if ($maxPrice !== null && is_numeric($maxPrice)) {
            $query->where('price', '<=', (float) $maxPrice);
        }

        // On Sale filter
        if ($request->boolean('sale')) {
            $query->whereNotNull('old_price')->whereColumn('old_price', '>', 'price');
        }

        // Featured filter
        if ($request->has('featured')) {
            $query->where('is_featured', $request->boolean('featured'));
        }

        // Sorting
        $sort = $request->input('sort');
        match ($sort) {
            'price-asc' => $query->orderBy('price', 'asc'),
            'price-desc' => $query->orderBy('price', 'desc'),
            'rating' => $query->orderBy('rating', 'desc'),
            'name' => $query->orderBy('name', 'asc'),
            'newest' => $query->orderBy('id', 'desc'),
            default => $query->orderBy('id', 'asc'),
        };

        // Pagination or collection
        if ($request->has('all') && $request->boolean('all')) {
            $products = $query->get();
            return response()->json([
                'status' => 'success',
                'data' => ProductResource::collection($products),
                'total' => $products->count(),
            ]);
        }

        $perPage = (int) $request->input('per_page', $request->input('limit', 20));
        $paginated = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => ProductResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    /**
     * Display the specified product.
     */
    public function show(string $slugOrId): JsonResponse
    {
        $product = Product::with(['brand', 'category', 'reviews' => function ($q) {
            $q->where('is_approved', true)->latest();
        }])
            ->where('is_active', true)
            ->where(function ($q) use ($slugOrId) {
                $q->where('slug', $slugOrId)
                  ->orWhere('id', $slugOrId);
            })
            ->first();

        if (!$product) {
            return response()->json([
                'status' => 'error',
                'message' => 'Product not found.',
            ], 404);
        }

        // Related products in the same category or brand
        $related = Product::with(['brand', 'category'])
            ->where('is_active', true)
            ->where('id', '!=', $product->id)
            ->where(function ($q) use ($product) {
                if ($product->category_id) {
                    $q->where('category_id', $product->category_id);
                }
                if ($product->brand_id) {
                    $q->orWhere('brand_id', $product->brand_id);
                }
            })
            ->take(6)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => new ProductResource($product),
            'related' => ProductResource::collection($related),
        ]);
    }
}
