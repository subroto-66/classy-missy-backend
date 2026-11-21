export type RolePermission = {
    id: number;
    name: string;
    slug: string;
    group: string;
    description?: string;
};

export type Role = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_system: boolean;
    users_count: number;
    permissions: RolePermission[];
    created_at: string;
};

export type AdminUser = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    is_active: boolean;
    role: {
        id: number;
        name: string;
        slug: string;
    } | null;
    created_at: string;
};

export type Category = {
    id: number;
    name: string;
    slug: string;
    image: string | null;
    description: string | null;
    is_active: boolean;
    order: number;
    products_count?: number;
    created_at?: string;
};

export type Brand = {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    description: string | null;
    website: string | null;
    is_active: boolean;
    products_count?: number;
    created_at?: string;
};

export type Product = {
    id: number;
    name: string;
    slug: string;
    brand_id: number | null;
    category_id: number | null;
    sku: string;
    price: number | string;
    old_price: number | string | null;
    cost_price: number | string | null;
    stock_quantity: number;
    low_stock_threshold: number;
    rating: number | string;
    reviews_count: number;
    badge: string | null;
    problems: string[] | null;
    highlights: Array<{ title: string; image: string }> | null;
    image: string | null;
    gallery: string[] | null;
    description: string | null;
    is_active: boolean;
    is_featured: boolean;
    brand?: Brand | null;
    category?: Category | null;
    created_at?: string;
};

export type OrderItem = {
    id: number;
    product_name: string;
    product_image: string | null;
    price: number;
    quantity: number;
    total: number;
};

export type Order = {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    shipping_address: string;
    city: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_status: 'unpaid' | 'paid' | 'refunded';
    payment_method: string;
    subtotal: number;
    shipping_fee: number;
    discount: number;
    total_amount: number;
    notes: string | null;
    placed_at: string;
    items?: OrderItem[];
    items_count?: number;
};

export type Customer = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    postal_code: string | null;
    country: string;
    avatar: string | null;
    total_orders: number;
    total_spent: number;
    status: 'active' | 'inactive' | 'blocked';
    orders_count?: number;
    created_at?: string;
};

export type Campaign = {
    id: number;
    title: string;
    slug: string;
    eyebrow: string | null;
    description: string | null;
    image: string | null;
    placement?: 'slider' | 'promo' | 'flash' | 'middle' | 'bottom' | string;
    link?: string | null;
    order?: number;
    product_ids: string[] | null;
    discount_percentage: number;
    is_active: boolean;
    start_date: string | null;
    end_date: string | null;
    created_at?: string;
};

export type BlogArticle = {
    id: number;
    title: string;
    slug: string;
    category: string;
    published_at: string | null;
    read_time: string;
    image: string | null;
    image_alt?: string | null;
    excerpt: string | null;
    intro?: string | null;
    content?: string[] | string | null;
    sections?: Array<{
        heading: string;
        paragraphs: string[];
        bullets?: string[];
    }> | null;
    key_takeaways?: string[] | null;
    is_published: boolean;
    created_at?: string;
};

export type Slider = {
    id: number;
    title: string | null;
    subtitle: string | null;
    badge_text: string | null;
    button_text: string | null;
    image: string;
    image_alt?: string | null;
    link: string | null;
    order: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
};

export type LandingPagePackage = {
    id: string;
    name: string;
    quantity: number;
    price: number;
    old_price: number;
    tag?: string;
    free_delivery: boolean;
    popular: boolean;
};

export type LandingPage = {
    id: number;
    product_id: number | null;
    product?: Product | null;
    title: string;
    slug: string;
    badge: string | null;
    hotline: string | null;
    whatsapp: string | null;
    announcement_text: string | null;
    countdown_enabled: boolean;
    countdown_hours: number;
    headline: string | null;
    subheadline: string | null;
    hero_description: string | null;
    video_url: string | null;
    banner_image: string | null;
    gallery_images: string[] | null;
    packages: LandingPagePackage[] | null;
    delivery_inside_dhaka: number;
    delivery_outside_dhaka: number;
    features: { title: string; desc: string; icon: string }[] | null;
    benefits: { title: string; desc: string; icon: string }[] | null;
    steps: { step: string; title: string; desc: string }[] | null;
    reviews: { name: string; location: string; comment: string; rating: number; date: string }[] | null;
    faqs: { q: string; a: string }[] | null;
    guarantee_text: string | null;
    is_active: boolean;
    is_default_for_product: boolean;
    order: number;
    meta_title: string | null;
    meta_description: string | null;
    created_at?: string;
    updated_at?: string;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};
