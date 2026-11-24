<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $gallery = is_array($this->gallery) ? $this->gallery : [];
        if (empty($gallery) && !empty($this->image)) {
            $gallery = [$this->image];
        }

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'brand' => $this->brand ? $this->brand->name : ($this->brand_name ?? ''),
            'brand_id' => $this->brand_id,
            'brand_slug' => $this->brand ? $this->brand->slug : null,
            'category' => $this->category ? $this->category->name : ($this->category_name ?? ''),
            'category_id' => $this->category_id,
            'category_slug' => $this->category ? $this->category->slug : null,
            'sku' => $this->sku,
            'price' => (float) $this->price,
            'oldPrice' => $this->old_price ? (float) $this->old_price : null,
            'old_price' => $this->old_price ? (float) $this->old_price : null,
            'stock_quantity' => (int) $this->stock_quantity,
            'rating' => (float) $this->rating,
            'reviews' => (int) ($this->reviews_count ?? ($this->reviews ? $this->reviews->count() : 0)),
            'reviews_count' => (int) ($this->reviews_count ?? ($this->reviews ? $this->reviews->count() : 0)),
            'badge' => $this->badge,
            'problems' => is_array($this->problems) ? $this->problems : [],
            'highlights' => is_array($this->highlights) ? $this->highlights : [],
            'image' => $this->image,
            'images' => $gallery,
            'gallery' => $gallery,
            'description' => $this->description,
            'meta_title' => $this->meta_title ?: "{$this->name} | Classy Missy",
            'meta_description' => $this->meta_description ?: Str::limit(strip_tags((string) ($this->description ?: "Buy {$this->name} online from Classy Missy. 100% authentic with fast home delivery in Bangladesh.")), 160),
            'meta_keywords' => $this->meta_keywords ?: implode(', ', array_filter([$this->name, $this->brand ? (is_object($this->brand) ? $this->brand->name : $this->brand) : null, $this->category ? (is_object($this->category) ? $this->category->name : $this->category) : null, 'beauty', 'skincare', 'Classy Missy'])),
            'meta_og_image' => $this->image,
            'is_active' => (bool) $this->is_active,
            'is_featured' => (bool) $this->is_featured,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
