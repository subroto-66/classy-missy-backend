<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Category::withCount(['products' => function ($q) {
            $q->where('is_active', true);
        }])->where('is_active', true)->orderBy('order', 'asc');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $categories = $query->get()->map(function ($cat) {
            return [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'image' => $cat->image,
                'description' => $cat->description,
                'order' => $cat->order,
                'products_count' => $cat->products_count,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $categories,
        ]);
    }

    /**
     * Display the specified category with its products.
     */
    public function show(string $slugOrId): JsonResponse
    {
        $category = Category::withCount(['products' => function ($q) {
            $q->where('is_active', true);
        }])
            ->where('is_active', true)
            ->where(function ($q) use ($slugOrId) {
                $q->where('slug', $slugOrId)->orWhere('id', $slugOrId);
            })
            ->first();

        if (!$category) {
            return response()->json([
                'status' => 'error',
                'message' => 'Category not found.',
            ], 404);
        }

        $products = $category->products()
            ->with(['brand', 'category'])
            ->where('is_active', true)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'image' => $category->image,
                'description' => $category->description,
                'products_count' => $category->products_count,
                'products' => ProductResource::collection($products),
            ],
        ]);
    }
}
