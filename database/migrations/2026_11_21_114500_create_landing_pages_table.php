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
        Schema::create('landing_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('badge')->nullable();
            $table->string('hotline')->nullable();
            $table->string('whatsapp')->nullable();
            $table->text('announcement_text')->nullable();
            $table->boolean('countdown_enabled')->default(true);
            $table->integer('countdown_hours')->default(4);

            // Hero Section
            $table->string('headline')->nullable();
            $table->string('subheadline')->nullable();
            $table->text('hero_description')->nullable();
            $table->string('video_url')->nullable();
            $table->string('banner_image')->nullable();
            $table->json('gallery_images')->nullable();

            // Pricing & Packages
            $table->json('packages')->nullable();
            $table->decimal('delivery_inside_dhaka', 8, 2)->default(70.00);
            $table->decimal('delivery_outside_dhaka', 8, 2)->default(130.00);

            // Detailed Content Sections
            $table->json('features')->nullable();
            $table->json('benefits')->nullable();
            $table->json('steps')->nullable();
            $table->json('reviews')->nullable();
            $table->json('faqs')->nullable();
            $table->text('guarantee_text')->nullable();

            // Status & Configuration
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default_for_product')->default(true);
            $table->integer('order')->default(0);

            // SEO Meta
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('landing_pages');
    }
};
