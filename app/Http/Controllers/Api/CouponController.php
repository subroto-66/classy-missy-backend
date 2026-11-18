<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    /**
     * Display a listing of coupons.
     */
    public function index(): JsonResponse
    {
        $coupons = Coupon::where('is_active', true)->get()->map(function ($coupon) {
            return [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'offer' => $coupon->offer,
                'title' => $coupon->title,
                'details' => $coupon->details,
                'minimum' => 'Minimum purchase ৳' . number_format($coupon->minimum_amount, 0),
                'minimum_amount' => (float) $coupon->minimum_amount,
                'expiry' => $coupon->expiry_text ?? 'Valid while stocks last',
                'discount_type' => $coupon->discount_type,
                'discount_value' => (float) $coupon->discount_value,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $coupons,
        ]);
    }

    /**
     * Validate and apply a coupon to the cart.
     */
    public function apply(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', strtoupper(trim($request->code)))
            ->where('is_active', true)
            ->first();

        if (!$coupon) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid or expired coupon code.',
            ], 422);
        }

        $subtotal = (float) $request->subtotal;
        if ($subtotal < (float) $coupon->minimum_amount) {
            return response()->json([
                'status' => 'error',
                'message' => 'Minimum order amount for this coupon is ৳' . number_format($coupon->minimum_amount, 0),
            ], 422);
        }

        $discount = 0;
        if ($coupon->discount_type === 'percentage') {
            $discount = round(($subtotal * (float) $coupon->discount_value) / 100, 2);
        } elseif ($coupon->discount_type === 'fixed') {
            $discount = min($subtotal, (float) $coupon->discount_value);
        } elseif ($coupon->discount_type === 'free_shipping') {
            $discount = 0; // Handled as free shipping
        }

        return response()->json([
            'status' => 'success',
            'message' => "Coupon '{$coupon->code}' applied successfully!",
            'data' => [
                'code' => $coupon->code,
                'offer' => $coupon->offer,
                'discount' => $discount,
                'discount_type' => $coupon->discount_type,
                'discount_value' => (float) $coupon->discount_value,
                'free_shipping' => $coupon->discount_type === 'free_shipping',
            ],
        ]);
    }
}
