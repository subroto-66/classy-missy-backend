<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get user dashboard statistics and recent activity.
     */
    public function overview(Request $request): JsonResponse
    {
        $user = $request->user() ?: auth('sanctum')->user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated',
            ], 401);
        }

        $user->load('customer');
        $customer = $user->customer ?: Customer::where('user_id', $user->id)->orWhere('email', $user->email)->first();

        $ordersQuery = Order::query()->where(function ($q) use ($customer, $user) {
            $q->where('customer_email', $user->email);
            if ($customer) {
                $q->orWhere('customer_id', $customer->id);
            }
        });

        $totalOrders = (clone $ordersQuery)->count();
        $totalSpent = (float) (clone $ordersQuery)->sum('total_amount');
        $reviewsCount = Review::where('user_id', $user->id)->orWhere('name', $user->name)->count();

        $recentOrders = (clone $ordersQuery)->with('items')->latest()->take(5)->get()->map(function ($order) {
            $itemCount = $order->items->count();
            $firstItem = $order->items->first();
            $productsSummary = $firstItem ? $firstItem->product_name : 'Products';
            if ($itemCount > 1) {
                $productsSummary .= ', +' . ($itemCount - 1);
            }

            return [
                'id' => $order->order_number,
                'order_number' => $order->order_number,
                'date' => $order->created_at?->format('M d, Y') ?? $order->placed_at?->format('M d, Y'),
                'products' => $productsSummary,
                'total' => (float) $order->total_amount,
                'status' => ucfirst($order->status),
                'payment_status' => ucfirst($order->payment_status),
                'items_count' => $itemCount,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone ?? $customer?->phone,
                    'avatar' => $user->avatar ?? $customer?->avatar,
                    'address' => $customer?->address,
                    'city' => $customer?->city,
                ],
                'stats' => [
                    'total_orders' => $totalOrders,
                    'total_spent' => $totalSpent,
                    'reviews_count' => $reviewsCount,
                ],
                'recent_orders' => $recentOrders,
            ],
        ]);
    }

    /**
     * Get transaction history for the user.
     */
    public function transactions(Request $request): JsonResponse
    {
        $user = $request->user() ?: auth('sanctum')->user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated',
            ], 401);
        }

        $customer = Customer::where('user_id', $user->id)->orWhere('email', $user->email)->first();

        $query = Order::query()->where(function ($q) use ($customer, $user) {
            $q->where('customer_email', $user->email);
            if ($customer) {
                $q->orWhere('customer_id', $customer->id);
            }
        })->latest();

        $transactions = $query->get()->map(function ($order) {
            $cleanNum = preg_replace('/[^0-9]/', '', $order->order_number);
            $txnId = 'TXN-' . ($cleanNum ?: $order->id);

            $methodDisplay = match ($order->payment_method) {
                'cash_on_delivery' => 'Cash on delivery',
                'bkash' => 'bKash •••• 0192',
                'nagad' => 'Nagad •••• 0183',
                'card' => 'Visa •••• 4242',
                default => ucfirst(str_replace('_', ' ', $order->payment_method)),
            };

            return [
                'id' => $txnId,
                'order_number' => $order->order_number,
                'date' => $order->created_at?->format('M d, Y') ?? $order->placed_at?->format('M d, Y'),
                'method' => $methodDisplay,
                'amount' => (float) $order->total_amount,
                'status' => ucfirst($order->payment_status ?: 'Paid'),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $transactions,
        ]);
    }
}
