<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Campaign;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    /**
     * Display a listing of campaigns.
     */
    public function index(Request $request): JsonResponse
    {
        $campaigns = Campaign::where('is_active', true)->latest()->get()->map(function ($camp) {
            $productIds = is_array($camp->product_ids) ? $camp->product_ids : [];

            return [
                'id' => $camp->id,
                'title' => $camp->title,
                'slug' => $camp->slug,
                'eyebrow' => $camp->eyebrow,
                'description' => $camp->description,
                'image' => $camp->image,
                'discount_percentage' => (int) $camp->discount_percentage,
                'productIds' => $productIds,
                'product_ids' => $productIds,
                'start_date' => $camp->start_date,
                'end_date' => $camp->end_date,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $campaigns,
        ]);
    }

    /**
     * Display the specified campaign with its products.
     */
    public function show(string $slugOrId): JsonResponse
    {
        $campaign = Campaign::where('is_active', true)
            ->where(function ($q) use ($slugOrId) {
                $q->where('slug', $slugOrId)->orWhere('id', $slugOrId);
            })
            ->first();

        if (!$campaign) {
            return response()->json([
                'status' => 'error',
                'message' => 'Campaign not found.',
            ], 404);
        }

        $productIds = is_array($campaign->product_ids) ? $campaign->product_ids : [];
        $products = Product::with(['brand', 'category'])
            ->where('is_active', true)
            ->where(function ($q) use ($productIds) {
                $q->whereIn('slug', $productIds)
                  ->orWhereIn('id', $productIds);
            })
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $campaign->id,
                'title' => $campaign->title,
                'slug' => $campaign->slug,
                'eyebrow' => $campaign->eyebrow,
                'description' => $campaign->description,
                'image' => $campaign->image,
                'discount_percentage' => (int) $campaign->discount_percentage,
                'productIds' => $productIds,
                'product_ids' => $productIds,
                'start_date' => $campaign->start_date,
                'end_date' => $campaign->end_date,
                'products' => ProductResource::collection($products),
            ],
        ]);
    }
}
