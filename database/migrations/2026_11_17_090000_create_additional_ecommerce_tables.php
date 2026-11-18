<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('password_reset_codes', function (Blueprint $table) {
            $table->id();
            $table->string('email')->index();
            $table->string('code');
            $table->string('token')->nullable()->unique();
            $table->timestamp('expires_at');
            $table->timestamps();
        });

        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->nullable()->constrained('products')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->integer('rating')->default(5);
            $table->text('review');
            $table->boolean('is_approved')->default(true);
            $table->timestamps();
        });

        Schema::create('blogs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category');
            $table->date('published_at')->nullable();
            $table->string('read_time')->default('5 min read');
            $table->text('image')->nullable();
            $table->string('image_alt')->nullable();
            $table->text('excerpt')->nullable();
            $table->text('intro')->nullable();
            $table->json('content')->nullable();
            $table->json('sections')->nullable();
            $table->json('key_takeaways')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('offer');
            $table->string('title');
            $table->text('details')->nullable();
            $table->decimal('minimum_amount', 10, 2)->default(0);
            $table->string('discount_type')->default('percentage'); // percentage, fixed, free_shipping
            $table->decimal('discount_value', 10, 2)->default(0);
            $table->string('expiry_text')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('blogs');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('password_reset_codes');
    }
};
