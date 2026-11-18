<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
            'is_active' => (bool) $this->is_active,
            'is_featured' => (bool) $this->is_featured,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
