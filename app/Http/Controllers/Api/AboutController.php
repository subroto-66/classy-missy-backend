<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AboutPage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class AboutController extends Controller
{
    /**
     * Display the public About Page content.
     */
    public function show(): JsonResponse
    {
        $page = AboutPage::getPage();

        $resolveUrl = function (?string $path) {
            if (empty($path)) {
                return null;
            }
            if (Str::startsWith($path, ['http://', 'https://', '//', 'data:'])) {
                return $path;
            }
            return url($path);
        };

        return response()->json([
            'status' => 'success',
            'data' => [
                'banner' => [
                    'eyebrow' => $page->banner_eyebrow,
                    'title' => $page->banner_title,
                    'description' => $page->banner_description,
                    'image' => $resolveUrl($page->banner_image),
                    'image_raw' => $page->banner_image,
                    'alt' => $page->banner_alt ?: $page->banner_title,
                ],
                'approach' => [
                    'eyebrow' => $page->approach_eyebrow,
                    'title' => $page->approach_title,
                    'description' => $page->approach_description,
                    'paragraphs' => !empty($page->approach_description)
                        ? array_values(array_filter(array_map('trim', explode("\n\n", str_replace("\r\n", "\n", $page->approach_description)))))
                        : [],
                ],
                'routine' => [
                    'tag' => $page->routine_tag,
                    'title' => $page->routine_title,
                    'image' => $resolveUrl($page->routine_image),
                    'image_raw' => $page->routine_image,
                    'alt' => $page->routine_alt ?: $page->routine_title,
                ],
                'discovery' => [
                    'image1' => $resolveUrl($page->discovery_image_1),
                    'image1_raw' => $page->discovery_image_1,
                    'caption1' => $page->discovery_caption_1,
                    'image2' => $resolveUrl($page->discovery_image_2),
                    'image2_raw' => $page->discovery_image_2,
                    'caption2' => $page->discovery_caption_2,
                ],
                'values_section' => [
                    'eyebrow' => $page->values_eyebrow,
                    'title' => $page->values_title,
                    'values' => is_array($page->values) ? $page->values : [],
                ],
            ],
        ]);
    }
}
