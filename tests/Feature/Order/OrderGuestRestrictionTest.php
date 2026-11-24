<?php

use App\Models\Product;
use App\Models\User;

function createTestProduct(array $attributes = []): Product
{
    static $i = 0;
    $i++;
    return Product::create(array_merge([
        'name' => "Test Product {$i}",
        'slug' => "test-product-{$i}",
        'sku' => "SKU-{$i}-" . uniqid(),
        'price' => 1200,
        'stock_quantity' => 20,
        'is_active' => true,
    ], $attributes));
}

test('guest users cannot place orders from standard cart without logging in', function () {
    $product = createTestProduct();

    $response = $this->postJson('/api/orders', [
        'customer_name' => 'Guest User',
        'customer_email' => 'guest@example.com',
        'customer_phone' => '01711111111',
        'shipping_address' => 'Mirpur, Dhaka',
        'city' => 'Dhaka',
        'payment_method' => 'cash_on_delivery',
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

    $response->assertStatus(401);
    expect($response->json('message'))->toContain('Please login to your account to place an order from the cart');
});

test('guest users can place orders from promotional landing pages without logging in', function () {
    $product = createTestProduct();

    $response = $this->postJson('/api/orders', [
        'source' => 'landing_page',
        'is_landing_page' => true,
        'customer_name' => 'Landing Page Customer',
        'customer_phone' => '01722222222',
        'shipping_address' => 'Uttara, Dhaka',
        'city' => 'Dhaka',
        'payment_method' => 'cash_on_delivery',
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

    $response->assertCreated();
    $response->assertJsonPath('status', 'success');
    expect($response->json('data.order_number'))->not->toBeNull();
    expect((float)$response->json('data.total'))->toBe(1200.0);
});

test('authenticated users can place orders from both cart and landing pages', function () {
    $user = User::factory()->create([
        'email' => 'authuser@example.com',
        'phone' => '01733333333',
    ]);

    $product = createTestProduct();

    // Authenticated cart checkout
    $response = $this->actingAs($user, 'sanctum')->postJson('/api/orders', [
        'customer_name' => $user->name,
        'customer_email' => $user->email,
        'customer_phone' => $user->phone,
        'shipping_address' => 'Dhanmondi, Dhaka',
        'city' => 'Dhaka',
        'payment_method' => 'cash_on_delivery',
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

    $response->assertCreated();
    $response->assertJsonPath('status', 'success');
});
