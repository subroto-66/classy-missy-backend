<?php

use App\Http\Controllers\Admin\AboutController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\BlogController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\CampaignController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\LandingPageController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SliderController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

// Authenticated Admin Area (Clean direct single-tenant URLs)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', AdminDashboardController::class)->name('dashboard');
    Route::redirect('/admin', '/dashboard')->name('admin.index');

    // Admin Modules
    Route::prefix('admin')->name('admin.')->group(function () {
        // Role & Permission Management
        Route::resource('roles', RoleController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('users', UserController::class)->only(['index', 'store', 'update', 'destroy']);

        // Catalog
        Route::resource('products', ProductController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('brands', BrandController::class)->only(['index', 'store', 'update', 'destroy']);

        // Orders & Customers
        Route::resource('orders', OrderController::class)->only(['index', 'destroy']);
        Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status');
        Route::resource('customers', CustomerController::class)->only(['index', 'update', 'destroy']);

        // Marketing & Content
        Route::resource('campaigns', CampaignController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('blogs', BlogController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('sliders', SliderController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('landing-pages', LandingPageController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::get('about', [AboutController::class, 'index'])->name('about.index');
        Route::match(['put', 'post'], 'about', [AboutController::class, 'update'])->name('about.update');

        // Notifications
        Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
        Route::get('notifications/{id}/view', [NotificationController::class, 'view'])->name('notifications.view');
        Route::post('notifications/mark-order-read', [NotificationController::class, 'markOrderByOrderNumber'])->name('notifications.markOrderRead');
        Route::patch('notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
        Route::patch('notifications/{id}/unread', [NotificationController::class, 'markAsUnread'])->name('notifications.unread');
        Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllRead'])->name('notifications.markAllRead');
        Route::post('notifications/mark-all-unread', [NotificationController::class, 'markAllUnread'])->name('notifications.markAllUnread');
        Route::post('notifications/test', [NotificationController::class, 'sendTest'])->name('notifications.test');
        Route::delete('notifications/clear-all', [NotificationController::class, 'clearAll'])->name('notifications.clearAll');
        Route::delete('notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    });
});

// Backwards compatibility redirects for old team-prefixed URLs (e.g. /sophie-akinyi/admin/campaigns -> /admin/campaigns)
Route::middleware(['auth'])->group(function () {
    Route::get('/{team}/dashboard', fn () => redirect('/dashboard'));
    Route::get('/{team}/admin', fn () => redirect('/dashboard'));
    Route::get('/{team}/admin/{path}', fn (string $team, string $path) => redirect("/admin/{$path}"))->where('path', '.*');
});

Route::middleware(['auth'])->group(function () {
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
