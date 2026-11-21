<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LandingPage;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class LandingPageController extends Controller
{
    /**
     * Display a listing of active landing pages.
     */
    public function index(): JsonResponse
    {
        $landingPages = LandingPage::with('product')
            ->where('is_active', true)
            ->orderBy('order')
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $landingPages,
        ]);
    }

    /**
     * Display the specified landing page by slug or related product slug/id.
     */
    public function show(string $slugOrProduct): JsonResponse
    {
        $landingPage = LandingPage::with('product')
            ->where('is_active', true)
            ->where(function ($q) use ($slugOrProduct) {
                $q->where('slug', $slugOrProduct)
                  ->orWhereHas('product', function ($pq) use ($slugOrProduct) {
                      $pq->where('slug', $slugOrProduct)
                         ->orWhere('id', $slugOrProduct);
                  });
            })
            ->first();

        if (!$landingPage) {
            return response()->json([
                'status' => 'error',
                'message' => 'Landing page not found.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $landingPage,
        ]);
    }
}
