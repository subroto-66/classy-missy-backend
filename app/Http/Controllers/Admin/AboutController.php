<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AboutPage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    /**
     * Display the About page editor in Admin dashboard.
     */
    public function index(): Response
    {
        $about = AboutPage::getPage();

        return Inertia::render('admin/about/index', [
            'about' => $about,
        ]);
    }

    /**
     * Update the About page content.
     */
    public function update(Request $request): RedirectResponse
    {
        $about = AboutPage::getPage();

        $validated = $request->validate([
            'banner_eyebrow' => ['nullable', 'string', 'max:255'],
            'banner_title' => ['required', 'string', 'max:255'],
            'banner_description' => ['nullable', 'string'],
            'banner_image' => ['nullable', 'string'],
            'banner_image_file' => ['nullable', 'image', 'max:10240'],
            'banner_alt' => ['nullable', 'string', 'max:255'],

            'approach_eyebrow' => ['nullable', 'string', 'max:255'],
            'approach_title' => ['nullable', 'string', 'max:255'],
            'approach_description' => ['nullable', 'string'],

            'routine_tag' => ['nullable', 'string', 'max:255'],
            'routine_title' => ['nullable', 'string', 'max:255'],
            'routine_image' => ['nullable', 'string'],
            'routine_image_file' => ['nullable', 'image', 'max:10240'],
            'routine_alt' => ['nullable', 'string', 'max:255'],

            'discovery_image_1' => ['nullable', 'string'],
            'discovery_image_1_file' => ['nullable', 'image', 'max:10240'],
            'discovery_caption_1' => ['nullable', 'string', 'max:255'],

            'discovery_image_2' => ['nullable', 'string'],
            'discovery_image_2_file' => ['nullable', 'image', 'max:10240'],
            'discovery_caption_2' => ['nullable', 'string', 'max:255'],

            'values_eyebrow' => ['nullable', 'string', 'max:255'],
            'values_title' => ['nullable', 'string', 'max:255'],
            'values' => ['nullable', 'array'],
        ]);

        // Banner Image
        if ($request->hasFile('banner_image_file')) {
            $path = $request->file('banner_image_file')->store('about', 'public');
            $validated['banner_image'] = Storage::url($path);
        }

        // Routine Image
        if ($request->hasFile('routine_image_file')) {
            $path = $request->file('routine_image_file')->store('about', 'public');
            $validated['routine_image'] = Storage::url($path);
        }

        // Discovery Image 1
        if ($request->hasFile('discovery_image_1_file')) {
            $path = $request->file('discovery_image_1_file')->store('about', 'public');
            $validated['discovery_image_1'] = Storage::url($path);
        }

        // Discovery Image 2
        if ($request->hasFile('discovery_image_2_file')) {
            $path = $request->file('discovery_image_2_file')->store('about', 'public');
            $validated['discovery_image_2'] = Storage::url($path);
        }

        unset(
            $validated['banner_image_file'],
            $validated['routine_image_file'],
            $validated['discovery_image_1_file'],
            $validated['discovery_image_2_file']
        );

        $about->update($validated);

        return back()->with('success', 'About page content updated successfully.');
    }
}
