<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    /**
     * Display a listing of brands.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Brand::withCount(['products' => function ($q) {
            $q->where('is_active', true);
        }])->where('is_active', true)->orderBy('name', 'asc');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $brands = $query->get()->map(function ($brand) {
            return [
                'id' => $brand->id,
                'name' => $brand->name,
                'slug' => $brand->slug,
                'image' => $brand->logo, // Provide as image for frontend compatibility
                'logo' => $brand->logo,
                'description' => $brand->description,
                'website' => $brand->website,
                'products_count' => $brand->products_count,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $brands,
        ]);
    }

    /**
     * Display the specified brand with its products.
     */
    public function show(string $slugOrId): JsonResponse
    {
        $brand = Brand::withCount(['products' => function ($q) {
            $q->where('is_active', true);
        }])
            ->where('is_active', true)
            ->where(function ($q) use ($slugOrId) {
                $q->where('slug', $slugOrId)->orWhere('id', $slugOrId);
            })
            ->first();

        if (!$brand) {
            return response()->json([
                'status' => 'error',
                'message' => 'Brand not found.',
            ], 404);
        }

        $products = $brand->products()
            ->with(['brand', 'category'])
            ->where('is_active', true)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $brand->id,
                'name' => $brand->name,
                'slug' => $brand->slug,
                'image' => $brand->logo,
                'logo' => $brand->logo,
                'description' => $brand->description,
                'website' => $brand->website,
                'products_count' => $brand->products_count,
                'products' => ProductResource::collection($products),
            ],
        ]);
    }
}
