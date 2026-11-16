<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Brand::withCount('products');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('website', 'like', "%{$search}%");
            });
        }

        $brands = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('admin/brands/index', [
            'brands' => $brands,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:brands,name'],
            'logo' => ['nullable'],
            'logo_file' => ['nullable', 'image', 'max:5120'],
            'description' => ['nullable', 'string', 'max:500'],
            'website' => ['nullable', 'url', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['is_active'] = $request->boolean('is_active', true);

        if ($request->hasFile('logo_file')) {
            $path = $request->file('logo_file')->store('brands', 'public');
            $validated['logo'] = Storage::url($path);
        } elseif ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('brands', 'public');
            $validated['logo'] = Storage::url($path);
        } elseif ($request->has('logo') && is_string($request->input('logo'))) {
            $validated['logo'] = trim($request->input('logo')) ?: null;
        } else {
            $validated['logo'] = null;
        }

        unset($validated['logo_file']);

        Brand::create($validated);

        return back()->with('success', 'Brand created successfully.');
    }

    public function update(Request $request, Brand $brand): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:brands,name,' . $brand->id],
            'logo' => ['nullable'],
            'logo_file' => ['nullable', 'image', 'max:5120'],
            'description' => ['nullable', 'string', 'max:500'],
            'website' => ['nullable', 'url', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['is_active'] = $request->boolean('is_active', true);

        if ($request->hasFile('logo_file')) {
            $path = $request->file('logo_file')->store('brands', 'public');
            $validated['logo'] = Storage::url($path);
        } elseif ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('brands', 'public');
            $validated['logo'] = Storage::url($path);
        } elseif ($request->has('logo') && is_string($request->input('logo'))) {
            $validated['logo'] = trim($request->input('logo')) ?: null;
        }

        unset($validated['logo_file']);

        $brand->update($validated);

        return back()->with('success', 'Brand updated successfully.');
    }

    public function destroy(Brand $brand): RedirectResponse
    {
        if ($brand->products()->count() > 0) {
            return back()->with('error', 'Cannot delete brand that has associated products.');
        }

        $brand->delete();

        return back()->with('success', 'Brand deleted successfully.');
    }
}
