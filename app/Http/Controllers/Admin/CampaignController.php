<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CampaignController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Campaign::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('eyebrow', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $campaigns = $query->latest()->paginate(10)->withQueryString();
        $products = Product::select(['id', 'slug', 'name'])->get();

        return Inertia::render('admin/campaigns/index', [
            'campaigns' => $campaigns,
            'products' => $products,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'eyebrow' => ['nullable', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:500'],
            'image' => ['nullable'],
            'image_file' => ['nullable', 'image', 'max:5120'],
            'product_ids' => ['nullable', 'array'],
            'discount_percentage' => ['nullable', 'integer', 'min:0', 'max:100'],
            'is_active' => ['boolean'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        $validated['slug'] = Str::slug($validated['title']);
        $validated['is_active'] = $request->boolean('is_active', true);

        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('campaigns', 'public');
            $validated['image'] = Storage::url($path);
        } elseif ($request->hasFile('image')) {
            $path = $request->file('image')->store('campaigns', 'public');
            $validated['image'] = Storage::url($path);
        } elseif ($request->has('image') && is_string($request->input('image'))) {
            $validated['image'] = trim($request->input('image')) ?: null;
        } else {
            $validated['image'] = null;
        }

        unset($validated['image_file']);

        Campaign::create($validated);

        return back()->with('success', 'Campaign created successfully.');
    }

    public function update(Request $request, Campaign $campaign): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'eyebrow' => ['nullable', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:500'],
            'image' => ['nullable'],
            'image_file' => ['nullable', 'image', 'max:5120'],
            'product_ids' => ['nullable', 'array'],
            'discount_percentage' => ['nullable', 'integer', 'min:0', 'max:100'],
            'is_active' => ['boolean'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        $validated['slug'] = Str::slug($validated['title']);
        $validated['is_active'] = $request->boolean('is_active', true);

        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('campaigns', 'public');
            $validated['image'] = Storage::url($path);
        } elseif ($request->hasFile('image')) {
            $path = $request->file('image')->store('campaigns', 'public');
            $validated['image'] = Storage::url($path);
        } elseif ($request->has('image') && is_string($request->input('image'))) {
            $validated['image'] = trim($request->input('image')) ?: null;
        }

        unset($validated['image_file']);

        $campaign->update($validated);

        return back()->with('success', 'Campaign updated successfully.');
    }

    public function destroy(Campaign $campaign): RedirectResponse
    {
        $campaign->delete();

        return back()->with('success', 'Campaign deleted successfully.');
    }
}
