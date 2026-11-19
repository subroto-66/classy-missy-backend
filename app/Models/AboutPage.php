<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AboutPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'banner_eyebrow',
        'banner_title',
        'banner_description',
        'banner_image',
        'banner_alt',
        'approach_eyebrow',
        'approach_title',
        'approach_description',
        'routine_tag',
        'routine_title',
        'routine_image',
        'routine_alt',
        'discovery_image_1',
        'discovery_caption_1',
        'discovery_image_2',
        'discovery_caption_2',
        'values_eyebrow',
        'values_title',
        'values',
    ];

    protected function casts(): array
    {
        return [
            'values' => 'array',
        ];
    }

    /**
     * Get or create the single about page row.
     */
    public static function getPage(): self
    {
        return static::first() ?? static::create([
            'banner_title' => 'About Classy Missy',
        ]);
    }
}
