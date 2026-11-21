<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LandingPage;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageController extends Controller
{
    /**
     * Display a listing of landing pages.
     */
    public function index(Request $request): Response
    {
        $query = LandingPage::with('product')->latest();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('headline', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('is_active', $request->input('status') === 'active');
        }

        $landingPages = $query->paginate(10)->withQueryString();
        $products = Product::select('id', 'name', 'slug', 'price', 'old_price', 'image')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/landing-pages/index', [
            'landingPages' => $landingPages,
            'products' => $products,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Store a newly created landing page.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'nullable|exists:products,id',
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:landing_pages,slug',
            'badge' => 'nullable|string|max:100',
            'hotline' => 'nullable|string|max:50',
            'whatsapp' => 'nullable|string|max:50',
            'announcement_text' => 'nullable|string|max:500',
            'countdown_enabled' => 'boolean',
            'countdown_hours' => 'nullable|integer|min:1|max:72',
            'headline' => 'nullable|string|max:255',
            'subheadline' => 'nullable|string|max:500',
            'hero_description' => 'nullable|string',
            'video_url' => 'nullable|string|max:255',
            'banner_image' => 'nullable|string',
            'banner_image_file' => 'nullable|image|max:10240',
            'gallery_images' => 'nullable|array',
            'packages' => 'nullable|array',
            'delivery_inside_dhaka' => 'nullable|numeric|min:0',
            'delivery_outside_dhaka' => 'nullable|numeric|min:0',
            'features' => 'nullable|array',
            'benefits' => 'nullable|array',
            'steps' => 'nullable|array',
            'reviews' => 'nullable|array',
            'faqs' => 'nullable|array',
            'guarantee_text' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'is_default_for_product' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
        ]);

        if (empty($validated['slug'])) {
            $baseSlug = Str::slug($validated['title']);
            $slug = $baseSlug;
            $counter = 1;
            while (LandingPage::where('slug', $slug)->exists()) {
                $slug = "{$baseSlug}-{$counter}";
                $counter++;
            }
            $validated['slug'] = $slug;
        } else {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        // Handle Banner image upload
        if ($request->hasFile('banner_image_file')) {
            $path = $request->file('banner_image_file')->store('landing', 'public');
            $validated['banner_image'] = Storage::url($path);
        }

        unset($validated['banner_image_file']);

        LandingPage::create($validated);

        return back()->with('success', 'Landing page created successfully.');
    }

    /**
     * Update the specified landing page.
     */
    public function update(Request $request, LandingPage $landingPage): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'nullable|exists:products,id',
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:landing_pages,slug,' . $landingPage->id,
            'badge' => 'nullable|string|max:100',
            'hotline' => 'nullable|string|max:50',
            'whatsapp' => 'nullable|string|max:50',
            'announcement_text' => 'nullable|string|max:500',
            'countdown_enabled' => 'boolean',
            'countdown_hours' => 'nullable|integer|min:1|max:72',
            'headline' => 'nullable|string|max:255',
            'subheadline' => 'nullable|string|max:500',
            'hero_description' => 'nullable|string',
            'video_url' => 'nullable|string|max:255',
            'banner_image' => 'nullable|string',
            'banner_image_file' => 'nullable|image|max:10240',
            'gallery_images' => 'nullable|array',
            'packages' => 'nullable|array',
            'delivery_inside_dhaka' => 'nullable|numeric|min:0',
            'delivery_outside_dhaka' => 'nullable|numeric|min:0',
            'features' => 'nullable|array',
            'benefits' => 'nullable|array',
            'steps' => 'nullable|array',
            'reviews' => 'nullable|array',
            'faqs' => 'nullable|array',
            'guarantee_text' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'is_default_for_product' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['slug']);

        if ($request->hasFile('banner_image_file')) {
            $path = $request->file('banner_image_file')->store('landing', 'public');
            $validated['banner_image'] = Storage::url($path);
        }

        unset($validated['banner_image_file']);

        $landingPage->update($validated);

        return back()->with('success', 'Landing page updated successfully.');
    }

    /**
     * Remove the specified landing page.
     */
    public function destroy(LandingPage $landingPage): RedirectResponse
    {
        $landingPage->delete();

        return back()->with('success', 'Landing page deleted successfully.');
    }
}
