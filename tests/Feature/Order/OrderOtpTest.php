<?php

use App\Models\Product;
use App\Models\User;

test('send otp endpoint sends default 123456 otp', function () {
    $response = $this->postJson('/api/orders/send-otp', [
        'phone' => '01712345678',
    ]);

    $response->assertOk()
        ->assertJson([
            'status' => 'success',
            'data' => [
                'phone' => '01712345678',
                'otp' => '123456',
            ],
        ]);
});

test('order requires valid otp and fails without otp', function () {
    $product = Product::create([
        'name' => 'OTP Product ' . uniqid(),
        'slug' => 'otp-prod-' . uniqid(),
        'sku' => 'SKU-' . uniqid(),
        'price' => 500,
        'stock_quantity' => 10,
        'is_active' => true,
    ]);

    $response = $this->postJson('/api/orders', [
        'source' => 'landing_page',
        'is_landing_page' => true,
        'customer_name' => 'OTP User',
        'customer_phone' => '01799999999',
        'shipping_address' => 'Dhaka',
        'items' => [
            [
                'id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'quantity' => 1,
            ],
        ],
    ]);

    $response->assertStatus(422);
    expect($response->json('errors.otp'))->not->toBeEmpty();
});

test('order fails when invalid otp is provided', function () {
    $product = Product::create([
        'name' => 'OTP Product ' . uniqid(),
        'slug' => 'otp-prod-' . uniqid(),
        'sku' => 'SKU-' . uniqid(),
        'price' => 500,
        'stock_quantity' => 10,
        'is_active' => true,
    ]);

    $response = $this->postJson('/api/orders', [
        'source' => 'landing_page',
        'is_landing_page' => true,
        'customer_name' => 'OTP User',
        'customer_phone' => '01799999999',
        'shipping_address' => 'Dhaka',
        'otp' => '999999',
        'items' => [
            [
                'id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'quantity' => 1,
            ],
        ],
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'status' => 'error',
        ]);
    expect($response->json('message'))->toContain('123456');
});

test('order succeeds when default otp 123456 is provided', function () {
    $product = Product::create([
        'name' => 'OTP Product ' . uniqid(),
        'slug' => 'otp-prod-' . uniqid(),
        'sku' => 'SKU-' . uniqid(),
        'price' => 500,
        'stock_quantity' => 10,
        'is_active' => true,
    ]);

    $response = $this->postJson('/api/orders', [
        'source' => 'landing_page',
        'is_landing_page' => true,
        'customer_name' => 'OTP User',
        'customer_phone' => '01799999999',
        'shipping_address' => 'Dhaka',
        'otp' => '123456',
        'items' => [
            [
                'id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'quantity' => 1,
            ],
        ],
    ]);

    $response->assertCreated()
        ->assertJson([
            'status' => 'success',
        ]);
});
