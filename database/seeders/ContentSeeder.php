<?php

namespace Database\Seeders;

use App\Models\Blog;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class ContentSeeder extends Seeder
{
    public function run(): void
    {
        $blogs = [
            [
                'title' => 'Building a Simple Skincare Routine That Works',
                'slug' => 'building-a-simple-skincare-routine-that-works',
                'category' => 'Skincare Basics',
                'published_at' => '2026-10-28',
                'read_time' => '5 min read',
                'image' => 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1200&q=85',
                'image_alt' => 'Skincare products arranged on a clean vanity',
                'excerpt' => 'A thoughtful routine does not need a dozen steps. Start with the essentials and build around what your skin needs.',
                'intro' => 'Skincare can feel complicated when every shelf seems to promise a different solution. A dependable routine is usually much simpler: a few well-chosen steps, used consistently, with room to adapt when your skin needs change.',
                'content' => [
                    'A good skincare routine is one you can follow consistently. Begin with a gentle cleanser, a moisturizer that suits your skin, and sunscreen in the morning. These simple steps help create a dependable foundation before adding targeted products.',
                    'Introduce new products one at a time and give your skin a chance to adjust. This makes it easier to notice what feels comfortable and what may not suit you. Use products as directed and avoid combining strong active ingredients without guidance.',
                    'Your skin can change with the weather, age, and daily habits. Keep your routine flexible, pay attention to how your skin feels, and ask a qualified professional if you have persistent concerns.',
                ],
                'sections' => [
                    [
                        'heading' => 'Start with the three everyday essentials',
                        'paragraphs' => [
                            'Begin with a gentle cleanser, a moisturizer that feels comfortable, and sunscreen for daytime. These steps cover cleansing, hydration, and daily sun protection without asking you to manage a long product lineup.',
                            'In the morning, rinse or cleanse as needed, moisturize, then apply broad-spectrum sunscreen according to its label. In the evening, cleanse away the day and apply moisturizer. Add a treatment only when you have a clear reason to use one.',
                        ],
                        'bullets' => [
                            'Choose a cleanser that leaves skin feeling comfortable, not tight.',
                            'Use moisturizer on slightly damp skin if that feels good for you.',
                            'Follow sunscreen directions and reapply as recommended on the label.',
                        ],
                    ],
                    [
                        'heading' => 'Add new products with a little patience',
                        'paragraphs' => [
                            'When you introduce several new products together, it is hard to know which one is helping or causing discomfort. Try one new product at a time and keep the rest of your routine familiar while you see how your skin responds.',
                            'Read directions carefully, especially for exfoliants and other active formulas. More frequent use or a larger amount does not necessarily mean better results, and combining multiple strong treatments may irritate skin.',
                        ],
                    ],
                    [
                        'heading' => 'Let your routine change with you',
                        'paragraphs' => [
                            'Weather, travel, stress, and changing habits can affect how your skin feels. It is fine to simplify when your skin feels sensitive and return to optional steps only when they feel comfortable.',
                            'Persistent irritation, sudden changes, or a skin condition deserve professional advice. A dermatologist can help you choose a plan that is appropriate for your individual needs.',
                        ],
                    ],
                ],
                'key_takeaways' => [
                    'A consistent basic routine is a strong starting point.',
                    'Introduce one new product at a time and follow its directions.',
                    'Seek professional advice for persistent or concerning symptoms.',
                ],
                'is_published' => true,
            ],
            [
                'title' => 'How to Layer Your Skincare Products',
                'slug' => 'how-to-layer-your-skincare-products',
                'category' => 'Skincare Basics',
                'published_at' => '2026-10-21',
                'read_time' => '4 min read',
                'image' => 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1200&q=85',
                'image_alt' => 'A skincare serum bottle on a bright surface',
                'excerpt' => 'Learn a practical order for applying skincare, from lightweight formulas to moisturizer and daytime sunscreen.',
                'intro' => 'The order of application can make a routine feel easier to follow. As a general guide, apply products from lighter, more fluid textures toward richer creams, while always giving priority to the instructions on each product.',
                'content' => [
                    'A simple rule for layering is to apply products from lighter textures to richer ones. After cleansing, a watery toner or serum usually goes before a cream moisturizer.',
                    'In the morning, finish your routine with broad-spectrum sunscreen and follow its label for application and reapplication. At night, use your chosen treatment according to its instructions.',
                    'You do not need to use every product at once. If layering feels heavy or causes discomfort, simplify the routine and introduce products gradually.',
                ],
                'sections' => [
                    [
                        'heading' => 'A simple order for morning',
                        'paragraphs' => [
                            'Start with cleansing, or a water rinse if that works for your skin. Apply lightweight leave-on products next, followed by moisturizer. Sunscreen is the final skincare step before makeup and should be used as directed.',
                        ],
                        'bullets' => [
                            'Cleanser',
                            'Optional lightweight serum or treatment',
                            'Moisturizer',
                            'Broad-spectrum sunscreen',
                        ],
                    ],
                ],
                'key_takeaways' => [
                    'Layer lighter textures before richer creams as a practical starting point.',
                    'Use sunscreen as the final morning skincare step.',
                    'Always follow product-specific directions when they differ.',
                ],
                'is_published' => true,
            ],
            [
                'title' => 'Understanding Your Skin Barrier',
                'slug' => 'understanding-your-skin-barrier',
                'category' => 'Skin Health',
                'published_at' => '2026-10-14',
                'read_time' => '6 min read',
                'image' => 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=1200&q=85',
                'image_alt' => 'A calm skincare setup with soft natural light',
                'excerpt' => 'Explore what the skin barrier does and why gentle cleansing and moisturizing can support everyday comfort.',
                'intro' => 'The skin barrier is the outermost part of the skin. It helps limit moisture loss and provides a first line of defense from the surrounding environment.',
                'content' => [
                    'The skin barrier is the outer layer that helps keep moisture in and environmental irritants out. When skin feels dry or uncomfortable, a gentle and consistent routine can help support its comfort.',
                    'Choose mild cleansing and a moisturizer that works for your skin. Avoid over-cleansing and be cautious about adding several exfoliating products to your routine at the same time.',
                ],
                'key_takeaways' => [
                    'The barrier helps retain moisture and protect the outer skin.',
                    'Gentle cleansing and regular moisturizing support everyday comfort.',
                ],
                'is_published' => true,
            ],
            [
                'title' => 'A Beginner’s Guide to Chemical Exfoliants',
                'slug' => 'a-beginners-guide-to-chemical-exfoliants',
                'category' => 'Ingredients',
                'published_at' => '2026-10-08',
                'read_time' => '5 min read',
                'image' => 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1200&q=85',
                'image_alt' => 'Skincare bottles and jars on a neutral background',
                'excerpt' => 'Get familiar with common exfoliating acids and learn how to introduce them carefully into a routine.',
                'intro' => 'Chemical exfoliants are found in products designed to loosen dead cells at the skin surface. The category includes different acids and strengths.',
                'content' => [
                    'Chemical exfoliants are ingredients used in some skincare products to loosen dead skin cells on the surface. Different formulas use different ingredients and strengths, so always read the product label.',
                ],
                'key_takeaways' => [
                    'Read the directions and strength before choosing an exfoliant.',
                    'Introduce one active product gradually and avoid overuse.',
                ],
                'is_published' => true,
            ],
            [
                'title' => 'Choosing a Moisturizer for Your Skin',
                'slug' => 'choosing-a-moisturizer-for-your-skin',
                'category' => 'Skin Health',
                'published_at' => '2026-09-30',
                'read_time' => '4 min read',
                'image' => 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=85',
                'image_alt' => 'A moisturizer jar with skincare essentials',
                'excerpt' => 'Texture, climate, and comfort all matter when finding a moisturizer you will enjoy using every day.',
                'intro' => 'A moisturizer should feel pleasant enough that you will actually use it.',
                'content' => [
                    'A moisturizer should feel comfortable and fit into your daily routine. Lightweight lotions may feel pleasant in warm weather, while richer creams can be preferred when skin feels dry.',
                ],
                'key_takeaways' => [
                    'Comfort and consistency are useful guides when choosing a moisturizer.',
                ],
                'is_published' => true,
            ],
            [
                'title' => 'Why Daily Sunscreen Belongs in Your Routine',
                'slug' => 'why-daily-sunscreen-belongs-in-your-routine',
                'category' => 'Sun Care',
                'published_at' => '2026-09-22',
                'read_time' => '5 min read',
                'image' => 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=85',
                'image_alt' => 'Sun care products displayed in daylight',
                'excerpt' => 'Make sun protection a practical daily habit with a formula and application routine that suits you.',
                'intro' => 'Sunscreen is one part of a broader sun-protection routine.',
                'content' => [
                    'Sun protection is an important everyday skincare step. Choose a broad-spectrum sunscreen and apply it according to the product directions.',
                ],
                'key_takeaways' => [
                    'Choose broad-spectrum sunscreen and follow its directions.',
                ],
                'is_published' => true,
            ]
        ];

        foreach ($blogs as $blog) {
            Blog::updateOrCreate(['slug' => $blog['slug']], $blog);
        }

        // Coupons
        $coupons = [
            [
                'code' => 'GLOW10',
                'offer' => '10% off',
                'title' => 'A little treat for your routine',
                'details' => 'Save 10% on your next beauty purchase.',
                'minimum_amount' => 1500,
                'discount_type' => 'percentage',
                'discount_value' => 10,
                'expiry_text' => 'Valid while stocks last',
                'is_active' => true,
            ],
            [
                'code' => 'SKINCARE15',
                'offer' => '15% off',
                'title' => 'Your skincare refresh',
                'details' => 'Get 15% off selected skincare favorites.',
                'minimum_amount' => 2500,
                'discount_type' => 'percentage',
                'discount_value' => 15,
                'expiry_text' => 'One use per customer',
                'is_active' => true,
            ],
            [
                'code' => 'FREESHIP',
                'offer' => 'Free delivery',
                'title' => 'Good things, delivered',
                'details' => 'Enjoy complimentary delivery on your order.',
                'minimum_amount' => 2000,
                'discount_type' => 'free_shipping',
                'discount_value' => 0,
                'expiry_text' => 'Valid on eligible orders',
                'is_active' => true,
            ],
        ];

        foreach ($coupons as $coupon) {
            Coupon::updateOrCreate(['code' => $coupon['code']], $coupon);
        }

        // Sample Reviews
        $user = User::first();
        $products = Product::all();
        if ($products->count() > 0) {
            Review::firstOrCreate(
                [
                    'product_id' => $products->first()->id,
                    'name' => 'Sarah Johnson',
                ],
                [
                    'user_id' => $user?->id,
                    'rating' => 5,
                    'review' => 'A gentle addition to my routine. My skin feels smoother and looks brighter within two weeks!',
                    'is_approved' => true,
                ]
            );

            if ($products->count() > 1) {
                Review::firstOrCreate(
                    [
                        'product_id' => $products->skip(1)->first()->id,
                        'name' => 'Emma Watson',
                    ],
                    [
                        'user_id' => $user?->id,
                        'rating' => 5,
                        'review' => 'Lovely everyday wash that leaves my skin feeling comfortable and clear.',
                        'is_approved' => true,
                    ]
                );
            }
        }
    }
}
