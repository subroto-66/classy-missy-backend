<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Slider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SliderController extends Controller
{
    /**
     * Display a listing of active home page sliders.
     */
    public function index(Request $request): JsonResponse
    {
        $sliders = Slider::active()
            ->ordered()
            ->get()
            ->map(function (Slider $slider) {
                $imageUrl = $slider->image;
                if (!empty($imageUrl) && !Str::startsWith($imageUrl, ['http://', 'https://', '//', 'data:'])) {
                    $imageUrl = url($imageUrl);
                }

                return [
                    'id' => $slider->id,
                    'title' => $slider->title,
                    'subtitle' => $slider->subtitle,
                    'badge_text' => $slider->badge_text,
                    'button_text' => $slider->button_text,
                    'image' => $imageUrl,
                    'image_raw' => $slider->image,
                    'image_alt' => $slider->image_alt ?: ($slider->title ?: 'Classy Missy Fashion Slide'),
                    'alt' => $slider->image_alt ?: ($slider->title ?: 'Classy Missy Fashion Slide'),
                    'link' => $slider->link ?: '/',
                    'href' => $slider->link ?: '/',
                    'order' => (int) $slider->order,
                    'is_active' => (bool) $slider->is_active,
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $sliders,
        ]);
    }
}
