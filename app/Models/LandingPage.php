<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LandingPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'title',
        'slug',
        'badge',
        'hotline',
        'whatsapp',
        'announcement_text',
        'countdown_enabled',
        'countdown_hours',
        'headline',
        'subheadline',
        'description',
        'hero_description',
        'video_url',
        'banner_image',
        'gallery_images',
        'packages',
        'delivery_inside_dhaka',
        'delivery_outside_dhaka',
        'features',
        'benefits',
        'steps',
        'reviews',
        'faqs',
        'guarantee_text',
        'is_active',
        'is_default_for_product',
        'order',
        'meta_title',
        'meta_description',
    ];

    protected function casts(): array
    {
        return [
            'countdown_enabled' => 'boolean',
            'countdown_hours' => 'integer',
            'gallery_images' => 'array',
            'packages' => 'array',
            'features' => 'array',
            'benefits' => 'array',
            'steps' => 'array',
            'reviews' => 'array',
            'faqs' => 'array',
            'delivery_inside_dhaka' => 'decimal:2',
            'delivery_outside_dhaka' => 'decimal:2',
            'is_active' => 'boolean',
            'is_default_for_product' => 'boolean',
            'order' => 'integer',
        ];
    }

    /**
     * Get the associated product.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
