<?php

use App\Http\Middleware\StrictIpRateLimit;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    Cache::flush();
    StrictIpRateLimit::unblock('192.168.1.100', 'login');
    StrictIpRateLimit::unblock('127.0.0.1', 'login');
});

test('frontend api login allows up to 10 attempts per minute and blocks on 11th for 30 minutes', function () {
    $ip = '192.168.1.100';

    // First 10 invalid login attempts are processed (validation/auth failure, not 429)
    for ($i = 1; $i <= 10; $i++) {
        $response = $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->postJson('/api/login', [
                'email' => 'wrong@example.com',
                'password' => 'invalid-password',
            ]);

        expect($response->status())->not->toBe(429);
        $response->assertHeader('X-RateLimit-Limit', '10');
        $response->assertHeader('X-RateLimit-Remaining', (string) (10 - $i));
    }

    // 11th attempt triggers the 30-minute block
    $blocked = $this->withServerVariables(['REMOTE_ADDR' => $ip])
        ->postJson('/api/login', [
            'email' => 'wrong@example.com',
            'password' => 'invalid-password',
        ]);

    $blocked->assertStatus(429);
    $blocked->assertJsonPath('status', 'error');
    $blocked->assertJsonPath('remaining_minutes', 30);
    expect($blocked->json('message'))->toContain('temporarily blocked for 30 minute(s)');
    expect(StrictIpRateLimit::isBlocked($ip, 'login'))->toBeTrue();

    // 12th attempt is immediately rejected with 429
    $stillBlocked = $this->withServerVariables(['REMOTE_ADDR' => $ip])
        ->postJson('/api/login', [
            'email' => 'wrong@example.com',
            'password' => 'invalid-password',
        ]);

    $stillBlocked->assertStatus(429);
});

test('admin and staff web login blocks on 11th attempt with 429', function () {
    $ip = '192.168.1.100';

    for ($i = 1; $i <= 10; $i++) {
        $response = $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->post('/login', [
                'email' => 'admin@example.com',
                'password' => 'wrong-pass',
            ]);

        expect($response->status())->not->toBe(429);
    }

    // 11th attempt blocks IP for 30 minutes
    $blocked = $this->withServerVariables(['REMOTE_ADDR' => $ip])
        ->post('/login', [
            'email' => 'admin@example.com',
            'password' => 'wrong-pass',
        ]);

    $blocked->assertStatus(429);
    expect(StrictIpRateLimit::isBlocked($ip, 'login'))->toBeTrue();
});

test('unblocking an ip restores login access immediately', function () {
    $ip = '192.168.1.100';

    for ($i = 1; $i <= 11; $i++) {
        $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->postJson('/api/login', [
                'email' => 'wrong@example.com',
                'password' => 'invalid-password',
            ]);
    }

    expect(StrictIpRateLimit::isBlocked($ip, 'login'))->toBeTrue();

    // Unblock the IP
    StrictIpRateLimit::unblock($ip, 'login');
    expect(StrictIpRateLimit::isBlocked($ip, 'login'))->toBeFalse();

    // Next request is processed normally again
    $response = $this->withServerVariables(['REMOTE_ADDR' => $ip])
        ->postJson('/api/login', [
            'email' => 'wrong@example.com',
            'password' => 'invalid-password',
        ]);

    expect($response->status())->not->toBe(429);
});
