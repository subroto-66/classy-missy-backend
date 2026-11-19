<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Campaign;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CampaignController extends Controller
{
    /**
     * Display a listing of active campaigns.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Campaign::where('is_active', true);

        if ($placement = $request->input('placement')) {
            $query->where('placement', $placement);
        }

        $campaigns = $query->orderBy('order', 'asc')->latest('id')->get()->map(function ($camp) {
            $productIds = is_array($camp->product_ids) ? $camp->product_ids : [];

            $imageUrl = $camp->image;
            if (!empty($imageUrl) && !Str::startsWith($imageUrl, ['http://', 'https://', '//', 'data:'])) {
                $imageUrl = url($imageUrl);
            }

            $destinationLink = $camp->link ?: "/products?campaign={$camp->slug}";

            return [
                'id' => $camp->id,
                'title' => $camp->title,
                'slug' => $camp->slug,
                'eyebrow' => $camp->eyebrow,
                'description' => $camp->description,
                'image' => $imageUrl,
                'image_raw' => $camp->image,
                'placement' => $camp->placement ?: 'slider',
                'link' => $destinationLink,
                'href' => $destinationLink,
                'order' => (int) $camp->order,
                'discount_percentage' => (int) $camp->discount_percentage,
                'productIds' => $productIds,
                'product_ids' => $productIds,
                'start_date' => $camp->start_date ? $camp->start_date->format('Y-m-d') : null,
                'end_date' => $camp->end_date ? $camp->end_date->format('Y-m-d') : null,
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
        $products = collect();

        if (!empty($productIds)) {
            $products = Product::with(['brand', 'category'])
                ->where('is_active', true)
                ->where(function ($q) use ($productIds) {
                    $q->whereIn('id', $productIds)
                      ->orWhereIn('slug', $productIds);
                })
                ->get();
        }

        $imageUrl = $campaign->image;
        if (!empty($imageUrl) && !Str::startsWith($imageUrl, ['http://', 'https://', '//', 'data:'])) {
            $imageUrl = url($imageUrl);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $campaign->id,
                'title' => $campaign->title,
                'slug' => $campaign->slug,
                'eyebrow' => $campaign->eyebrow,
                'description' => $campaign->description,
                'image' => $imageUrl,
                'image_raw' => $campaign->image,
                'placement' => $campaign->placement ?: 'slider',
                'link' => $campaign->link ?: "/products?campaign={$campaign->slug}",
                'href' => $campaign->link ?: "/products?campaign={$campaign->slug}",
                'order' => (int) $campaign->order,
                'discount_percentage' => (int) $campaign->discount_percentage,
                'products' => ProductResource::collection($products),
                'start_date' => $campaign->start_date ? $campaign->start_date->format('Y-m-d') : null,
                'end_date' => $campaign->end_date ? $campaign->end_date->format('Y-m-d') : null,
            ],
        ]);
    }
}
