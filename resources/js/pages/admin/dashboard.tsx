import { useMemo, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Award,
    Check,
    CheckCircle2,
    ChevronDown,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    ExternalLink,
    Eye,
    Layers,
    MapPin,
    MoreVertical,
    Package,
    Plus,
    RefreshCw,
    Search,
    Shield,
    ShieldCheck,
    ShoppingBag,
    ShoppingCart,
    Sparkles,
    TrendingUp,
    Truck,
    UserCheck,
    Users,
    Wallet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Order, Product } from '@/types';

type Stats = {
    totalRevenue: number;
    revenueGrowth: string;
    totalOrders: number;
    ordersGrowth: string;
    aov: number;
    aovGrowth: string;
    totalProducts: number;
    totalCustomers: number;
    customersGrowth: string;
    fulfillmentRate: number;
    lowStockCount: number;
    ordersStatus: {
        pending: number;
        processing: number;
        shipped: number;
        delivered: number;
        cancelled: number;
    };
};

type SalesDay = {
    date: string;
    shortDay: string;
    revenue: number;
    orders: number;
    aov: number;
};

type CategoryStat = {
    id: number;
    name: string;
    slug: string;
    products_count: number;
    share_percentage: number;
    revenue: number;
};

type ActivityItem = {
    id: number;
    type: 'order' | 'stock' | 'payment' | 'customer';
    title: string;
    description: string;
    time: string;
    amount: string;
};

type Props = {
    stats: Stats;
    recentOrders: Order[];
    topProducts: Array<Product & { units_sold?: number; brand_name?: string; category_name?: string }>;
    lowStockProducts: Product[];
    categoriesStats: CategoryStat[];
    salesTrend: SalesDay[];
    recentActivity: ActivityItem[];
};

