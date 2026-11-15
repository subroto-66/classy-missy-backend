<?php

namespace Database\Seeders;

use App\Actions\Teams\CreateTeam;
use App\Models\Brand;
use App\Models\Campaign;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Permission;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Permissions
        $permissions = [
            // Access Control
            ['name' => 'View Dashboard', 'slug' => 'dashboard.view', 'group' => 'Dashboard', 'description' => 'Access executive admin dashboard & analytics'],
            ['name' => 'View Roles', 'slug' => 'roles.view', 'group' => 'Access Control', 'description' => 'View roles and permission matrices'],
            ['name' => 'Manage Roles', 'slug' => 'roles.manage', 'group' => 'Access Control', 'description' => 'Create, edit, and delete roles & permissions'],
            ['name' => 'View Users', 'slug' => 'users.view', 'group' => 'Access Control', 'description' => 'View admin and staff members'],
            ['name' => 'Manage Users', 'slug' => 'users.manage', 'group' => 'Access Control', 'description' => 'Create staff, assign roles, change status'],

            // Products & Catalog
            ['name' => 'View Products', 'slug' => 'products.view', 'group' => 'Catalog', 'description' => 'View products catalogue and inventory'],
            ['name' => 'Create Products', 'slug' => 'products.create', 'group' => 'Catalog', 'description' => 'Create new skincare & beauty products'],
            ['name' => 'Edit Products', 'slug' => 'products.edit', 'group' => 'Catalog', 'description' => 'Update product information, pricing and stock'],
            ['name' => 'Delete Products', 'slug' => 'products.delete', 'group' => 'Catalog', 'description' => 'Remove products from the catalog'],
            ['name' => 'Manage Categories', 'slug' => 'categories.manage', 'group' => 'Catalog', 'description' => 'Create, update, and reorder categories'],
            ['name' => 'Manage Brands', 'slug' => 'brands.manage', 'group' => 'Catalog', 'description' => 'Create and edit partner brands'],

            // Orders & Sales
            ['name' => 'View Orders', 'slug' => 'orders.view', 'group' => 'Orders', 'description' => 'View customer orders and history'],
            ['name' => 'Update Orders', 'slug' => 'orders.update', 'group' => 'Orders', 'description' => 'Update order fulfillment and payment status'],
            ['name' => 'Delete Orders', 'slug' => 'orders.delete', 'group' => 'Orders', 'description' => 'Cancel or delete orders'],
            ['name' => 'View Customers', 'slug' => 'customers.view', 'group' => 'Customers', 'description' => 'View customer profiles and order histories'],
            ['name' => 'Manage Customers', 'slug' => 'customers.manage', 'group' => 'Customers', 'description' => 'Edit customer notes, manage customer access'],

            // Marketing & Content
            ['name' => 'Manage Campaigns', 'slug' => 'campaigns.manage', 'group' => 'Marketing', 'description' => 'Manage promotional banners and glow campaigns'],

            // Settings
            ['name' => 'Manage Settings', 'slug' => 'settings.manage', 'group' => 'Settings', 'description' => 'Manage store preferences and configuration'],
        ];

        $permissionModels = [];
        foreach ($permissions as $perm) {
            $permissionModels[$perm['slug']] = Permission::updateOrCreate(
                ['slug' => $perm['slug']],
                $perm
            );
        }

        // 2. Roles
        $superAdminRole = Role::updateOrCreate(
            ['slug' => 'super-admin'],
            [
                'name' => 'Super Admin',
                'description' => 'Full administrative control over all store settings, roles, users, and financials.',
                'is_system' => true,
            ]
        );

        $adminRole = Role::updateOrCreate(
            ['slug' => 'admin'],
            [
                'name' => 'Administrator',
                'description' => 'Manage store catalog, customer orders, campaigns, and staff members.',
                'is_system' => true,
            ]
        );

        $managerRole = Role::updateOrCreate(
            ['slug' => 'store-manager'],
            [
                'name' => 'Store Manager',
                'description' => 'Manages product catalog, stock inventory, and processes orders.',
                'is_system' => false,
            ]
        );

        $editorRole = Role::updateOrCreate(
            ['slug' => 'content-editor'],
            [
                'name' => 'Content Editor',
                'description' => 'Edits product copy, descriptions, highlights, and campaigns.',
                'is_system' => false,
            ]
        );

        $supportRole = Role::updateOrCreate(
            ['slug' => 'support-agent'],
            [
                'name' => 'Support Agent',
                'description' => 'Handles customer inquiries, views order history, and updates shipping statuses.',
                'is_system' => false,
            ]
        );

        // Assign Permissions
        $superAdminRole->permissions()->sync(collect($permissionModels)->pluck('id'));
        $adminRole->permissions()->sync(
            collect($permissionModels)->except(['settings.manage'])->pluck('id')
        );
        $managerRole->permissions()->sync([
            $permissionModels['dashboard.view']->id,
            $permissionModels['products.view']->id,
            $permissionModels['products.create']->id,
            $permissionModels['products.edit']->id,
            $permissionModels['categories.manage']->id,
            $permissionModels['brands.manage']->id,
            $permissionModels['orders.view']->id,
            $permissionModels['orders.update']->id,
            $permissionModels['customers.view']->id,
        ]);
        $editorRole->permissions()->sync([
            $permissionModels['dashboard.view']->id,
            $permissionModels['products.view']->id,
            $permissionModels['products.edit']->id,
            $permissionModels['campaigns.manage']->id,
        ]);
        $supportRole->permissions()->sync([
            $permissionModels['dashboard.view']->id,
            $permissionModels['orders.view']->id,
            $permissionModels['orders.update']->id,
            $permissionModels['customers.view']->id,
        ]);

        // 3. Create Users
        $createTeam = app(CreateTeam::class);

        $superAdmin = User::updateOrCreate(
            ['email' => 'admin@classymissy.com'],
            [
                'name' => 'Subroto Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role_id' => $superAdminRole->id,
                'is_active' => true,
                'phone' => '+8801700000001',
            ]
        );
        if ($superAdmin->teams()->count() === 0) {
            $createTeam->handle($superAdmin, 'Classy Missy HQ', isPersonal: true);
        }
        $superAdmin->roles()->syncWithoutDetaching([$superAdminRole->id]);

        $manager = User::updateOrCreate(
            ['email' => 'manager@classymissy.com'],
            [
                'name' => 'Sarah Jenkins',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role_id' => $managerRole->id,
                'is_active' => true,
                'phone' => '+8801700000002',
            ]
        );
        if ($manager->teams()->count() === 0) {
            $createTeam->handle($manager, 'Operations Team', isPersonal: true);
        }
        $manager->roles()->syncWithoutDetaching([$managerRole->id]);

        $editor = User::updateOrCreate(
            ['email' => 'editor@classymissy.com'],
            [
                'name' => 'Emma Watson',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role_id' => $editorRole->id,
                'is_active' => true,
                'phone' => '+8801700000003',
            ]
        );
        if ($editor->teams()->count() === 0) {
            $createTeam->handle($editor, 'Creative Team', isPersonal: true);
        }
        $editor->roles()->syncWithoutDetaching([$editorRole->id]);

        // 4. Categories
        $categoriesData = [
            ['name' => 'Skincare', 'slug' => 'skincare', 'description' => 'Everyday care for glowing, healthy skin', 'image' => 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80', 'order' => 1],
            ['name' => 'Makeup', 'slug' => 'makeup', 'description' => 'Color, coverage and beauty essentials', 'image' => 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80', 'order' => 2],
            ['name' => 'Hair care', 'slug' => 'hair-care', 'description' => 'Nourishing care for every hair texture', 'image' => 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80', 'order' => 3],
            ['name' => 'Body care', 'slug' => 'body-care', 'description' => 'Luxurious everyday body rituals', 'image' => 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80', 'order' => 4],
            ['name' => 'Fragrance', 'slug' => 'fragrance', 'description' => 'Find your captivating signature scent', 'image' => 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80', 'order' => 5],
        ];

        $categories = [];
        foreach ($categoriesData as $c) {
            $categories[$c['slug']] = Category::updateOrCreate(['slug' => $c['slug']], $c);
        }

        // 5. Brands
        $brandsData = [
            ['name' => "Paula's Choice", 'slug' => 'paulas-choice', 'description' => 'Smart, safe beauty backed by science', 'logo' => 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80'],
            ['name' => 'PanOxyl', 'slug' => 'panoxyl', 'description' => 'Dermatologist recommended acne care wash', 'logo' => 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=200&q=80'],
            ['name' => 'The Ordinary', 'slug' => 'the-ordinary', 'description' => 'Clinical formulations with integrity', 'logo' => 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=200&q=80'],
            ['name' => 'CeraVe', 'slug' => 'cerave', 'description' => 'Developed with dermatologists for skin barrier restoration', 'logo' => 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=200&q=80'],
        ];

        $brands = [];
        foreach ($brandsData as $b) {
            $brands[$b['slug']] = Brand::updateOrCreate(['slug' => $b['slug']], $b);
        }

        // 6. Products
        $productsData = [
            [
                'name' => 'Skin Perfecting 2% BHA Liquid Exfoliant',
                'slug' => 'paulas-choice-bha',
                'brand_id' => $brands['paulas-choice']->id,
                'category_id' => $categories['skincare']->id,
                'sku' => 'PC-BHA-201',
                'price' => 2550,
                'old_price' => 2750,
                'cost_price' => 1700,
                'stock_quantity' => 45,
                'low_stock_threshold' => 10,
                'rating' => 4.90,
                'reviews_count' => 128,
                'badge' => 'Glow of the day',
                'problems' => ['Sensitive skin', 'Radiance', 'Skin barrier'],
                'highlights' => [
                    ['title' => 'Gentle exfoliation', 'image' => 'https://img.icons8.com/fluency/96/leaf.png'],
                    ['title' => 'Smooth-looking', 'image' => 'https://img.icons8.com/fluency/96/sparkling.png'],
                    ['title' => 'Easy routine', 'image' => 'https://img.icons8.com/fluency/96/water.png'],
                ],
                'image' => 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=720&q=85',
                'gallery' => [
                    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1000&q=90',
                    'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=1000&q=90',
                ],
                'description' => 'A cult-favorite liquid exfoliant with salicylic acid that unclogs pores, smooths wrinkles, and evens out skin tone quickly.',
                'is_active' => true,
                'is_featured' => true,
            ],
            [
                'name' => 'Acne Foaming Wash 10% Benzoyl Peroxide',
                'slug' => 'panoxyl-acne-wash',
                'brand_id' => $brands['panoxyl']->id,
                'category_id' => $categories['skincare']->id,
                'sku' => 'PX-AFW-101',
                'price' => 2340,
                'old_price' => 2590,
                'cost_price' => 1550,
                'stock_quantity' => 28,
                'low_stock_threshold' => 8,
                'rating' => 4.70,
                'reviews_count' => 96,
                'badge' => 'Best seller',
                'problems' => ['Blemishes', 'Oil control', 'Breakout care'],
                'highlights' => [
                    ['title' => 'Daily cleansing', 'image' => 'https://img.icons8.com/fluency/96/water.png'],
                    ['title' => 'Blemish-prone skin', 'image' => 'https://img.icons8.com/fluency/96/face-mask.png'],
                ],
                'image' => 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=720&q=85',
                'gallery' => [
                    'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1000&q=90',
                ],
                'description' => 'Maximum strength antimicrobial foaming wash cleans and unclogs pores on face, chest and back.',
                'is_active' => true,
                'is_featured' => true,
            ],
            [
                'name' => 'Glycolic Acid 7% Exfoliating Toner',
                'slug' => 'ordinary-glycolic-acid',
                'brand_id' => $brands['the-ordinary']->id,
                'category_id' => $categories['skincare']->id,
                'sku' => 'TO-GAT-701',
                'price' => 2900,
                'old_price' => 3100,
                'cost_price' => 1900,
                'stock_quantity' => 52,
                'low_stock_threshold' => 12,
                'rating' => 5.00,
                'reviews_count' => 74,
                'badge' => 'Top pick',
                'problems' => ['Uneven tone', 'Radiance', 'Texture'],
                'highlights' => [
                    ['title' => 'Exfoliating toner', 'image' => 'https://img.icons8.com/fluency/96/water.png'],
                    ['title' => 'Radiance boost', 'image' => 'https://img.icons8.com/fluency/96/sparkling.png'],
                ],
                'image' => 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=720&q=85',
                'gallery' => [
                    'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=1000&q=90',
                ],
                'description' => 'Targeted toning solution formulated to improve skin radiance and texture with continuous use.',
                'is_active' => true,
                'is_featured' => true,
            ],
            [
                'name' => 'Resurfacing Retinol Serum with Ceramides',
                'slug' => 'cerave-retinol-serum',
                'brand_id' => $brands['cerave']->id,
                'category_id' => $categories['skincare']->id,
                'sku' => 'CV-RRS-301',
                'price' => 3150,
                'old_price' => 3450,
                'cost_price' => 2100,
                'stock_quantity' => 7,
                'low_stock_threshold' => 10,
                'rating' => 4.85,
                'reviews_count' => 112,
                'badge' => 'Low Stock',
                'problems' => ['Post-acne marks', 'Pores', 'Texture'],
                'highlights' => [
                    ['title' => 'Encapsulated retinol', 'image' => 'https://img.icons8.com/fluency/96/sparkling.png'],
                    ['title' => 'Skin barrier support', 'image' => 'https://img.icons8.com/fluency/96/leaf.png'],
                ],
                'image' => 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=720&q=85',
                'gallery' => [],
                'description' => 'Developed with dermatologists, helps smooth skin texture by reducing post-acne marks and minimizing the look of pores.',
                'is_active' => true,
                'is_featured' => false,
            ],
            [
                'name' => 'Hydrating Squalane Cleanser for Daily Use',
                'slug' => 'ordinary-squalane-cleanser',
                'brand_id' => $brands['the-ordinary']->id,
                'category_id' => $categories['skincare']->id,
                'sku' => 'TO-SQC-105',
                'price' => 1950,
                'old_price' => 2150,
                'cost_price' => 1250,
                'stock_quantity' => 3,
                'low_stock_threshold' => 8,
                'rating' => 4.65,
                'reviews_count' => 54,
                'badge' => 'Best value',
                'problems' => ['Gentle hydration', 'Makeup removal'],
                'highlights' => [
                    ['title' => 'Squalane based', 'image' => 'https://img.icons8.com/fluency/96/water.png'],
                ],
                'image' => 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=720&q=85',
                'gallery' => [],
                'description' => 'Gentle formula that cleanses skin by removing makeup and impurities while leaving skin moisturized.',
                'is_active' => true,
                'is_featured' => false,
            ],
        ];

        $products = [];
        foreach ($productsData as $p) {
            $products[$p['slug']] = Product::updateOrCreate(['slug' => $p['slug']], $p);
        }

        // 7. Customers
        $customersData = [
            [
                'name' => 'Ayesha Rahman',
                'email' => 'ayesha.rahman@gmail.com',
                'phone' => '+8801711223344',
                'address' => 'House 14, Road 7, Dhanmondi',
                'city' => 'Dhaka',
                'postal_code' => '1205',
                'total_orders' => 4,
                'total_spent' => 10240.00,
                'status' => 'active',
            ],
            [
                'name' => 'Tanvir Ahmed',
                'email' => 'tanvir.ahmed@outlook.com',
                'phone' => '+8801822334455',
                'address' => 'Apt 4B, Gulshan-2 Avenue',
                'city' => 'Dhaka',
                'postal_code' => '1212',
                'total_orders' => 3,
                'total_spent' => 7450.00,
                'status' => 'active',
            ],
            [
                'name' => 'Nusrat Jahan',
                'email' => 'nusrat.jahan@yahoo.com',
                'phone' => '+8801933445566',
                'address' => 'Sector 4, Uttara',
                'city' => 'Dhaka',
                'postal_code' => '1230',
                'total_orders' => 2,
                'total_spent' => 5240.00,
                'status' => 'active',
            ],
            [
                'name' => 'Mahmudul Hasan',
                'email' => 'mahmud.hasan@gmail.com',
                'phone' => '+8801644556677',
                'address' => 'Nasirabad Housing Society',
                'city' => 'Chittagong',
                'postal_code' => '4000',
                'total_orders' => 1,
                'total_spent' => 2550.00,
                'status' => 'active',
            ],
            [
                'name' => 'Sadia Farhana',
                'email' => 'sadia.farhana@gmail.com',
                'phone' => '+8801555667788',
                'address' => 'Zindabazar Point',
                'city' => 'Sylhet',
                'postal_code' => '3100',
                'total_orders' => 5,
                'total_spent' => 14350.00,
                'status' => 'active',
            ],
        ];

        $customers = [];
        foreach ($customersData as $c) {
            $customers[] = Customer::updateOrCreate(['email' => $c['email']], $c);
        }

        // 8. Orders & Items
        $ordersData = [
            [
                'order_number' => 'CM-2026-1001',
                'customer_id' => $customers[0]->id,
                'customer_name' => $customers[0]->name,
                'customer_email' => $customers[0]->email,
                'customer_phone' => $customers[0]->phone,
                'shipping_address' => $customers[0]->address,
                'city' => $customers[0]->city,
                'postal_code' => $customers[0]->postal_code,
                'status' => 'delivered',
                'payment_status' => 'paid',
                'payment_method' => 'card',
                'subtotal' => 4890.00,
                'shipping_fee' => 100.00,
                'discount' => 200.00,
                'total_amount' => 4790.00,
                'placed_at' => now()->subDays(6),
                'items' => [
                    ['product' => $products['paulas-choice-bha'], 'quantity' => 1, 'price' => 2550],
                    ['product' => $products['panoxyl-acne-wash'], 'quantity' => 1, 'price' => 2340],
                ],
            ],
            [
                'order_number' => 'CM-2026-1002',
                'customer_id' => $customers[1]->id,
                'customer_name' => $customers[1]->name,
                'customer_email' => $customers[1]->email,
                'customer_phone' => $customers[1]->phone,
                'shipping_address' => $customers[1]->address,
                'city' => $customers[1]->city,
                'postal_code' => $customers[1]->postal_code,
                'status' => 'shipped',
                'payment_status' => 'paid',
                'payment_method' => 'bkash',
                'subtotal' => 2900.00,
                'shipping_fee' => 80.00,
                'discount' => 0.00,
                'total_amount' => 2980.00,
                'placed_at' => now()->subDays(3),
                'items' => [
                    ['product' => $products['ordinary-glycolic-acid'], 'quantity' => 1, 'price' => 2900],
                ],
            ],
            [
                'order_number' => 'CM-2026-1003',
                'customer_id' => $customers[2]->id,
                'customer_name' => $customers[2]->name,
                'customer_email' => $customers[2]->email,
                'customer_phone' => $customers[2]->phone,
                'shipping_address' => $customers[2]->address,
                'city' => $customers[2]->city,
                'postal_code' => $customers[2]->postal_code,
                'status' => 'processing',
                'payment_status' => 'paid',
                'payment_method' => 'card',
                'subtotal' => 5100.00,
                'shipping_fee' => 100.00,
                'discount' => 150.00,
                'total_amount' => 5050.00,
                'placed_at' => now()->subDay(),
                'items' => [
                    ['product' => $products['cerave-retinol-serum'], 'quantity' => 1, 'price' => 3150],
                    ['product' => $products['ordinary-squalane-cleanser'], 'quantity' => 1, 'price' => 1950],
                ],
            ],
            [
                'order_number' => 'CM-2026-1004',
                'customer_id' => $customers[3]->id,
                'customer_name' => $customers[3]->name,
                'customer_email' => $customers[3]->email,
                'customer_phone' => $customers[3]->phone,
                'shipping_address' => $customers[3]->address,
                'city' => $customers[3]->city,
                'postal_code' => $customers[3]->postal_code,
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'payment_method' => 'cash_on_delivery',
                'subtotal' => 2550.00,
                'shipping_fee' => 120.00,
                'discount' => 0.00,
                'total_amount' => 2670.00,
                'placed_at' => now()->subHours(5),
                'items' => [
                    ['product' => $products['paulas-choice-bha'], 'quantity' => 1, 'price' => 2550],
                ],
            ],
            [
                'order_number' => 'CM-2026-1005',
                'customer_id' => $customers[4]->id,
                'customer_name' => $customers[4]->name,
                'customer_email' => $customers[4]->email,
                'customer_phone' => $customers[4]->phone,
                'shipping_address' => $customers[4]->address,
                'city' => $customers[4]->city,
                'postal_code' => $customers[4]->postal_code,
                'status' => 'delivered',
                'payment_status' => 'paid',
                'payment_method' => 'card',
                'subtotal' => 8390.00,
                'shipping_fee' => 120.00,
                'discount' => 300.00,
                'total_amount' => 8210.00,
                'placed_at' => now()->subDays(10),
                'items' => [
                    ['product' => $products['paulas-choice-bha'], 'quantity' => 2, 'price' => 2550],
                    ['product' => $products['ordinary-glycolic-acid'], 'quantity' => 1, 'price' => 2900],
                ],
            ],
        ];

        foreach ($ordersData as $oData) {
            $items = $oData['items'];
            unset($oData['items']);

            $order = Order::updateOrCreate(
                ['order_number' => $oData['order_number']],
                $oData
            );

            // Delete old items if re-seeding
            $order->items()->delete();

            foreach ($items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product']->id,
                    'product_name' => $item['product']->name,
                    'product_image' => $item['product']->image,
                    'price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'total' => $item['price'] * $item['quantity'],
                ]);
            }
        }

        // 9. Campaigns
        Campaign::updateOrCreate(
            ['slug' => 'glow-essentials'],
            [
                'title' => 'Glow Essentials',
                'eyebrow' => 'Your glow, your routine',
                'description' => 'Discover feel-good skincare picks for a fresh, radiant look.',
                'image' => 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80',
                'product_ids' => ['paulas-choice-bha', 'ordinary-glycolic-acid'],
                'discount_percentage' => 15,
                'is_active' => true,
                'start_date' => now()->subDays(5),
                'end_date' => now()->addDays(25),
            ]
        );

        Campaign::updateOrCreate(
            ['slug' => 'skin-reset'],
            [
                'title' => 'The Skin Reset',
                'eyebrow' => 'A little care goes a long way',
                'description' => 'Build a simple routine with customer-loved daily essentials.',
                'image' => 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
                'product_ids' => ['panoxyl-acne-wash', 'cerave-retinol-serum'],
                'discount_percentage' => 10,
                'is_active' => true,
                'start_date' => now()->subDays(2),
                'end_date' => now()->addDays(20),
            ]
        );
    }
}
