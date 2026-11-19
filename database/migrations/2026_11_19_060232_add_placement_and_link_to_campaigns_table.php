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
        Schema::table('campaigns', function (Blueprint $table) {
            $table->string('placement')->default('slider')->after('image');
            $table->string('link')->nullable()->after('placement');
            $table->integer('order')->default(0)->after('link');
        });

        // Set existing campaigns to 'slider' placement
        DB::table('campaigns')->update([
            'placement' => 'slider',
            'order' => 1,
        ]);

        // Insert initial promo grid campaigns (4 items below hero slider)
        DB::table('campaigns')->insert([
            [
                'title' => 'Top Brands Showcase',
                'slug' => 'top-brands-showcase',
                'eyebrow' => 'Trending Video',
                'description' => 'Featured showcase video of new brand arrivals and beauty picks.',
                'image' => '/storage/campaigns/products.mp4',
                'placement' => 'promo',
                'link' => '/brands',
                'order' => 1,
                'discount_percentage' => 0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Curated Campaign Look',
                'slug' => 'curated-campaign-look',
                'eyebrow' => 'Glow Collection',
                'description' => 'Curated beauty & fashion selection for the season.',
                'image' => '/storage/campaigns/promo1.jpg',
                'placement' => 'promo',
                'link' => '/campaigns',
                'order' => 2,
                'discount_percentage' => 15,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Seasonal Pre-Orders',
                'slug' => 'seasonal-pre-orders',
                'eyebrow' => 'Exclusive Access',
                'description' => 'Book upcoming limited releases before they sell out.',
                'image' => '/storage/campaigns/promo2.jpg',
                'placement' => 'promo',
                'link' => '/preorder',
                'order' => 3,
                'discount_percentage' => 10,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'VIP Beauty Selection',
                'slug' => 'vip-beauty-selection',
                'eyebrow' => 'Member Exclusive',
                'description' => 'Specially selected essentials curated by our stylists.',
                'image' => '/storage/campaigns/promo3.jpg',
                'placement' => 'promo',
                'link' => '/preorder',
                'order' => 4,
                'discount_percentage' => 20,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Flash Banner (1 wide banner)
            [
                'title' => 'Mega Flash Sale',
                'slug' => 'mega-flash-sale',
                'eyebrow' => 'Hot Deals',
                'description' => 'Grab limited-time flash discounts across best-selling categories.',
                'image' => '/storage/campaigns/banner-1.gif',
                'placement' => 'flash',
                'link' => '/campaigns',
                'order' => 1,
                'discount_percentage' => 30,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Middle Dual Banners (2 cards)
            [
                'title' => 'Modern Wardrobe Essentials',
                'slug' => 'modern-wardrobe-essentials',
                'eyebrow' => 'New Season',
                'description' => 'Contemporary women collection crafted for everyday elegance.',
                'image' => '/storage/campaigns/b1.jpg',
                'placement' => 'middle',
                'link' => '/products',
                'order' => 1,
                'discount_percentage' => 0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Signature Style Edit',
                'slug' => 'signature-style-edit',
                'eyebrow' => 'Staff Pick',
                'description' => 'Discover the standout looks turning heads this season.',
                'image' => '/storage/campaigns/b2.jpg',
                'placement' => 'middle',
                'link' => '/products',
                'order' => 2,
                'discount_percentage' => 0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Bottom Showcase Banners (4 cards)
            [
                'title' => 'Radiant Dewy Glow',
                'slug' => 'radiant-dewy-glow',
                'eyebrow' => 'Skin Radiance',
                'description' => 'Achieve an effortlessly radiant, glass-skin finish daily.',
                'image' => '/storage/campaigns/y1.jpg',
                'placement' => 'bottom',
                'link' => '/brands',
                'order' => 1,
                'discount_percentage' => 0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Barrier Defense Routine',
                'slug' => 'barrier-defense-routine',
                'eyebrow' => 'Skin Recovery',
                'description' => 'Soothing formulas that lock in deep hydration and reinforce skin barrier.',
                'image' => '/storage/campaigns/y2.jpg',
                'placement' => 'bottom',
                'link' => '/brands',
                'order' => 2,
                'discount_percentage' => 0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Hydration Boost Edit',
                'slug' => 'hydration-boost-edit',
                'eyebrow' => 'Moisture Rich',
                'description' => 'Target dehydrated skin with potent moisture-binding hydration.',
                'image' => '/storage/campaigns/y3.jpg',
                'placement' => 'bottom',
                'link' => '/brands',
                'order' => 3,
                'discount_percentage' => 0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Flawless Finish Collection',
                'slug' => 'flawless-finish-collection',
                'eyebrow' => 'Velvet Touch',
                'description' => 'Lightweight textures for smooth, photo-ready complexion.',
                'image' => '/storage/campaigns/y4.jpg',
                'placement' => 'bottom',
                'link' => '/brands',
                'order' => 4,
                'discount_percentage' => 0,
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
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn(['placement', 'link', 'order']);
        });
    }
};
