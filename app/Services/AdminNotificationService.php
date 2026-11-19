<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Notifications\AdminNotification;
use Illuminate\Support\Carbon;

class AdminNotificationService
{
    /**
     * Send an admin notification to all active administrative users.
     */
    public function notifyAdmins(
        string $title,
        string $message,
        string $type = 'system',
        ?string $link = null,
        ?string $actionLabel = null,
        array $metadata = []
    ): void {
        $admins = User::where('is_active', true)
            ->where(function ($q) {
                $q->whereHas('role', function ($rq) {
                    $rq->whereIn('slug', ['super-admin', 'admin', 'store-manager', 'content-editor', 'support-agent', 'manager']);
                })->orWhere('id', 1);
            })
            ->get();

        if ($admins->isEmpty()) {
            $admins = User::where('is_active', true)->take(5)->get();
        }

        $notification = new AdminNotification($title, $message, $type, $link, $actionLabel, $metadata);

        foreach ($admins as $admin) {
            $admin->notify($notification);
        }
    }

    /**
     * Get summary of notifications for a user (unread count, total count, latest items).
     *
     * @return array<string, mixed>
     */
    public function getNotificationsSummary(User $user, int $limit = 10): array
    {
        $this->ensureInitialNotifications($user);

        $unreadCount = $user->unreadNotifications()->count();
        $totalCount = $user->notifications()->count();

        $notifications = $user->notifications()
            ->latest()
            ->take($limit)
            ->get()
            ->map(function ($n) {
                return $this->formatNotification($n);
            });

        return [
            'unread_count' => $unreadCount,
            'total_count' => $totalCount,
            'latest' => $notifications,
        ];
    }

    /**
     * Get paginated notifications for the admin notifications page.
     *
     * @return array<string, mixed>
     */
    public function getPaginatedNotifications(User $user, ?string $filter = null, int $perPage = 15): array
    {
        $this->ensureInitialNotifications($user);

        $query = $user->notifications()->latest();

        if ($filter === 'unread') {
            $query->whereNull('read_at');
        } elseif ($filter === 'orders') {
            $query->where('data->type', 'order');
        } elseif ($filter === 'alerts') {
            $query->whereIn('data->type', ['stock', 'system', 'review']);
        }

        $paginated = $query->paginate($perPage)->withQueryString();

        $paginated->getCollection()->transform(function ($n) {
            return $this->formatNotification($n);
        });

        return [
            'paginated' => $paginated,
            'unread_count' => $user->unreadNotifications()->count(),
            'total_count' => $user->notifications()->count(),
        ];
    }

    /**
     * Format a database notification for frontend consumption.
     *
     * @param \Illuminate\Notifications\DatabaseNotification $notification
     * @return array<string, mixed>
     */
    public function formatNotification($notification): array
    {
        $data = $notification->data;
        $createdAt = $notification->created_at ? Carbon::parse($notification->created_at) : Carbon::now();

        return [
            'id' => $notification->id,
            'title' => $data['title'] ?? 'Notification',
            'message' => $data['message'] ?? '',
            'type' => $data['type'] ?? 'system',
            'link' => $data['link'] ?? null,
            'action_label' => $data['action_label'] ?? 'View Details',
            'metadata' => $data['metadata'] ?? [],
            'read' => $notification->read_at !== null,
            'read_at' => $notification->read_at ? Carbon::parse($notification->read_at)->toISOString() : null,
            'created_at' => $createdAt->toISOString(),
            'time_ago' => $createdAt->diffForHumans(),
        ];
    }

    /**
     * Ensure the user has realistic initial notifications if empty.
     */
    protected function ensureInitialNotifications(User $user): void
    {
        if ($user->notifications()->count() > 0) {
            return;
        }

        // 1. Check for recent orders
        $recentOrders = Order::latest()->take(3)->get();
        foreach ($recentOrders as $order) {
            $user->notify(new AdminNotification(
                title: "New Order #{$order->order_number}",
                message: "Customer {$order->customer_name} placed an order for ৳" . number_format($order->total_amount, 0),
                type: 'order',
                link: '/admin/orders',
                actionLabel: 'View Order',
                metadata: ['order_id' => $order->id, 'order_number' => $order->order_number]
            ));
        }

        // 2. Check for low stock products
        $lowStockProducts = Product::where('stock_quantity', '<=', 15)
            ->orWhereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->take(2)
            ->get();

        foreach ($lowStockProducts as $product) {
            $user->notify(new AdminNotification(
                title: "Low Stock Alert: {$product->name}",
                message: "Only {$product->stock_quantity} items remaining in inventory.",
                type: 'stock',
                link: '/admin/products',
                actionLabel: 'Manage Stock',
                metadata: ['product_id' => $product->id, 'sku' => $product->sku]
            ));
        }

        // 3. Check for customers
        $latestCustomer = Customer::latest()->first();
        if ($latestCustomer) {
            $user->notify(new AdminNotification(
                title: "New Customer Registration",
                message: "{$latestCustomer->name} created a new store account.",
                type: 'customer',
                link: '/admin/customers',
                actionLabel: 'View Customer',
                metadata: ['customer_id' => $latestCustomer->id]
            ));
        }

        // 4. Welcome alert
        $user->notify(new AdminNotification(
            title: "Store Dashboard Ready",
            message: "Classy Missy system initialized. Real-time sales, order sync, and customer alerts are active.",
            type: 'system',
            link: '/dashboard',
            actionLabel: 'Go to Dashboard',
            metadata: []
        ));
    }
}
