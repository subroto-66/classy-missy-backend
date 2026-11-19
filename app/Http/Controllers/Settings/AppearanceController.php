<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AppearanceController extends Controller
{
    /**
     * Show the appearance, branding, theme, SEO, and tracking settings.
     */
    public function edit(): Response
    {
        return Inertia::render('settings/appearance', [
            'branding' => [
                'logo' => Setting::get('admin_logo', '/logo.svg'),
                'logo_dark' => Setting::get('admin_logo_dark', null),
                'title' => Setting::get('admin_title', 'Classy Missy'),
                'subtitle' => Setting::get('admin_subtitle', 'Admin Panel'),
            ],
            'storefront' => [
                'frontend_logo' => Setting::get('frontend_logo', '/logo.svg'),
                'frontend_logo_dark' => Setting::get('frontend_logo_dark', null),
                'favicon' => Setting::get('favicon', '/favicon.svg'),
                'site_title' => Setting::get('site_title', 'Classy Missy'),
                'site_tagline' => Setting::get('site_tagline', "Women's Fashion & Lifestyle"),
                'primary_color' => Setting::get('primary_color', '#171717'),
            ],
            'seo' => [
                'meta_title' => Setting::get('meta_title', 'Classy Missy - Trendy Women\'s Fashion & Online Boutique'),
                'meta_description' => Setting::get('meta_description', 'Discover chic and trendy women\'s fashion, luxury clothing, and premium dresses at Classy Missy. Exclusive collection with fast delivery across Bangladesh.'),
                'meta_keywords' => Setting::get('meta_keywords', 'classy missy, womens fashion, dresses, clothing, bangladesh ecommerce, boutique'),
                'meta_og_image' => Setting::get('meta_og_image', null),
            ],
            'tracking' => [
                'facebook_pixel_id' => Setting::get('facebook_pixel_id', ''),
                'facebook_pixel_code' => Setting::get('facebook_pixel_code', ''),
                'google_analytics_id' => Setting::get('google_analytics_id', ''),
                'google_analytics_code' => Setting::get('google_analytics_code', ''),
            ],
        ]);
    }

    /**
     * Update admin branding, light & dark logo.
     */
    public function update(Request $request): RedirectResponse
    {
        $action = $request->input('action');

        if ($action === 'reset_admin_light') {
            Setting::set('admin_logo', '/logo.svg');
            return back()->with('success', 'Admin light logo reset to default.');
        }

        if ($action === 'reset_admin_dark') {
            Setting::set('admin_logo_dark', null);
            return back()->with('success', 'Admin dark logo reset to auto.');
        }

        if ($action === 'reset') {
            Setting::set('admin_logo', '/logo.svg');
            Setting::set('admin_logo_dark', null);
            Setting::set('admin_title', 'Classy Missy');
            Setting::set('admin_subtitle', 'Admin Panel');

            return back()->with('success', 'Admin branding reset to default logo.');
        }

        $request->validate([
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:3072',
            'logo_dark' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:3072',
            'title' => 'nullable|string|max:100',
            'subtitle' => 'nullable|string|max:100',
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('branding', 'public');
            Setting::set('admin_logo', '/storage/' . $path);
        }

        if ($request->hasFile('logo_dark')) {
            $path = $request->file('logo_dark')->store('branding', 'public');
            Setting::set('admin_logo_dark', '/storage/' . $path);
        }

        if ($request->has('title') && $request->title !== null) {
            Setting::set('admin_title', trim($request->input('title')));
        }

        if ($request->has('subtitle') && $request->subtitle !== null) {
            Setting::set('admin_subtitle', trim($request->input('subtitle')));
        }

        return back()->with('success', 'Admin logo and branding updated successfully!');
    }

    /**
     * Update storefront light & dark logos, favicon, and titles.
     */
    public function updateStorefront(Request $request): RedirectResponse
    {
        $action = $request->input('action');

        if ($action === 'reset_logo_light' || $action === 'reset_logo') {
            Setting::set('frontend_logo', '/logo.svg');
            return back()->with('success', 'Storefront light logo reset to default.');
        }

        if ($action === 'reset_logo_dark') {
            Setting::set('frontend_logo_dark', null);
            return back()->with('success', 'Storefront dark logo reset.');
        }

        if ($action === 'reset_favicon') {
            Setting::set('favicon', '/favicon.svg');
            return back()->with('success', 'Browser favicon reset to default.');
        }

        $request->validate([
            'frontend_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:3072',
            'frontend_logo_dark' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:3072',
            'favicon' => 'nullable|file|mimes:ico,png,svg,jpg,jpeg,webp|max:2048',
            'site_title' => 'nullable|string|max:100',
            'site_tagline' => 'nullable|string|max:150',
        ]);

        if ($request->hasFile('frontend_logo')) {
            $path = $request->file('frontend_logo')->store('branding', 'public');
            Setting::set('frontend_logo', '/storage/' . $path);
        }

        if ($request->hasFile('frontend_logo_dark')) {
            $path = $request->file('frontend_logo_dark')->store('branding', 'public');
            Setting::set('frontend_logo_dark', '/storage/' . $path);
        }

        if ($request->hasFile('favicon')) {
            $path = $request->file('favicon')->store('branding', 'public');
            Setting::set('favicon', '/storage/' . $path);
        }

        if ($request->has('site_title') && $request->site_title !== null) {
            Setting::set('site_title', trim($request->input('site_title')));
        }

        if ($request->has('site_tagline') && $request->site_tagline !== null) {
            Setting::set('site_tagline', trim($request->input('site_tagline')));
        }

        return back()->with('success', 'Storefront logos and branding updated successfully!');
    }

    /**
     * Update storefront primary color theme.
     */
    public function updateTheme(Request $request): RedirectResponse
    {
        if ($request->input('action') === 'reset') {
            Setting::set('primary_color', '#171717');
            return back()->with('success', 'Storefront theme color reset to default #171717.');
        }

        $request->validate([
            'primary_color' => ['required', 'regex:/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/i'],
        ]);

        Setting::set('primary_color', $request->input('primary_color'));

        return back()->with('success', 'Storefront theme color updated successfully!');
    }

    /**
     * Update SEO and Meta information.
     */
    public function updateSeo(Request $request): RedirectResponse
    {
        if ($request->input('action') === 'reset') {
            Setting::set('meta_title', 'Classy Missy - Trendy Women\'s Fashion & Online Boutique');
            Setting::set('meta_description', 'Discover chic and trendy women\'s fashion, luxury clothing, and premium dresses at Classy Missy. Exclusive collection with fast delivery across Bangladesh.');
            Setting::set('meta_keywords', 'classy missy, womens fashion, dresses, clothing, bangladesh ecommerce, boutique');
            Setting::set('meta_og_image', null);
            return back()->with('success', 'SEO meta data reset to default.');
        }

        $request->validate([
            'meta_title' => 'nullable|string|max:150',
            'meta_description' => 'nullable|string|max:300',
            'meta_keywords' => 'nullable|string|max:300',
            'meta_og_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        if ($request->hasFile('meta_og_image')) {
            $path = $request->file('meta_og_image')->store('branding', 'public');
            Setting::set('meta_og_image', '/storage/' . $path);
        }

        if ($request->has('meta_title')) {
            Setting::set('meta_title', trim((string) $request->input('meta_title')));
        }

        if ($request->has('meta_description')) {
            Setting::set('meta_description', trim((string) $request->input('meta_description')));
        }

        if ($request->has('meta_keywords')) {
            Setting::set('meta_keywords', trim((string) $request->input('meta_keywords')));
        }

        return back()->with('success', 'SEO and Meta tags updated successfully!');
    }

    /**
     * Update Facebook Pixel and Google Analytics tracking codes.
     */
    public function updateTracking(Request $request): RedirectResponse
    {
        $request->validate([
            'facebook_pixel_id' => 'nullable|string|max:100',
            'facebook_pixel_code' => 'nullable|string|max:5000',
            'google_analytics_id' => 'nullable|string|max:100',
            'google_analytics_code' => 'nullable|string|max:5000',
        ]);

        Setting::set('facebook_pixel_id', trim((string) $request->input('facebook_pixel_id', '')));
        Setting::set('facebook_pixel_code', trim((string) $request->input('facebook_pixel_code', '')));
        Setting::set('google_analytics_id', trim((string) $request->input('google_analytics_id', '')));
        Setting::set('google_analytics_code', trim((string) $request->input('google_analytics_code', '')));

        return back()->with('success', 'Tracking codes (Facebook Pixel & Google Analytics) saved successfully!');
    }
}
