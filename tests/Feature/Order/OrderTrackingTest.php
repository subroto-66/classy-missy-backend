<?php

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;

beforeEach(function () {
    $this->product = Product::create([
        'name' => 'Tracking Test Serum',
        'slug' => 'tracking-test-serum-' . uniqid(),
        'sku' => 'SERUM-' . uniqid(),
        'price' => 1250,
        'stock_quantity' => 15,
        'is_active' => true,
    ]);

    $this->order = Order::create([
        'order_number' => 'CM-TRACK-99999',
        'customer_name' => 'Sara Khan',
        'customer_email' => 'sara@example.com',
        'customer_phone' => '01712345678',
        'shipping_address' => 'House 10, Road 5, Dhanmondi',
        'city' => 'Dhaka',
        'status' => 'processing',
        'payment_status' => 'unpaid',
        'payment_method' => 'cash_on_delivery',
        'subtotal' => 1250,
        'shipping_fee' => 60,
        'discount' => 0,
        'total_amount' => 1310,
    ]);

    OrderItem::create([
        'order_id' => $this->order->id,
        'product_id' => $this->product->id,
        'product_name' => $this->product->name,
        'price' => 1250,
        'quantity' => 1,
        'total' => 1250,
    ]);
});

test('can track order with order_number via GET', function () {
    $response = $this->getJson('/api/orders/track?order_number=CM-TRACK-99999');

    $response->assertOk()
        ->assertJson([
            'status' => 'success',
            'data' => [
                'order_number' => 'CM-TRACK-99999',
                'status' => 'processing',
                'current_step' => 2,
            ],
        ]);

    expect($response->json('data.timeline'))->toHaveCount(4);
    expect($response->json('data.customer.name'))->toBe('Sara Khan');
    // Public display masks phone and email if not verified
    expect($response->json('data.customer.phone'))->toContain('*');
});

test('can track order with order_number and matching phone via POST', function () {
    $response = $this->postJson('/api/orders/track', [
        'order_number' => 'CM-TRACK-99999',
        'phone' => '01712345678',
    ]);

    $response->assertOk()
        ->assertJson([
            'status' => 'success',
            'data' => [
                'order_number' => 'CM-TRACK-99999',
                'customer' => [
                    'phone' => '01712345678',
                ],
            ],
        ]);
});

test('track returns 422 if phone does not match', function () {
    $response = $this->postJson('/api/orders/track', [
        'order_number' => 'CM-TRACK-99999',
        'phone' => '01999999999',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'status' => 'error',
        ]);
});

test('track returns 404 for non-existent order', function () {
    $response = $this->getJson('/api/orders/track?order_number=CM-NON-EXISTENT');

    $response->assertStatus(404)
        ->assertJson([
            'status' => 'error',
        ]);
});
