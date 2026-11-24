<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::with(['brand', 'category']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->input('brand_id'));
        }

        if ($request->input('stock') === 'low') {
            $query->whereColumn('stock_quantity', '<=', 'low_stock_threshold');
        } elseif ($request->input('stock') === 'out') {
            $query->where('stock_quantity', '<=', 0);
        }

        $products = $query->latest()->paginate(10)->withQueryString();
        $categories = Category::select(['id', 'name'])->get();
        $brands = Brand::select(['id', 'name'])->get();

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'categories' => $categories,
            'brands' => $brands,
            'filters' => $request->only(['search', 'category_id', 'brand_id', 'stock']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'sku' => ['nullable', 'string', 'max:50', 'unique:products,sku'],
            'price' => ['required', 'numeric', 'min:0'],
            'old_price' => ['nullable', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
            'badge' => ['nullable', 'string', 'max:50'],
            'image' => ['nullable'],
            'image_file' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,gif,svg', 'max:5120'],
            'gallery' => ['nullable', 'array'],
            'gallery_files' => ['nullable', 'array'],
            'gallery_files.*' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,gif,svg', 'max:5120'],
            'existing_gallery' => ['nullable', 'array'],
            'description' => ['nullable', 'string'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'meta_keywords' => ['nullable', 'string', 'max:500'],
            'problems' => ['nullable', 'array'],
            'highlights' => ['nullable'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        if (empty($validated['sku'])) {
            $validated['sku'] = 'SKU-' . strtoupper(Str::random(6));
        }

        // Handle Thumbnail: uploaded file has highest priority
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('products', 'public');
            $validated['image'] = Storage::url($path);
        } elseif ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = Storage::url($path);
        } elseif (is_string($request->input('image')) && !empty(trim($request->input('image')))) {
            $validated['image'] = trim($request->input('image'));
        } else {
            $validated['image'] = null;
        }

        // Handle Gallery: merge existing URLs + newly uploaded files
        $gallery = [];
        if ($request->has('existing_gallery')) {
            $existing = (array) $request->input('existing_gallery', []);
            $gallery = array_values(array_filter($existing, fn($u) => !empty(trim((string) $u))));
        } elseif ($request->has('gallery') && is_array($request->input('gallery'))) {
            $existing = (array) $request->input('gallery', []);
            $gallery = array_values(array_filter($existing, fn($u) => is_string($u) && !empty(trim($u))));
        }

        if ($request->hasFile('gallery_files')) {
            foreach ($request->file('gallery_files') as $file) {
                if ($file && $file->isValid()) {
                    $path = $file->store('products/gallery', 'public');
                    $gallery[] = Storage::url($path);
                }
            }
        } elseif ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $file) {
                if ($file && $file->isValid()) {
                    $path = $file->store('products/gallery', 'public');
                    $gallery[] = Storage::url($path);
                }
            }
        }

        $validated['gallery'] = $gallery;
        unset($validated['image_file'], $validated['gallery_files'], $validated['existing_gallery']);

        if ($request->has('highlights')) {
            $rawHighlights = $request->input('highlights');
            if (is_string($rawHighlights)) {
                $rawHighlights = json_decode($rawHighlights, true) ?? [];
            }
            if (is_array($rawHighlights)) {
                $validated['highlights'] = array_values(array_filter($rawHighlights, function ($h) {
                    return is_array($h) && (!empty(trim((string) ($h['title'] ?? ''))) || !empty(trim((string) ($h['image'] ?? ''))));
                }));
            } else {
                $validated['highlights'] = [];
            }
        }

        Product::create($validated);

        return back()->with('success', 'Product created successfully.');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'sku' => ['required', 'string', 'max:50', 'unique:products,sku,' . $product->id],
            'price' => ['required', 'numeric', 'min:0'],
            'old_price' => ['nullable', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
            'badge' => ['nullable', 'string', 'max:50'],
            'image' => ['nullable'],
            'image_file' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,gif,svg', 'max:5120'],
            'gallery' => ['nullable', 'array'],
            'gallery_files' => ['nullable', 'array'],
            'gallery_files.*' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,gif,svg', 'max:5120'],
            'existing_gallery' => ['nullable', 'array'],
            'description' => ['nullable', 'string'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'meta_keywords' => ['nullable', 'string', 'max:500'],
            'problems' => ['nullable', 'array'],
            'highlights' => ['nullable'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
        ]);

        // Handle Thumbnail
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('products', 'public');
            $validated['image'] = Storage::url($path);
        } elseif ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = Storage::url($path);
        } elseif ($request->has('image') && is_string($request->input('image'))) {
            $validated['image'] = $request->input('image');
        } elseif ($request->boolean('remove_image')) {
            $validated['image'] = null;
        }

        // Handle Gallery: merge preserved existing URLs + newly uploaded files
        $gallery = [];
        if ($request->has('existing_gallery')) {
            $existing = (array) $request->input('existing_gallery', []);
            $gallery = array_values(array_filter($existing, fn($u) => !empty(trim((string) $u))));
        }

        if ($request->hasFile('gallery_files')) {
            foreach ($request->file('gallery_files') as $file) {
                if ($file && $file->isValid()) {
                    $path = $file->store('products/gallery', 'public');
                    $gallery[] = Storage::url($path);
                }
            }
        } elseif ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $file) {
                if ($file && $file->isValid()) {
                    $path = $file->store('products/gallery', 'public');
                    $gallery[] = Storage::url($path);
                }
            }
        }

        if ($request->has('existing_gallery') || $request->hasFile('gallery_files') || $request->hasFile('gallery')) {
            $validated['gallery'] = $gallery;
        }

        unset($validated['image_file'], $validated['gallery_files'], $validated['existing_gallery']);

        if ($request->has('highlights')) {
            $rawHighlights = $request->input('highlights');
            if (is_string($rawHighlights)) {
                $rawHighlights = json_decode($rawHighlights, true) ?? [];
            }
            if (is_array($rawHighlights)) {
                $validated['highlights'] = array_values(array_filter($rawHighlights, function ($h) {
                    return is_array($h) && (!empty(trim((string) ($h['title'] ?? ''))) || !empty(trim((string) ($h['image'] ?? ''))));
                }));
            } else {
                $validated['highlights'] = [];
            }
        }

        $product->update($validated);

        return back()->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return back()->with('success', 'Product deleted successfully.');
    }
}
