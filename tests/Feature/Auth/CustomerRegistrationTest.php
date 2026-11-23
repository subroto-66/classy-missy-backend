<?php

use App\Models\Customer;
use App\Models\User;

test('customers can register with name, email, phone number, and strong password', function () {
    $response = $this->postJson('/api/register', [
        'name' => 'Sara Khan',
        'email' => 'sara.khan@example.com',
        'phone' => '01812345678',
        'password' => 'Pass@1234',
    ]);

    $response->assertCreated();
    $response->assertJsonPath('status', 'success');
    $response->assertJsonPath('data.name', 'Sara Khan');
    $response->assertJsonPath('data.phone', '01812345678');
    $response->assertJsonPath('data.user.phone', '01812345678');

    $user = User::where('email', 'sara.khan@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->phone)->toBe('01812345678');

    $customer = Customer::where('user_id', $user->id)->first();
    expect($customer)->not->toBeNull();
    expect($customer->phone)->toBe('01812345678');
});

test('registration rejects invalid email format with clear message', function () {
    $response = $this->postJson('/api/register', [
        'name' => 'Invalid Email User',
        'email' => 'invalid-email-address',
        'phone' => '01812345678',
        'password' => 'Pass@1234',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['email']);
    expect($response->json('errors.email.0'))->toContain('valid email address');
});

test('registration rejects duplicate email with clear message', function () {
    User::factory()->create([
        'email' => 'duplicate@example.com',
    ]);

    $response = $this->postJson('/api/register', [
        'name' => 'Duplicate User',
        'email' => 'duplicate@example.com',
        'phone' => '01812345678',
        'password' => 'Pass@1234',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['email']);
    expect($response->json('errors.email.0'))->toBe('This email address is already registered. Please login or use a different email.');
});

test('check-email endpoint verifies email availability', function () {
    User::factory()->create([
        'email' => 'existing@example.com',
    ]);

    // Check existing email
    $resExisting = $this->postJson('/api/check-email', [
        'email' => 'existing@example.com',
    ]);
    $resExisting->assertOk();
    $resExisting->assertJsonPath('available', false);

    // Check new available email
    $resNew = $this->postJson('/api/check-email', [
        'email' => 'brandnew@example.com',
    ]);
    $resNew->assertOk();
    $resNew->assertJsonPath('available', true);
});

test('registration requires password with capital letter, number, and special character', function () {
    // 1. Missing capital letter
    $resNoUpper = $this->postJson('/api/register', [
        'name' => 'Test User',
        'email' => 'noupper@example.com',
        'phone' => '01711111111',
        'password' => 'secret@123',
    ]);
    $resNoUpper->assertStatus(422);
    $resNoUpper->assertJsonValidationErrors(['password']);

    // 2. Missing number
    $resNoNumber = $this->postJson('/api/register', [
        'name' => 'Test User',
        'email' => 'nonumber@example.com',
        'phone' => '01711111111',
        'password' => 'Secret@Password',
    ]);
    $resNoNumber->assertStatus(422);
    $resNoNumber->assertJsonValidationErrors(['password']);

    // 3. Missing special character
    $resNoSpecial = $this->postJson('/api/register', [
        'name' => 'Test User',
        'email' => 'nospecial@example.com',
        'phone' => '01711111111',
        'password' => 'SecretPass123',
    ]);
    $resNoSpecial->assertStatus(422);
    $resNoSpecial->assertJsonValidationErrors(['password']);

    // 4. Too short (< 8 chars)
    $resTooShort = $this->postJson('/api/register', [
        'name' => 'Test User',
        'email' => 'tooshort@example.com',
        'phone' => '01711111111',
        'password' => 'Sec@1',
    ]);
    $resTooShort->assertStatus(422);
    $resTooShort->assertJsonValidationErrors(['password']);
});
