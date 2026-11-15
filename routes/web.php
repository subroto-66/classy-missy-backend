<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\CampaignController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

// Direct redirect helpers for dashboard and admin
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', function (Request $request) {
        $user = $request->user();
        $team = $user->currentTeam ?? $user->personalTeam();
        return redirect("/{$team->slug}/dashboard");
    })->name('dashboard.redirect');

    Route::get('/admin', function (Request $request) {
        $user = $request->user();
        $team = $user->currentTeam ?? $user->personalTeam();
        return redirect("/{$team->slug}/dashboard");
    })->name('admin.redirect');

    Route::get('/admin/{path}', function (Request $request, string $path) {
        $user = $request->user();
        $team = $user->currentTeam ?? $user->personalTeam();
        return redirect("/{$team->slug}/admin/{$path}");
    })->where('path', '.*');
});

// Authenticated Team / Admin Area
Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', AdminDashboardController::class)->name('dashboard');

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

            // Marketing
            Route::resource('campaigns', CampaignController::class)->only(['index', 'store', 'update', 'destroy']);
        });
    });

Route::middleware(['auth'])->group(function () {
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
