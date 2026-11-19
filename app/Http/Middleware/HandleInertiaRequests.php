<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        if ($user) {
            $user->loadMissing('role');
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
                'permissions' => $user ? $user->getAllPermissions()->pluck('slug')->all() : [],
                'isSuperAdmin' => $user ? $user->isSuperAdmin() : false,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'currentTeam' => fn () => $user?->currentTeam ? $user->toUserTeam($user->currentTeam) : null,
            'teams' => fn () => $user?->toUserTeams(includeCurrent: true) ?? [],
            'pendingOrdersCount' => fn () => \App\Models\Order::where('status', 'pending')->count(),
            'adminNotifications' => fn () => $user ? app(\App\Services\AdminNotificationService::class)->getNotificationsSummary($user) : null,
            'appBranding' => fn () => [
                'logo' => \App\Models\Setting::get('admin_logo', '/logo.svg'),
                'logo_dark' => \App\Models\Setting::get('admin_logo_dark', null),
                'favicon' => \App\Models\Setting::get('favicon', '/favicon.svg'),
                'title' => \App\Models\Setting::get('admin_title', 'Classy Missy'),
                'subtitle' => \App\Models\Setting::get('admin_subtitle', 'Admin Panel'),
            ],
        ];
    }
}
