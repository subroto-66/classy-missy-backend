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
        Schema::create('sliders', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->string('badge_text')->nullable();
            $table->string('button_text')->nullable();
            $table->text('image');
            $table->string('image_alt')->nullable();
            $table->string('link')->nullable()->default('#');
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Insert initial default slides
        DB::table('sliders')->insert([
            [
                'title' => "Curated Collection",
                'subtitle' => "Neutral-toned women's fashion",
                'badge_text' => 'New Season',
                'button_text' => 'Explore Brands',
                'image' => '/storage/sliders/b1.jfif',
                'image_alt' => "Curated neutral-toned women's fashion collection",
                'link' => '/brands',
                'order' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Contemporary Look',
                'subtitle' => "Women's modern fashion collection",
                'badge_text' => 'Special Deals',
                'button_text' => 'View Campaigns',
                'image' => '/storage/sliders/b2.jfif',
                'image_alt' => "Contemporary women's fashion look",
                'link' => '/campaigns',
                'order' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Latest Fashion Trends',
                'subtitle' => 'Discover the latest curated collection',
                'badge_text' => 'Pre-Order',
                'button_text' => 'Shop Preorder',
                'image' => '/storage/sliders/b3.jfif',
                'image_alt' => 'Discover the latest fashion collection',
                'link' => '/preorder',
                'order' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sliders');
    }
};
