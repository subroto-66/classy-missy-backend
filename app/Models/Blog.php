<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Blog extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'category',
        'published_at',
        'read_time',
        'image',
        'image_alt',
        'excerpt',
        'intro',
        'content',
        'sections',
        'key_takeaways',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'date:Y-m-d',
            'content' => 'array',
            'sections' => 'array',
            'key_takeaways' => 'array',
            'is_published' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function ($blog) {
            if (empty($blog->slug)) {
                $blog->slug = Str::slug($blog->title);
            }
        });
    }
}
