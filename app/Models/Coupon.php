<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'offer',
        'title',
        'details',
        'minimum_amount',
        'discount_type',
        'discount_value',
        'expiry_text',
        'expires_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'minimum_amount' => 'decimal:2',
            'discount_value' => 'decimal:2',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }
}
