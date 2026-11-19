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