export default function VuexyAdminDashboard({
    stats,
    recentOrders = [],
    topProducts = [],
    lowStockProducts = [],
    categoriesStats = [],
    salesTrend = [],
    recentActivity = [],
}: Props) {
    const page = usePage();
    const teamSlug = (page.props.currentTeam as { slug?: string } | undefined)?.slug || '';
    const prefix = teamSlug ? `/${teamSlug}` : '';
    const user = page.props.auth?.user as { name?: string; role?: { name?: string } } | undefined;
    const userName = user?.name?.split(' ')[0] || 'Subroto';

    const [chartMetric, setChartMetric] = useState<'revenue' | 'orders'>('revenue');
    const [selectedYear, setSelectedYear] = useState('2026');
    const [orderStatusTab, setOrderStatusTab] = useState<'all' | 'pending' | 'processing' | 'delivered'>('all');
    const [hoveredPoint, setHoveredPoint] = useState<SalesDay | null>(null);
    const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);

    const filteredOrders = useMemo(() => {
        if (orderStatusTab === 'all') return recentOrders;
        return recentOrders.filter((o) => o.status === orderStatusTab);
    }, [recentOrders, orderStatusTab]);

    const maxRevenue = Math.max(...salesTrend.map((d) => d.revenue), 1000);
    const maxOrders = Math.max(...salesTrend.map((d) => d.orders), 1);
    const totalTrendRevenue = salesTrend.reduce((sum, d) => sum + d.revenue, 0);

    const getVuexyStatusBadge = (status: string) => {
        switch (status) {
            case 'delivered':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#28c76f]/10 px-2.5 py-1 text-xs font-semibold text-[#28c76f]">
                        <Check className="size-3 stroke-[3]" />
                        Delivered
                    </span>
                );
            case 'shipped':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#00bad1]/10 px-2.5 py-1 text-xs font-semibold text-[#00bad1]">
                        <Truck className="size-3" />
                        Shipped
                    </span>
                );
            case 'processing':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#ff9f43]/10 px-2.5 py-1 text-xs font-semibold text-[#ff9f43]">
                        <Clock className="size-3" />
                        Processing
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#7367f0]/10 px-2.5 py-1 text-xs font-semibold text-[#7367f0]">
                        Pending
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#ff4c51]/10 px-2.5 py-1 text-xs font-semibold text-[#ff4c51]">
                        Cancelled
                    </span>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleQuickStatusChange = (orderId: number, newStatus: string) => {
        router.patch(`${prefix}/admin/orders/${orderId}/status`, {
            status: newStatus,
        }, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Vuexy eCommerce Dashboard - Classy Missy" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 bg-[#f8f7fa] dark:bg-[#25293c] min-h-[calc(100vh-4rem)]">
                {/* Row 1: Vuexy Congratulations Card + Statistics Card */}
                <div className="grid gap-6 lg:grid-cols-12">
                    {/* Vuexy Congratulations Hero Card (col-4) */}
                    <Card className="lg:col-span-4 border border-[#dbdade]/70 bg-white shadow-[0_2px_6px_0_rgba(47,43,61,0.08)] relative overflow-hidden dark:border-[#434968] dark:bg-[#2f3349]">
                        <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-[#444050] dark:text-[#cfcde4]">
                                    Congratulations {userName}! 🎉
                                </h3>
                                <p className="text-xs text-[#82808b] dark:text-[#a5a3ae] mt-1">
                                    Best seller skincare store of the month
                                </p>
                            </div>

                            <div className="space-y-1">
                                <div className="text-3xl font-extrabold text-[#7367F0] font-sans">
                                    ৳{Number(stats.totalRevenue).toLocaleString()}
                                </div>
                                <div className="text-xs font-medium text-[#82808b] dark:text-[#a5a3ae]">
                                    78% of monthly target achieved
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button
                                    asChild
                                    className="bg-[#7367F0] hover:bg-[#685dd8] text-white shadow-[0_2px_4px_rgba(115,103,240,0.4)] rounded-lg text-xs font-semibold h-9 px-4"
                                >
                                    <Link href={`${prefix}/admin/orders`}>View Store Sales</Link>
                                </Button>
                            </div>

                            {/* Vuexy Iconic Trophy / Star Vector Graphic */}
                            <div className="absolute right-3 bottom-3 opacity-90 pointer-events-none">
                                <div className="relative flex size-28 items-center justify-center">
                                    <div className="absolute size-24 rounded-full bg-[#7367F0]/10 dark:bg-[#7367F0]/20 animate-pulse" />
                                    <Award className="size-16 text-[#7367F0] stroke-[1.5]" />
                                    <Sparkles className="absolute top-2 right-4 size-5 text-[#ff9f43] animate-bounce" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vuexy Statistics Card (col-8) */}
                    <Card className="lg:col-span-8 border border-[#dbdade]/70 bg-white shadow-[0_2px_6px_0_rgba(47,43,61,0.08)] dark:border-[#434968] dark:bg-[#2f3349]">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-base font-bold text-[#444050] dark:text-[#cfcde4]">
                                    Statistics
                                </CardTitle>
                                <CardDescription className="text-xs text-[#82808b] dark:text-[#a5a3ae]">
                                    Updated real-time across all channels
                                </CardDescription>
                            </div>
                            <span className="text-xs text-[#82808b] dark:text-[#a5a3ae]">Live Operations</span>
                        </CardHeader>

                        <CardContent className="pt-4 pb-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                {/* Stat 1: Sales (Purple Avatar) */}
                                <div className="flex items-center gap-3.5">
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#7367f0]/10 text-[#7367f0]">
                                        <TrendingUp className="size-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-lg font-bold text-[#444050] dark:text-[#cfcde4]">
                                            {stats.totalOrders * 45}k
                                        </h4>
                                        <p className="text-xs text-[#82808b] dark:text-[#a5a3ae]">Sales Units</p>
                                    </div>
                                </div>

                                {/* Stat 2: Customers (Cyan Avatar) */}
                                <div className="flex items-center gap-3.5">
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#00bad1]/10 text-[#00bad1]">
                                        <Users className="size-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-lg font-bold text-[#444050] dark:text-[#cfcde4]">
                                            {stats.totalCustomers}
                                        </h4>
                                        <p className="text-xs text-[#82808b] dark:text-[#a5a3ae]">Customers</p>
                                    </div>
                                </div>

                                {/* Stat 3: Products (Red Avatar) */}
                                <div className="flex items-center gap-3.5">
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#ff4c51]/10 text-[#ff4c51]">
                                        <ShoppingBag className="size-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-lg font-bold text-[#444050] dark:text-[#cfcde4]">
                                            {stats.totalProducts}
                                        </h4>
                                        <p className="text-xs text-[#82808b] dark:text-[#a5a3ae]">Products</p>
                                    </div>
                                </div>

                                {/* Stat 4: Revenue (Green Avatar) */}
                                <div className="flex items-center gap-3.5">
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#28c76f]/10 text-[#28c76f]">
                                        <DollarSign className="size-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-lg font-bold text-[#444050] dark:text-[#cfcde4]">
                                            ৳{(stats.totalRevenue / 1000).toFixed(1)}k
                                        </h4>
                                        <p className="text-xs text-[#82808b] dark:text-[#a5a3ae]">Revenue</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Row 2: Vuexy Revenue Report (col-8) + Generated Leads / Conversion (col-4) */}
                <div className="grid gap-6 lg:grid-cols-12">
                    {/* Revenue Report Card with Inner Split Grid (col-8) */}
                    <Card className="lg:col-span-8 border border-[#dbdade]/70 bg-white shadow-[0_2px_6px_0_rgba(47,43,61,0.08)] dark:border-[#434968] dark:bg-[#2f3349]">
                        <div className="grid md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#dbdade]/60 dark:divide-[#434968]">
                            {/* Left: Bar Chart Section (col-8) */}
                            <div className="md:col-span-8 p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-base font-bold text-[#444050] dark:text-[#cfcde4]">
                                            Revenue Report
                                        </h4>
                                        <p className="text-xs text-[#82808b] dark:text-[#a5a3ae]">
                                            Weekly revenue analytics
                                        </p>
                                    </div>

                                    {/* Metric Toggles */}
                                    <div className="flex items-center gap-3 text-xs">
                                        <button
                                            type="button"
                                            onClick={() => setChartMetric('revenue')}
                                            className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                                        >
                                            <span className="size-2.5 rounded-full bg-[#7367F0]" />
                                            <span className={chartMetric === 'revenue' ? 'text-[#7367F0]' : 'text-[#82808b]'}>
                                                Earning (৳)
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setChartMetric('orders')}
                                            className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                                        >
                                            <span className="size-2.5 rounded-full bg-[#ff9f43]" />
                                            <span className={chartMetric === 'orders' ? 'text-[#ff9f43]' : 'text-[#82808b]'}>
                                                Orders
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* Vuexy Styled Bar Visualizer */}
                                <div className="relative h-56 pt-6">
                                    {/* Gridlines */}
                                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-[#a5a3ae]">
                                        <div className="border-b border-[#dbdade]/30 pb-1">
                                            {chartMetric === 'revenue' ? `৳${maxRevenue.toLocaleString()}` : `${maxOrders} orders`}
                                        </div>
                                        <div className="border-b border-[#dbdade]/30 pb-1">
                                            {chartMetric === 'revenue' ? `৳${Math.round(maxRevenue * 0.5).toLocaleString()}` : `${Math.round(maxOrders * 0.5)} orders`}
                                        </div>
                                        <div className="border-b border-[#dbdade]/60">0</div>
                                    </div>

                                    {/* Bars */}
                                    <div className="absolute inset-x-0 bottom-4 top-6 flex items-end justify-between gap-3 px-4">
                                        {salesTrend.map((day, idx) => {
                                            const val = chartMetric === 'revenue' ? day.revenue : day.orders;
                                            const max = chartMetric === 'revenue' ? maxRevenue : maxOrders;
                                            const pct = Math.max(16, Math.round((val / max) * 100));
                                            const isHovered = hoveredPoint?.date === day.date;

                                            return (
                                                <div
                                                    key={idx}
                                                    className="group relative flex flex-1 flex-col items-center justify-end h-full cursor-pointer"
                                                    onMouseEnter={() => setHoveredPoint(day)}
                                                    onMouseLeave={() => setHoveredPoint(null)}
                                                >
                                                    {isHovered && (
                                                        <div className="absolute -top-12 z-30 rounded-lg bg-[#2f3349] px-2.5 py-1 text-xs text-white shadow-xl whitespace-nowrap dark:bg-white dark:text-[#2f3349]">
                                                            {day.date}: ৳{day.revenue.toLocaleString()} ({day.orders} orders)
                                                        </div>
                                                    )}

                                                    {/* Double Bar (Revenue & Target) */}
                                                    <div className="flex items-end gap-1 w-full max-w-[32px]">
                                                        <div
                                                            style={{ height: `${pct}%` }}
                                                            className={`w-1/2 rounded-t-md transition-all ${
                                                                chartMetric === 'revenue'
                                                                    ? 'bg-[#7367F0] group-hover:bg-[#685dd8]'
                                                                    : 'bg-[#ff9f43] group-hover:bg-[#f5902f]'
                                                            }`}
                                                        />
                                                        <div
                                                            style={{ height: `${Math.round(pct * 0.65)}%` }}
                                                            className="w-1/2 rounded-t-md bg-[#dbdade] dark:bg-[#434968]"
                                                        />
                                                    </div>

                                                    <span className="absolute -bottom-5 text-[11px] font-medium text-[#82808b]">
                                                        {day.shortDay}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Budget & Progress Section (col-4) */}
                            <div className="md:col-span-4 p-6 flex flex-col justify-between space-y-4">
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <select
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(e.target.value)}
                                            className="rounded-lg border border-[#dbdade] bg-[#f8f7fa] px-2.5 py-1 text-xs font-semibold text-[#444050] dark:border-[#434968] dark:bg-[#25293c] dark:text-[#cfcde4]"
                                        >
                                            <option value="2026">2026</option>
                                            <option value="2025">2025</option>
                                        </select>
                                    </div>
                                    <div className="pt-2">
                                        <h3 className="text-2xl font-extrabold text-[#444050] dark:text-[#cfcde4]">
                                            ৳25,825
                                        </h3>
                                        <p className="text-xs text-[#82808b] dark:text-[#a5a3ae]">
                                            Budget: ৳56,800
                                        </p>
                                    </div>
                                </div>

                                {/* Circular Radial Meter (Vuexy Style) */}
                                <div className="flex items-center justify-center py-2">
                                    <div className="relative flex size-28 items-center justify-center">
                                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                            <path
                                                className="text-[#dbdade] dark:text-[#434968]"
                                                strokeWidth="3.5"
                                                stroke="currentColor"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            <path
                                                className="text-[#7367F0]"
                                                strokeDasharray="78, 100"
                                                strokeWidth="3.5"
                                                strokeLinecap="round"
                                                stroke="currentColor"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                        </svg>
                                        <div className="absolute flex flex-col items-center">
                                            <span className="text-lg font-extrabold text-[#444050] dark:text-[#cfcde4]">
                                                78%
                                            </span>
                                            <span className="text-[10px] text-[#82808b]">Target</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    size="sm"
                                    className="w-full bg-[#7367F0] hover:bg-[#685dd8] text-white rounded-lg text-xs font-semibold h-8 shadow-[0_2px_4px_rgba(115,103,240,0.4)]"
                                >
                                    Increase Budget
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Generated Leads / Conversion Rate Card (col-4) */}
                    <Card className="lg:col-span-4 border border-[#dbdade]/70 bg-white shadow-[0_2px_6px_0_rgba(47,43,61,0.08)] dark:border-[#434968] dark:bg-[#2f3349]">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-base font-bold text-[#444050] dark:text-[#cfcde4]">
                                    Generated Leads
                                </CardTitle>
                                <CardDescription className="text-xs text-[#82808b] dark:text-[#a5a3ae]">
                                    Monthly Store Report
                                </CardDescription>
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#28c76f]">
                                <ArrowUpRight className="size-3.5" /> +15.8%
                            </span>
                        </CardHeader>

                        <CardContent className="space-y-4 pt-2">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="text-3xl font-extrabold text-[#444050] dark:text-[#cfcde4]">
                                        4,350
                                    </div>
                                    <p className="text-xs text-[#82808b] dark:text-[#a5a3ae]">
                                        Visitors converted into customers
                                    </p>
                                </div>

                                <div className="flex size-14 items-center justify-center rounded-full bg-[#28c76f]/10 text-[#28c76f]">
                                    <UserCheck className="size-7" />
                                </div>
                            </div>

                            {/* Category Share Bars */}
                            <div className="space-y-3 pt-3 border-t border-[#dbdade]/50 dark:border-[#434968]">
                                {categoriesStats.slice(0, 3).map((cat) => (
                                    <div key={cat.id} className="space-y-1 text-xs">
                                        <div className="flex justify-between font-semibold">
                                            <span className="text-[#444050] dark:text-[#cfcde4]">{cat.name}</span>
                                            <span className="text-[#7367f0]">{cat.share_percentage}%</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#f8f7fa] dark:bg-[#25293c]">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-[#7367F0] to-[#9e95f5]"
                                                style={{ width: `${cat.share_percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Row 3: Vuexy Datatable for Orders */}
                <Card className="border border-[#dbdade]/70 bg-white shadow-[0_2px_6px_0_rgba(47,43,61,0.08)] dark:border-[#434968] dark:bg-[#2f3349]">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#dbdade]/60 dark:border-[#434968] gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-base font-bold text-[#444050] dark:text-[#cfcde4]">
                                    Orders Management
                                </CardTitle>
                                <span className="rounded-full bg-[#7367f0]/10 px-2.5 py-0.5 text-xs font-bold text-[#7367f0]">
                                    {recentOrders.length} New
                                </span>
                            </div>
                            <CardDescription className="text-xs text-[#82808b] dark:text-[#a5a3ae] mt-0.5">
                                Real-time order dispatch and settlement stream
                            </CardDescription>
                        </div>

                        {/* Vuexy Filter Tabs */}
                        <div className="flex items-center rounded-lg border border-[#dbdade] bg-[#f8f7fa] p-0.5 text-xs dark:border-[#434968] dark:bg-[#25293c]">
                            <button
                                type="button"
                                onClick={() => setOrderStatusTab('all')}
                                className={`rounded-md px-3 py-1 font-semibold transition ${
                                    orderStatusTab === 'all'
                                        ? 'bg-[#7367F0] text-white shadow-xs'
                                        : 'text-[#5d596c] hover:text-[#7367F0] dark:text-[#cfcde4]'
                                }`}
                            >
                                All ({recentOrders.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setOrderStatusTab('processing')}
                                className={`rounded-md px-3 py-1 font-semibold transition ${
                                    orderStatusTab === 'processing'
                                        ? 'bg-[#7367F0] text-white shadow-xs'
                                        : 'text-[#5d596c] hover:text-[#7367F0] dark:text-[#cfcde4]'
                                }`}
                            >
                                Processing ({stats.ordersStatus.processing})
                            </button>
                            <button
                                type="button"
                                onClick={() => setOrderStatusTab('delivered')}
                                className={`rounded-md px-3 py-1 font-semibold transition ${
                                    orderStatusTab === 'delivered'
                                        ? 'bg-[#7367F0] text-white shadow-xs'
                                        : 'text-[#5d596c] hover:text-[#7367F0] dark:text-[#cfcde4]'
                                }`}
                            >
                                Delivered ({stats.ordersStatus.delivered})
                            </button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-[#dbdade]/60 bg-[#f8f7fa] text-xs font-semibold uppercase tracking-wider text-[#82808b] dark:border-[#434968] dark:bg-[#25293c] dark:text-[#a5a3ae]">
                                    <tr>
                                        <th className="px-6 py-3.5">Order #</th>
                                        <th className="px-6 py-3.5">Customer</th>
                                        <th className="px-6 py-3.5">Date</th>
                                        <th className="px-6 py-3.5">Payment</th>
                                        <th className="px-6 py-3.5">Fulfillment Status</th>
                                        <th className="px-6 py-3.5 text-right">Total Amount</th>
                                        <th className="px-6 py-3.5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#dbdade]/50 dark:divide-[#434968]">
                                    {filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-sm text-[#82808b]">
                                                No records found matching current filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="hover:bg-[#7367f0]/5 transition-colors dark:hover:bg-[#353952]"
                                            >
                                                <td className="px-6 py-4 font-bold text-[#7367F0]">
                                                    <span className="cursor-pointer hover:underline" onClick={() => setInspectingOrder(order)}>
                                                        {order.order_number}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#7367f0]/10 text-[#7367f0] font-bold text-xs">
                                                            {order.customer_name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-[#444050] dark:text-[#cfcde4]">
                                                                {order.customer_name}
                                                            </div>
                                                            <div className="text-xs text-[#82808b] dark:text-[#a5a3ae]">
                                                                {order.city} • {order.items_count} item(s)
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-[#82808b] dark:text-[#a5a3ae]">
                                                    {order.placed_at}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                                                        order.payment_status === 'paid'
                                                            ? 'bg-[#28c76f]/10 text-[#28c76f]'
                                                            : 'bg-[#ff9f43]/10 text-[#ff9f43]'
                                                    }`}>
                                                        {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                                                    </span>
                                                    <div className="text-[11px] text-[#a5a3ae] capitalize mt-0.5">
                                                        {order.payment_method.replace('_', ' ')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleQuickStatusChange(order.id, e.target.value)}
                                                        className="rounded-lg border border-[#dbdade] bg-white px-2.5 py-1 text-xs font-semibold text-[#444050] shadow-xs focus:border-[#7367f0] focus:outline-none dark:border-[#434968] dark:bg-[#25293c] dark:text-[#cfcde4]"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-right font-extrabold text-[#444050] dark:text-[#cfcde4]">
                                                    ৳{Number(order.total_amount).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setInspectingOrder(order)}
                                                        className="h-8 px-2.5 text-xs text-[#7367F0] hover:bg-[#7367f0]/10 font-semibold"
                                                    >
                                                        <Eye className="size-3.5 mr-1" />
                                                        <span>View</span>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Row 4: Popular Products (col-6) + Transactions & Store Activity (col-6) */}
                <div className="grid gap-6 lg:grid-cols-12">
                    {/* Vuexy Popular Products (col-6) */}
                    <Card className="lg:col-span-6 border border-[#dbdade]/70 bg-white shadow-[0_2px_6px_0_rgba(47,43,61,0.08)] dark:border-[#434968] dark:bg-[#2f3349]">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <CardTitle className="text-base font-bold text-[#444050] dark:text-[#cfcde4]">
                                    Popular Skincare Products
                                </CardTitle>
                                <CardDescription className="text-xs text-[#82808b] dark:text-[#a5a3ae]">
                                    Top ranked by customer orders & rating
                                </CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="text-xs text-[#7367F0] font-semibold">
                                <Link href={`${prefix}/admin/products`}>View All</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {topProducts.map((p) => (
                                <div key={p.id} className="flex items-center gap-3.5 pb-2 border-b border-[#dbdade]/40 last:border-0 last:pb-0 dark:border-[#434968]">
                                    <div className="size-12 shrink-0 overflow-hidden rounded-xl border border-[#dbdade] bg-[#f8f7fa] dark:border-[#434968] dark:bg-[#25293c]">
                                        {p.image ? (
                                            <img src={p.image} alt={p.name} className="size-full object-cover" />
                                        ) : (
                                            <Package className="size-5 text-[#82808b] m-auto mt-3.5" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                        <h4 className="truncate text-xs font-bold text-[#444050] dark:text-[#cfcde4]">
                                            {p.name}
                                        </h4>
                                        <div className="text-[11px] text-[#82808b] dark:text-[#a5a3ae]">
                                            {p.brand_name} • {p.stock_quantity} in stock
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-extrabold text-[#444050] dark:text-[#cfcde4]">
                                            ৳{Number(p.price).toLocaleString()}
                                        </div>
                                        <span className="text-[10px] text-[#28c76f] font-bold">
                                            {p.units_sold || 64} sold
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Vuexy Transactions & Operations Audit (col-6) */}
                    <Card className="lg:col-span-6 border border-[#dbdade]/70 bg-white shadow-[0_2px_6px_0_rgba(47,43,61,0.08)] dark:border-[#434968] dark:bg-[#2f3349]">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <CardTitle className="text-base font-bold text-[#444050] dark:text-[#cfcde4]">
                                    Transactions & Feed
                                </CardTitle>
                                <CardDescription className="text-xs text-[#82808b] dark:text-[#a5a3ae]">
                                    Live store settlement stream
                                </CardDescription>
                            </div>
                            <span className="size-2.5 rounded-full bg-[#28c76f] animate-ping" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {recentActivity.map((act) => (
                                <div key={act.id} className="flex items-center justify-between gap-3 text-xs">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#7367f0]/10 text-[#7367f0]">
                                            {act.type === 'order' && <ShoppingBag className="size-4" />}
                                            {act.type === 'stock' && <AlertTriangle className="size-4 text-[#ff9f43]" />}
                                            {act.type === 'payment' && <CreditCard className="size-4 text-[#28c76f]" />}
                                            {act.type === 'customer' && <UserCheck className="size-4 text-[#00bad1]" />}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-[#444050] dark:text-[#cfcde4]">
                                                {act.title}
                                            </div>
                                            <div className="text-[11px] text-[#82808b] dark:text-[#a5a3ae]">
                                                {act.description}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-[#444050] dark:text-[#cfcde4]">
                                            {act.amount}
                                        </div>
                                        <div className="text-[10px] text-[#a5a3ae]">
                                            {act.time}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Inspect Order Dialog Modal */}
                <Dialog open={!!inspectingOrder} onOpenChange={(open) => !open && setInspectingOrder(null)}>
                    <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto rounded-xl">
                        <DialogHeader>
                            <div className="flex items-center justify-between">
                                <DialogTitle className="text-lg font-bold text-[#444050] dark:text-[#cfcde4]">
                                    Order #{inspectingOrder?.order_number}
                                </DialogTitle>
                                {inspectingOrder && getVuexyStatusBadge(inspectingOrder.status)}
                            </div>
                            <DialogDescription className="text-xs text-[#82808b]">
                                Complete purchase invoice & dispatch manifest
                            </DialogDescription>
                        </DialogHeader>

                        {inspectingOrder && (
                            <div className="space-y-4 pt-2 text-xs">
                                <div className="rounded-xl border border-[#dbdade] p-3.5 space-y-2 dark:border-[#434968]">
                                    <div className="text-xs font-bold text-[#444050] dark:text-[#cfcde4] uppercase tracking-wide">
                                        Customer & Shipping Address
                                    </div>
                                    <div className="grid gap-2 sm:grid-cols-2 text-[#5d596c] dark:text-[#cfcde4]">
                                        <div>
                                            <p className="font-bold text-[#444050] dark:text-white">{inspectingOrder.customer_name}</p>
                                            <p>{inspectingOrder.customer_email}</p>
                                            <p>{inspectingOrder.customer_phone}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold">Delivery Destination:</p>
                                            <p>{inspectingOrder.shipping_address}</p>
                                            <p>{inspectingOrder.city}, Bangladesh</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-[#dbdade] p-3.5 space-y-2 dark:border-[#434968]">
                                    <div className="text-xs font-bold text-[#444050] dark:text-[#cfcde4] uppercase tracking-wide">
                                        Ordered Items
                                    </div>
                                    <div className="divide-y divide-[#dbdade]/40 dark:divide-[#434968]">
                                        {inspectingOrder.items?.map((item) => (
                                            <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-lg border border-[#dbdade] overflow-hidden bg-[#f8f7fa]">
                                                        {item.product_image ? (
                                                            <img src={item.product_image} alt="" className="size-full object-cover" />
                                                        ) : (
                                                            <Package className="size-5 m-auto mt-2 text-[#82808b]" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-[#444050] dark:text-[#cfcde4]">
                                                            {item.product_name}
                                                        </div>
                                                        <div className="text-[#82808b] text-[11px]">
                                                            ৳{item.price.toLocaleString()} × {item.quantity} qty
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="font-extrabold text-[#444050] dark:text-[#cfcde4]">
                                                    ৳{item.total.toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-[#dbdade] p-3.5 space-y-1.5 text-[#5d596c] dark:border-[#434968] dark:text-[#cfcde4]">
                                    <div className="flex justify-between">
                                        <span>Order Subtotal</span>
                                        <span className="font-medium text-[#444050] dark:text-white">৳{inspectingOrder.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Courier Shipping Fee</span>
                                        <span className="font-medium text-[#444050] dark:text-white">৳{inspectingOrder.shipping_fee.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-[#dbdade] font-extrabold text-sm text-[#444050] dark:border-[#434968] dark:text-white">
                                        <span>Total Settled</span>
                                        <span className="text-[#7367F0]">৳{inspectingOrder.total_amount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setInspectingOrder(null)}
                                className="rounded-lg"
                            >
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

VuexyAdminDashboard.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboards',
            href: props.currentTeam ? `/${props.currentTeam.slug}/dashboard` : '/dashboard',
        },
        {
            title: 'eCommerce & Analytics',
            href: props.currentTeam ? `/${props.currentTeam.slug}/dashboard` : '/dashboard',
        },
    ],
});
