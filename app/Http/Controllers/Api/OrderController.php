<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
     * Send OTP to customer mobile number for order verification.
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => 'required|string|min:6|max:30',
        ], [
            'phone.required' => 'অনুগ্রহ করে মোবাইল নম্বর লিখুন।',
        ]);

        $phone = trim((string) $request->phone);
        $cleanPhone = preg_replace('/\D/', '', $phone);

        if (strlen($cleanPhone) < 11) {
            return response()->json([
                'status' => 'error',
                'message' => 'অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।',
            ], 422);
        }

        $defaultOtp = '123456';
        Cache::put("order_otp_{$cleanPhone}", $defaultOtp, now()->addMinutes(10));

        return response()->json([
            'status' => 'success',
            'message' => 'আপনার মোবাইল নম্বরে ৬-ডিজিটের ভেরিফিকেশন কোড পাঠানো হয়েছে। (Default OTP: 123456)',
            'data' => [
                'phone' => $phone,
                'otp' => $defaultOtp,
            ],
        ]);
    }

    /**
     * Store a newly created order (checkout).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'customer_name' => 'required|string|max:150',
            'customer_email' => 'nullable|email|max:150',
            'customer_phone' => 'required|string|max:30',
            'shipping_address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'payment_method' => 'nullable|string',
            'items' => 'required|array|min:1',
            'notes' => 'nullable|string|max:500',
            'discount' => 'nullable|numeric|min:0',
            'shipping_fee' => 'nullable|numeric|min:0',
            'source' => 'nullable|string|max:50',
            'is_landing_page' => 'nullable|boolean',
            'otp' => 'required|string',
        ], [
            'customer_phone.required' => 'অনুগ্রহ করে মোবাইল নম্বর দিন।',
            'otp.required' => 'অর্ডার নিশ্চিত করতে OTP কোডটি লিখুন (Default OTP: 123456)।',
        ]);

        $defaultOtp = '123456';
        $inputOtp = trim((string) $request->input('otp'));
        if ($inputOtp !== $defaultOtp) {
            return response()->json([
                'status' => 'error',
                'message' => 'ভুল OTP কোড! সঠিক কোডটি দিন (Default OTP: 123456)।',
            ], 422);
        }

        $user = $request->user() ?: auth('sanctum')->user();
        $isLandingPage = $request->boolean('is_landing_page')
            || $request->input('source') === 'landing_page';

        // Guest ordering is strictly allowed only on landing pages
        if (!$user && !$isLandingPage) {
            return response()->json([
                'status' => 'error',
                'message' => 'Please login to your account to place an order from the cart. Guest checkout is only allowed on promotional landing pages.',
            ], 401);
        }

        return DB::transaction(function () use ($request, $user) {

            $customerPhone = trim($request->customer_phone ?: ($user?->phone ?: '01700000000'));
            $cleanPhone = preg_replace('/\D/', '', $customerPhone) ?: '01700000000';
            $customerEmail = $request->filled('customer_email')
                ? strtolower(trim($request->customer_email))
                : ($user?->email ?: "guest_{$cleanPhone}@order.classymissy.com");
            $customerName = trim($request->customer_name);
            $shippingAddress = trim($request->shipping_address ?: 'Standard Delivery, Dhaka');
            $city = trim($request->input('city', 'Dhaka') ?: 'Dhaka');
            $postalCode = $request->postal_code;

            // Find or create customer
            $customer = null;
            if ($request->filled('customer_email') || $user?->email) {
                $customer = Customer::where('email', $customerEmail)->first();
            }
            if (!$customer && $customerPhone) {
                $customer = Customer::where('phone', $customerPhone)->first();
            }
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

            // Notify admins of new order
            try {
                app(\App\Services\AdminNotificationService::class)->notifyAdmins(
                    title: "New Order #{$order->order_number}",
                    message: "Customer {$order->customer_name} placed an order for ৳" . number_format($totalAmount, 0),
                    type: 'order',
                    link: '/admin/orders',
                    actionLabel: 'View Order',
                    metadata: ['order_id' => $order->id, 'order_number' => $order->order_number]
                );
            } catch (\Throwable $e) {
                // Ignore notification failure
            }

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

    /**
     * Track an order publicly by order number and optional phone/email verification.
     */
    public function track(Request $request): JsonResponse
    {
        $orderNumber = trim((string) $request->input('order_number', $request->input('order', '')));
        $orderNumber = ltrim($orderNumber, '#');

        if (empty($orderNumber)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Please provide an order number to track.',
            ], 422);
        }

        $order = Order::with('items')
            ->where('order_number', $orderNumber)
            ->orWhere('id', $orderNumber)
            ->first();

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'No order found matching the provided order number. Please verify your order number and try again.',
            ], 404);
        }

        // Optional phone verification
        $inputPhone = trim((string) $request->input('phone', ''));
        if ($inputPhone !== '') {
            $normalizedInputPhone = $this->normalizePhone($inputPhone);
            $normalizedOrderPhone = $this->normalizePhone($order->customer_phone);

            if (!empty($normalizedInputPhone) && !empty($normalizedOrderPhone)) {
                if (!str_contains($normalizedOrderPhone, $normalizedInputPhone) &&
                    !str_contains($normalizedInputPhone, $normalizedOrderPhone)) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'The phone number provided does not match this order record.',
                    ], 422);
                }
            }
        }

        // Optional email verification
        $inputEmail = trim((string) $request->input('email', ''));
        if ($inputEmail !== '') {
            if (strtolower($inputEmail) !== strtolower((string) $order->customer_email)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'The email address provided does not match this order record.',
                ], 422);
            }
        }

        $rawStatus = strtolower((string) ($order->status ?? 'pending'));
        $isCancelled = in_array($rawStatus, ['cancelled', 'canceled']);

        $stepMap = [
            'pending' => 1,
            'confirmed' => 2,
            'processing' => 2,
            'shipped' => 3,
            'delivered' => 4,
        ];
        $currentStep = $isCancelled ? 0 : ($stepMap[$rawStatus] ?? 1);

        $placedDate = $order->placed_at?->format('M d, Y h:i A') ?? $order->created_at?->format('M d, Y h:i A');
        $updatedDate = $order->updated_at?->format('M d, Y h:i A');

        $timeline = [
            [
                'step' => 1,
                'key' => 'placed',
                'title' => 'Order Placed',
                'description' => 'Your order has been placed and received by our system.',
                'date' => $placedDate,
                'completed' => $currentStep >= 1 && !$isCancelled,
                'current' => $currentStep === 1 && !$isCancelled,
            ],
            [
                'step' => 2,
                'key' => 'processing',
                'title' => 'Processing & Packed',
                'description' => 'Your products are being quality-checked and packed for shipment.',
                'date' => $currentStep >= 2 ? $updatedDate : null,
                'completed' => $currentStep >= 2 && !$isCancelled,
                'current' => $currentStep === 2 && !$isCancelled,
            ],
            [
                'step' => 3,
                'key' => 'shipped',
                'title' => 'Shipped / In Transit',
                'description' => 'Package handed over to our courier partner and is on the way.',
                'date' => $currentStep >= 3 ? $updatedDate : null,
                'completed' => $currentStep >= 3 && !$isCancelled,
                'current' => $currentStep === 3 && !$isCancelled,
            ],
            [
                'step' => 4,
                'key' => 'delivered',
                'title' => 'Delivered',
                'description' => 'Package has been delivered successfully.',
                'date' => $currentStep >= 4 ? $updatedDate : null,
                'completed' => $currentStep >= 4 && !$isCancelled,
                'current' => $currentStep === 4 && !$isCancelled,
            ],
        ];

        // Mask phone and email for public privacy unless verified with matching phone/email or authenticated owner
        $user = $request->user() ?: auth('sanctum')->user();
        $isOwner = $user && (
            ($order->customer && $order->customer->user_id === $user->id) ||
            strtolower((string) $order->customer_email) === strtolower((string) $user->email)
        );
        $isVerified = $isOwner || ($inputPhone !== '') || ($inputEmail !== '');

        $displayPhone = $isVerified ? $order->customer_phone : $this->maskPhone($order->customer_phone);
        $displayEmail = $isVerified ? $order->customer_email : $this->maskEmail($order->customer_email);

        return response()->json([
            'status' => 'success',
            'data' => [
                'order_number' => $order->order_number,
                'status' => $rawStatus,
                'status_label' => ucfirst($rawStatus),
                'current_step' => $currentStep,
                'is_cancelled' => $isCancelled,
                'placed_at' => $placedDate,
                'updated_at' => $updatedDate,
                'estimated_delivery' => '2-3 Business Days',
                'timeline' => $timeline,
                'customer' => [
                    'name' => $order->customer_name,
                    'phone' => $displayPhone,
                    'email' => $displayEmail,
                    'shipping_address' => $order->shipping_address,
                    'city' => $order->city,
                    'postal_code' => $order->postal_code,
                    'country' => $order->country ?? 'Bangladesh',
                ],
                'payment' => [
                    'method' => ucwords(str_replace('_', ' ', $order->payment_method ?? 'cash_on_delivery')),
                    'status' => ucfirst($order->payment_status ?? 'unpaid'),
                    'subtotal' => (float) $order->subtotal,
                    'shipping_fee' => (float) $order->shipping_fee,
                    'discount' => (float) $order->discount,
                    'total' => (float) $order->total_amount,
                ],
                'items' => $order->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product_id,
                        'name' => $item->product_name,
                        'image' => $item->product_image,
                        'price' => (float) $item->price,
                        'quantity' => (int) $item->quantity,
                        'total' => (float) $item->total,
                    ];
                }),
                'notes' => $order->notes,
            ],
        ]);
    }

    /**
     * Normalize phone numbers for loose matching.
     */
    protected function normalizePhone(?string $phone): string
    {
        if (!$phone) {
            return '';
        }
        $cleaned = preg_replace('/[^0-9]/', '', $phone);
        if (str_starts_with($cleaned, '880')) {
            $cleaned = substr($cleaned, 2);
        }
        return $cleaned;
    }

    /**
     * Mask phone number for public display.
     */
    protected function maskPhone(?string $phone): string
    {
        if (!$phone) {
            return '';
        }
        $len = strlen($phone);
        if ($len <= 5) {
            return $phone;
        }
        return substr($phone, 0, 3) . str_repeat('*', max(3, $len - 6)) . substr($phone, -3);
    }

    /**
     * Mask email address for public display.
     */
    protected function maskEmail(?string $email): string
    {
        if (!$email || !str_contains($email, '@')) {
            return $email ?? '';
        }
        [$user, $domain] = explode('@', $email, 2);
        $userLen = strlen($user);
        $maskedUser = $userLen <= 2 ? $user[0] . '*' : substr($user, 0, 2) . str_repeat('*', max(2, $userLen - 2));
        return $maskedUser . '@' . $domain;
    }
}
