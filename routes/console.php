<?php

use App\Http\Middleware\StrictIpRateLimit;
use App\Models\TeamInvitation;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    TeamInvitation::query()
        ->whereNotNull('expires_at')
        ->where('expires_at', '<', now())
        ->delete();
})->daily()->description('Delete expired team invitations');

Artisan::command('ip:unblock {ip=127.0.0.1}', function (string $ip) {
    StrictIpRateLimit::unblock($ip);
    $this->info("IP address [{$ip}] has been unblocked successfully.");
})->purpose('Unblock an IP address locked out by rate limiting');

Artisan::command('ip:status {ip=127.0.0.1}', function (string $ip) {
    if (StrictIpRateLimit::isBlocked($ip)) {
        $this->warn("IP [{$ip}] is currently BLOCKED.");
    } else {
        $this->info("IP [{$ip}] is active (not blocked).");
    }
})->purpose('Check if an IP address is currently blocked by rate limiting');
