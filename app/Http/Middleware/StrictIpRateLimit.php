<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class StrictIpRateLimit
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  int  $maxAttempts Maximum hits allowed within the window (default: 10)
     * @param  int  $windowMinutes Window duration in minutes (default: 1)
     * @param  int  $lockoutMinutes Lockout duration in minutes when exceeded (default: 30)
     * @param  string  $scope Rate limit scope key (default: 'login')
     */
    public function handle(
        Request $request,
        Closure $next,
        int $maxAttempts = 10,
        int $windowMinutes = 1,
        int $lockoutMinutes = 30,
        string $scope = 'login'
    ): Response {
        $ip = $request->ip() ?: '127.0.0.1';
        $ipHash = sha1("{$scope}:{$ip}");

        $blockKey = "ip_lockout:{$ipHash}";
        $hitKey = "ip_rate_hits:{$ipHash}";
        $windowSeconds = $windowMinutes * 60;
        $lockoutSeconds = $lockoutMinutes * 60;

        // 1. Check if this IP is currently locked out
        if ($blockedUntil = Cache::get($blockKey)) {
            $remainingSeconds = max(1, $blockedUntil - now()->timestamp);
            $remainingMinutes = (int) ceil($remainingSeconds / 60);

            return $this->buildBlockedResponse($request, $remainingSeconds, $remainingMinutes, $scope);
        }

        // 2. Check if the IP has exceeded allowed attempts in the window
        if (RateLimiter::tooManyAttempts($hitKey, $maxAttempts)) {
            // Put the IP in a 30-minute block list
            $blockedUntil = now()->timestamp + $lockoutSeconds;
            Cache::put($blockKey, $blockedUntil, now()->addMinutes($lockoutMinutes));

            // Reset the 1-minute hit counter so it resets cleanly after lockout
            RateLimiter::clear($hitKey);

            return $this->buildBlockedResponse($request, $lockoutSeconds, $lockoutMinutes, $scope);
        }

        // 3. Register the hit for this window
        RateLimiter::hit($hitKey, $windowSeconds);

        $response = $next($request);

        // Attach rate-limiting headers for client visibility
        $retriesLeft = RateLimiter::retriesLeft($hitKey, $maxAttempts);
        $response->headers->set('X-RateLimit-Limit', (string) $maxAttempts);
        $response->headers->set('X-RateLimit-Remaining', (string) max(0, $retriesLeft));

        return $response;
    }

    /**
     * Build the 429 Too Many Requests response for locked out clients.
     */
    protected function buildBlockedResponse(Request $request, int $remainingSeconds, int $remainingMinutes, string $scope = 'login'): Response
    {
        $message = "Too many login attempts. Your IP has been temporarily blocked for {$remainingMinutes} minute(s). Please try again later.";

        $headers = [
            'Retry-After' => (string) $remainingSeconds,
            'X-RateLimit-Reset' => (string) (now()->timestamp + $remainingSeconds),
        ];

        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'status' => 'error',
                'message' => $message,
                'retry_after_seconds' => $remainingSeconds,
                'remaining_minutes' => $remainingMinutes,
                'blocked_until' => now()->addSeconds($remainingSeconds)->toIso8601String(),
            ], Response::HTTP_TOO_MANY_REQUESTS, $headers);
        }

        if ($request->header('X-Inertia')) {
            throw ValidationException::withMessages([
                'email' => [$message],
            ])->status(Response::HTTP_TOO_MANY_REQUESTS);
        }

        return response($message, Response::HTTP_TOO_MANY_REQUESTS, $headers);
    }

    /**
     * Helper to manually unblock an IP address.
     */
    public static function unblock(string $ip, string $scope = 'login'): void
    {
        $ipHash = sha1("{$scope}:{$ip}");
        Cache::forget("ip_lockout:{$ipHash}");
        RateLimiter::clear("ip_rate_hits:{$ipHash}");

        $defaultHash = sha1($ip);
        Cache::forget("ip_lockout:{$defaultHash}");
        RateLimiter::clear("ip_rate_hits:{$defaultHash}");
    }

    /**
     * Helper to check if an IP is currently blocked.
     */
    public static function isBlocked(string $ip, string $scope = 'login'): bool
    {
        $ipHash = sha1("{$scope}:{$ip}");
        if (Cache::has("ip_lockout:{$ipHash}")) {
            return true;
        }

        $defaultHash = sha1($ip);
        return Cache::has("ip_lockout:{$defaultHash}");
    }
}
