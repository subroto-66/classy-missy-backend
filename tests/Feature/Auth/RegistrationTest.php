<?php

use App\Models\User;

test('registration screen redirects to login when public registration is disabled', function () {
    $response = $this->get('/register');

    $response->assertRedirect('/login');
});

test('public registration endpoint does not allow external registrations', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test_outside@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertGuest();
    expect(User::where('email', 'test_outside@example.com')->exists())->toBeFalse();
});
