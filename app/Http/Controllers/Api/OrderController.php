<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Display a listing of orders for the user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user() ?: auth('sanctum')->user();
        $email = $request->input('email', $user?->email);

        $query = Order::with('items')->latest();

        if ($user) {
            $query->where(function ($q) use ($user) {
                $q->whereHas('customer', function ($cq) use ($user) {
                    $cq->where('user_id', $user->id);
                })
                ->orWhere('customer_email', $user->email);
            });
        } elseif ($email) {
            $query->where('customer_email', strtolower(trim($email)));
        } else {
            // For guests without email param, return empty list
            return response()->json([
                'status' => 'success',
                'data' => [],
            ]);
        }

        $orders = $query->get()->map(function ($order) {
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
                'payment_method' => $order->payment_method,
                'items' => $order->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product_id,
                        'name' => $item->product_name,
                        'image' => $item->product_image,
                        'price' => (float) $item->price,
                        'quantity' => $item->quantity,
                        'total' => (float) $item->total,
                    ];
                }),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $orders,
        ]);
    }

    /**
     * Store a newly created order (checkout).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'customer_name' => 'required|string|max:150',
            'customer_email' => 'required|email|max:150',
            'customer_phone' => 'nullable|string|max:30',
            'shipping_address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'payment_method' => 'nullable|string',
            'items' => 'required|array|min:1',
            'notes' => 'nullable|string|max:500',
            'discount' => 'nullable|numeric|min:0',
            'shipping_fee' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request) {
            $user = $request->user() ?: auth('sanctum')->user();

            $customerEmail = strtolower(trim($request->customer_email));
            $customerName = trim($request->customer_name);
            $customerPhone = trim($request->customer_phone ?: ($user?->phone ?: '01700000000'));
            $shippingAddress = trim($request->shipping_address ?: 'Standard Delivery, Dhaka');
            $city = trim($request->input('city', 'Dhaka') ?: 'Dhaka');
            $postalCode = $request->postal_code;

            // Find or create customer
            $customer = Customer::where('email', $customerEmail)->first();
            if (!$customer && $user) {
                $customer = Customer::where('user_id', $user->id)->first();
            }

            if (!$customer) {
                $customer = Customer::create([
                    'name' => $customerName,
                    'email' => $customerEmail,
                    'phone' => $customerPhone,
                    'address' => $shippingAddress,
                    'city' => $city,
                    'postal_code' => $postalCode,
                    'user_id' => $user?->id,
                    'status' => 'active',
                ]);
            } else {
                $customer->update([
                    'name' => $customerName,
                    'phone' => $customerPhone ?: $customer->phone,
                    'address' => $shippingAddress ?: $customer->address,
                    'city' => $city ?: $customer->city,
                    'user_id' => $user ? $user->id : $customer->user_id,
                ]);
            }

            // Generate unique order number
            $orderNumber = 'CM-' . mt_rand(10000, 99999);
            while (Order::where('order_number', $orderNumber)->exists()) {
                $orderNumber = 'CM-' . mt_rand(10000, 99999);
            }

            $subtotal = 0;
            $itemsData = [];

            foreach ($request->items as $item) {
                $productId = $item['id'] ?? $item['product_id'] ?? null;
                $product = null;
                if ($productId) {
                    if (is_numeric($productId)) {
                        $product = Product::find($productId);
                    }
                    if (!$product) {
                        $product = Product::where('slug', $productId)->first();
                    }
                }

                $price = isset($item['price']) && is_numeric($item['price'])
                    ? (float) $item['price']
                    : ($product ? (float) $product->price : 0);
                $qty = max(1, (int) ($item['quantity'] ?? 1));
                $itemTotal = $price * $qty;
                $subtotal += $itemTotal;

                $itemsData[] = [
                    'product_id' => $product?->id,
                    'product_name' => $product?->name ?? ($item['name'] ?? 'Product'),
                    'product_image' => $product?->image ?? ($item['image'] ?? null),
                    'price' => $price,
                    'quantity' => $qty,
                    'total' => $itemTotal,
                ];

                // Decrement stock if product exists
                if ($product && $product->stock_quantity >= $qty) {
                    $product->decrement('stock_quantity', $qty);
                }
            }

            $discount = (float) $request->input('discount', 0);
            $shippingFee = (float) $request->input('shipping_fee', 0);
            $totalAmount = max(0, $subtotal - $discount + $shippingFee);

            $order = Order::create([
                'order_number' => $orderNumber,
                'customer_id' => $customer->id,
                'customer_name' => $customerName,
                'customer_email' => $customerEmail,
                'customer_phone' => $customerPhone,
                'shipping_address' => $shippingAddress,
                'city' => $city,
                'postal_code' => $postalCode,
                'country' => 'Bangladesh',
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'payment_method' => $request->input('payment_method', 'cash_on_delivery'),
                'subtotal' => $subtotal,
                'shipping_fee' => $shippingFee,
                'discount' => $discount,
                'total_amount' => $totalAmount,
                'notes' => $request->notes,
                'placed_at' => now(),
            ]);

            foreach ($itemsData as $iData) {
                $iData['order_id'] = $order->id;
                OrderItem::create($iData);
            }

            // Update customer totals
            $customer->increment('total_orders');
            $customer->increment('total_spent', $totalAmount);

            $order->load('items');

            return response()->json([
                'status' => 'success',
                'message' => 'Thank you! Your order has been placed successfully.',
                'data' => [
                    'id' => $order->order_number,
                    'order_number' => $order->order_number,
                    'date' => $order->created_at->format('M d, Y'),
                    'subtotal' => (float) $order->subtotal,
                    'discount' => (float) $order->discount,
                    'shipping_fee' => (float) $order->shipping_fee,
                    'total' => (float) $order->total_amount,
                    'status' => ucfirst($order->status),
                    'payment_method' => $order->payment_method,
                    'items' => $order->items,
                ],
            ], 201);
        });
    }

    /**
     * Display the specified order.
     */
    public function show(string $orderNumberOrId): JsonResponse
    {
        $order = Order::with('items')
            ->where('order_number', $orderNumberOrId)
            ->orWhere('id', $orderNumberOrId)
            ->first();

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order not found.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $order->order_number,
                'order_number' => $order->order_number,
                'date' => $order->created_at->format('M d, Y'),
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'customer_phone' => $order->customer_phone,
                'shipping_address' => $order->shipping_address,
                'city' => $order->city,
                'subtotal' => (float) $order->subtotal,
                'discount' => (float) $order->discount,
                'shipping_fee' => (float) $order->shipping_fee,
                'total' => (float) $order->total_amount,
                'status' => ucfirst($order->status),
                'payment_status' => ucfirst($order->payment_status),
                'payment_method' => $order->payment_method,
                'items' => $order->items,
            ],
        ]);
    }
}
