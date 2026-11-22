<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AdminNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function __construct(
        protected AdminNotificationService $notificationService
    ) {}

    /**
     * Display a listing of notifications.
     */
    public function index(Request $request): Response|JsonResponse
    {
        $user = $request->user();

        if (! $request->header('X-Inertia') && $request->wantsJson()) {
            $summary = $this->notificationService->getNotificationsSummary($user, 20);
            return response()->json([
                'status' => 'success',
                'data' => [
                    ...$summary,
                    'pending_orders_count' => \App\Models\Order::where('status', 'pending')->count(),
                ],
            ]);
        }

        $filter = $request->input('filter', 'all');
        $perPage = max(5, min(100, (int) $request->input('per_page', 10)));
        $data = $this->notificationService->getPaginatedNotifications($user, $filter, $perPage);

        return Inertia::render('admin/notifications/index', [
            'notifications' => $data['paginated'],
            'unreadCount' => $data['unread_count'],
            'totalCount' => $data['total_count'],
            'filter' => $filter,
            'perPage' => $perPage,
        ]);
    }

    /**
     * View a notification: mark it as read and redirect to its target link.
     */
    public function view(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->markAsRead();
            $link = $notification->data['link'] ?? '/admin/orders';
            return redirect($link);
        }

        return redirect('/admin/orders');
    }

    /**
     * Mark unread notifications for a specific order as read.
     */
    public function markOrderByOrderNumber(Request $request): RedirectResponse|JsonResponse
    {
        $orderId = $request->input('order_id');
        $orderNumber = $request->input('order_number');

        if ($orderId || $orderNumber) {
            $notifications = $request->user()->unreadNotifications()
                ->where('data->type', 'order')
                ->get()
                ->filter(function ($n) use ($orderId, $orderNumber) {
                    $metadata = $n->data['metadata'] ?? [];
                    if ($orderId && isset($metadata['order_id']) && (string) $metadata['order_id'] === (string) $orderId) {
                        return true;
                    }
                    if ($orderNumber && isset($metadata['order_number']) && (string) $metadata['order_number'] === (string) $orderNumber) {
                        return true;
                    }
                    return false;
                });

            foreach ($notifications as $notification) {
                $notification->markAsRead();
            }
        }

        if (! $request->header('X-Inertia') && $request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'unread_count' => $request->user()->unreadNotifications()->count(),
            ]);
        }

        return back();
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, string $id): RedirectResponse|JsonResponse
    {
        $notification = $request->user()->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->markAsRead();
        }

        if (! $request->header('X-Inertia') && $request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'unread_count' => $request->user()->unreadNotifications()->count(),
            ]);
        }

        return back()->with('success', 'Notification marked as read.');
    }

    /**
     * Mark a specific notification as unread.
     */
    public function markAsUnread(Request $request, string $id): RedirectResponse|JsonResponse
    {
        $notification = $request->user()->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->update(['read_at' => null]);
        }

        if (! $request->header('X-Inertia') && $request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'unread_count' => $request->user()->unreadNotifications()->count(),
            ]);
        }

        return back()->with('success', 'Notification marked as unread.');
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllRead(Request $request): RedirectResponse|JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        if (! $request->header('X-Inertia') && $request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'unread_count' => 0,
            ]);
        }

        return back()->with('success', 'All notifications marked as read.');
    }

    /**
     * Mark all notifications as unread.
     */
    public function markAllUnread(Request $request): RedirectResponse|JsonResponse
    {
        $request->user()->notifications()->update(['read_at' => null]);

        if (! $request->header('X-Inertia') && $request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'unread_count' => $request->user()->notifications()->count(),
            ]);
        }

        return back()->with('success', 'All notifications marked as unread.');
    }

    /**
     * Send a test unread notification for demonstration.
     */
    public function sendTest(Request $request): RedirectResponse|JsonResponse
    {
        $requestedType = $request->input('type');
        $types = ['order', 'stock', 'customer', 'review'];
        $type = in_array($requestedType, $types) ? $requestedType : $types[array_rand($types)];
        $orderNum = 'CM-' . mt_rand(24000, 25999);
        $amount = mt_rand(1200, 6800);

        if ($type === 'order') {
            $title = "New Order #{$orderNum}";
            $message = "Customer placed a new purchase for ৳" . number_format($amount, 0) . " (Cash on Delivery).";
            $link = '/admin/orders';
        } elseif ($type === 'stock') {
            $title = "Low Stock Alert: Hydrating B5 Gel";
            $message = "Inventory dropped to 3 units remaining. Please restock soon.";
            $link = '/admin/products';
        } elseif ($type === 'customer') {
            $title = "New Customer Registered";
            $message = "A new customer joined Classy Missy store.";
            $link = '/admin/customers';
        } else {
            $title = "New 5-Star Review Received";
            $message = "\"Absolutely love the texture and glow!\" on BHA Liquid Exfoliant.";
            $link = '/admin/products';
        }

        $request->user()->notify(new \App\Notifications\AdminNotification(
            title: $title,
            message: $message,
            type: $type,
            link: $link,
            actionLabel: 'View Details'
        ));

        if (! $request->header('X-Inertia') && $request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Test unread alert created.',
                'unread_count' => $request->user()->unreadNotifications()->count(),
            ]);
        }

        return back()->with('success', 'New unread alert notification received!');
    }

    /**
     * Remove the specified notification.
     */
    public function destroy(Request $request, string $id): RedirectResponse|JsonResponse
    {
        $user = $request->user();
        $notification = $user->notifications()->where('id', $id)->first()
            ?? \Illuminate\Notifications\DatabaseNotification::where('id', $id)->first();

        if ($notification) {
            $notification->delete();
        }

        if (! $request->header('X-Inertia') && $request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'unread_count' => $user->unreadNotifications()->count(),
            ]);
        }

        return back()->with('success', 'Notification deleted.');
    }

    /**
     * Clear all notifications (or read only if scope=read).
     */
    public function clearAll(Request $request): RedirectResponse|JsonResponse
    {
        $user = $request->user();
        $scope = $request->input('scope', 'all');

        if ($scope === 'read') {
            $user->readNotifications()->delete();
            $message = 'All read notifications cleared.';
        } else {
            $user->notifications()->delete();
            $message = 'All notifications cleared.';
        }

        if (! $request->header('X-Inertia') && $request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'unread_count' => $user->unreadNotifications()->count(),
            ]);
        }

        return back()->with('success', $message);
    }
}
