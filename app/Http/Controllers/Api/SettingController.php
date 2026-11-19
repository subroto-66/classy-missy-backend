<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    /**
     * Get all public settings for the storefront.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'frontend_logo' => Setting::get('frontend_logo', '/logo.svg'),
            'frontend_logo_dark' => Setting::get('frontend_logo_dark', null),
            'favicon' => Setting::get('favicon', '/favicon.svg'),
            'primary_color' => Setting::get('primary_color', '#171717'),
            'site_title' => Setting::get('site_title', 'Classy Missy'),
            'site_tagline' => Setting::get('site_tagline', "Women's Fashion & Lifestyle"),
            'meta_title' => Setting::get('meta_title', 'Classy Missy - Trendy Women\'s Fashion & Online Boutique'),
            'meta_description' => Setting::get('meta_description', 'Discover chic and trendy women\'s fashion, luxury clothing, and premium dresses at Classy Missy. Exclusive collection with fast delivery across Bangladesh.'),
            'meta_keywords' => Setting::get('meta_keywords', 'classy missy, womens fashion, dresses, clothing, bangladesh ecommerce, boutique'),
            'meta_og_image' => Setting::get('meta_og_image', null),
            'facebook_pixel_id' => Setting::get('facebook_pixel_id', null),
            'facebook_pixel_code' => Setting::get('facebook_pixel_code', null),
            'google_analytics_id' => Setting::get('google_analytics_id', null),
            'google_analytics_code' => Setting::get('google_analytics_code', null),
        ]);
    }
}
