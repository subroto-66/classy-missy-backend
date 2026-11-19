<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('about_pages', function (Blueprint $table) {
            $table->id();
            // Hero / Banner Section
            $table->string('banner_eyebrow')->nullable();
            $table->string('banner_title')->nullable();
            $table->text('banner_description')->nullable();
            $table->text('banner_image')->nullable();
            $table->string('banner_alt')->nullable();

            // Our Approach Section
            $table->string('approach_eyebrow')->nullable();
            $table->string('approach_title')->nullable();
            $table->text('approach_description')->nullable();

            // Gallery / Visual Showcase Section
            $table->string('routine_tag')->nullable();
            $table->string('routine_title')->nullable();
            $table->text('routine_image')->nullable();
            $table->string('routine_alt')->nullable();

            $table->text('discovery_image_1')->nullable();
            $table->string('discovery_caption_1')->nullable();

            $table->text('discovery_image_2')->nullable();
            $table->string('discovery_caption_2')->nullable();

            // Core Values Section
            $table->string('values_eyebrow')->nullable();
            $table->string('values_title')->nullable();
            $table->json('values')->nullable();

            $table->timestamps();
        });

        // Insert initial default About page content
        DB::table('about_pages')->insert([
            'banner_eyebrow' => 'A little more care, every day',
            'banner_title' => 'About Classy Missy',
            'banner_description' => 'We make discovering skincare feel simple and personal. Explore a considered collection, find products for your routine, and keep the ones you love close at hand.',
            'banner_image' => '/storage/about/y1.jpg',
            'banner_alt' => 'A beauty and skincare editorial',

            'approach_eyebrow' => 'Our approach',
            'approach_title' => 'Beauty shopping, made more thoughtful.',
            'approach_description' => "Finding skincare that fits your needs can take time. Classy Missy brings product discovery into one place, with ways to browse by brand, category, and skin concern.\n\nSave items to your wishlist while you decide, or add products to your cart when you are ready. Our goal is to make the journey from discovery to your daily routine clear and comfortable.",

            'routine_tag' => 'Make room for self-care',
            'routine_title' => 'Discover products that feel right for your routine.',
            'routine_image' => '/storage/about/need.jpg',
            'routine_alt' => 'Skincare products chosen for a personal care routine',

            'discovery_image_1' => '/storage/about/y2.jpg',
            'discovery_caption_1' => 'Thoughtful discovery',

            'discovery_image_2' => 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
            'discovery_caption_2' => 'Everyday essentials',

            'values_eyebrow' => 'What matters to us',
            'values_title' => 'Care in every detail',
            'values' => json_encode([
                [
                    'icon' => 'heart',
                    'title' => 'Care comes first',
                    'description' => 'We make it easier to explore products selected with everyday skincare routines in mind.',
                ],
                [
                    'icon' => 'shield',
                    'title' => 'A thoughtful collection',
                    'description' => 'Browse products by brand, category, price, or the skin concern you want to focus on.',
                ],
                [
                    'icon' => 'star',
                    'title' => 'Your routine, your way',
                    'description' => 'Save favorites, compare options, and build a routine at a pace that feels right for you.',
                ],
            ]),

            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('about_pages');
    }
};
