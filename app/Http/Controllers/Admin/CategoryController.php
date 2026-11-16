<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Category::withCount('products');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $categories = $query->orderBy('order')->paginate(10)->withQueryString();

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name'],
            'image' => ['nullable'],
            'image_file' => ['nullable', 'image', 'max:5120'],
            'description' => ['nullable', 'string', 'max:500'],
            'order' => ['nullable', 'integer'],
            'is_active' => ['boolean'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['order'] = $validated['order'] ?? (Category::max('order') + 1);

        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('categories', 'public');
            $validated['image'] = Storage::url($path);
        } elseif ($request->hasFile('image')) {
            $path = $request->file('image')->store('categories', 'public');
            $validated['image'] = Storage::url($path);
        } elseif ($request->has('image') && is_string($request->input('image'))) {
            $validated['image'] = trim($request->input('image')) ?: null;
        } else {
            $validated['image'] = null;
        }

        unset($validated['image_file']);

        Category::create($validated);

        return back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name,' . $category->id],
            'image' => ['nullable'],
            'image_file' => ['nullable', 'image', 'max:5120'],
            'description' => ['nullable', 'string', 'max:500'],
            'order' => ['nullable', 'integer'],
            'is_active' => ['boolean'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['is_active'] = $request->boolean('is_active', true);

        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('categories', 'public');
            $validated['image'] = Storage::url($path);
        } elseif ($request->hasFile('image')) {
            $path = $request->file('image')->store('categories', 'public');
            $validated['image'] = Storage::url($path);
        } elseif ($request->has('image') && is_string($request->input('image'))) {
            $validated['image'] = trim($request->input('image')) ?: null;
        }

        unset($validated['image_file']);

        $category->update($validated);

        return back()->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->products()->count() > 0) {
            return back()->with('error', 'Cannot delete category that contains products. Reassign or delete the products first.');
        }

        $category->delete();

        return back()->with('success', 'Category deleted successfully.');
    }
}
