<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Slider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SliderController extends Controller
{
    /**
     * Display a listing of home page sliders.
     */
    public function index(Request $request): Response
    {
        $query = Slider::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('subtitle', 'like', "%{$search}%")
                    ->orWhere('link', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $status = $request->input('status');
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $sliders = $query->orderBy('order', 'asc')->orderBy('id', 'asc')->paginate(15)->withQueryString();

        return Inertia::render('admin/sliders/index', [
            'sliders' => $sliders,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Store a newly created slider in database.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'badge_text' => ['nullable', 'string', 'max:100'],
            'button_text' => ['nullable', 'string', 'max:100'],
            'link' => ['nullable', 'string', 'max:500'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'image' => ['nullable'],
            'image_file' => ['nullable', 'image', 'max:10240'],
            'image_alt' => ['nullable', 'string', 'max:255'],
        ]);

        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['order'] = isset($validated['order']) ? (int) $validated['order'] : 0;
        $validated['link'] = !empty($validated['link']) ? $validated['link'] : '#';

        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('sliders', 'public');
            $validated['image'] = Storage::url($path);
        } elseif ($request->hasFile('image')) {
            $path = $request->file('image')->store('sliders', 'public');
            $validated['image'] = Storage::url($path);
        } elseif ($request->has('image') && is_string($request->input('image'))) {
            $validated['image'] = trim($request->input('image')) ?: '/storage/sliders/b1.jfif';
        } else {
            $validated['image'] = '/storage/sliders/b1.jfif';
        }

        $validated['image_alt'] = $validated['image_alt'] ?: ($validated['title'] ?: 'Home Banner Slide');

        unset($validated['image_file']);

        Slider::create($validated);

        return back()->with('success', 'Slide created successfully.');
    }

    /**
     * Update the specified slider in database.
     */
    public function update(Request $request, Slider $slider): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'badge_text' => ['nullable', 'string', 'max:100'],
            'button_text' => ['nullable', 'string', 'max:100'],
            'link' => ['nullable', 'string', 'max:500'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'image' => ['nullable'],
            'image_file' => ['nullable', 'image', 'max:10240'],
            'image_alt' => ['nullable', 'string', 'max:255'],
        ]);

        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['order'] = isset($validated['order']) ? (int) $validated['order'] : $slider->order;
        $validated['link'] = !empty($validated['link']) ? $validated['link'] : '#';

        if ($request->hasFile('image_file')) {
            // Delete old stored image if within sliders
            if ($slider->image && Str::startsWith($slider->image, '/storage/sliders/')) {
                $oldPath = str_replace('/storage/', '', $slider->image);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $path = $request->file('image_file')->store('sliders', 'public');
            $validated['image'] = Storage::url($path);
        } elseif ($request->hasFile('image')) {
            $path = $request->file('image')->store('sliders', 'public');
            $validated['image'] = Storage::url($path);
        } elseif ($request->has('image') && is_string($request->input('image')) && trim($request->input('image'))) {
            $validated['image'] = trim($request->input('image'));
        }

        $validated['image_alt'] = $validated['image_alt'] ?: ($validated['title'] ?: $slider->image_alt);

        unset($validated['image_file']);

        $slider->update($validated);

        return back()->with('success', 'Slide updated successfully.');
    }

    /**
     * Remove the specified slider from database.
     */
    public function destroy(Slider $slider): RedirectResponse
    {
        if ($slider->image && Str::startsWith($slider->image, '/storage/sliders/')) {
            $oldPath = str_replace('/storage/', '', $slider->image);
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        $slider->delete();

        return back()->with('success', 'Slide deleted successfully.');
    }
}
