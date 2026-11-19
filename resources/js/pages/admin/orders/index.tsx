import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    CreditCard,
    Eye,
    MapPin,
    Package,
    Search,
    ShoppingBag,
    Trash2,
    Truck,
    XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import type { Order, PaginatedData } from '@/types';

type Props = {
    orders: PaginatedData<Order> | Order[];
    filters: {
        search?: string;
        status?: string;
        payment_status?: string;
    };
};

export default function OrdersIndex({ orders, filters = {} }: Props) {
    const page = usePage();
    const prefix = '';

    const orderList = Array.isArray(orders) ? orders : (orders?.data || []);
    const totalOrders = Array.isArray(orders) ? orders.length : (orders?.total ?? 0);

    const [search, setSearch] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(filters.payment_status || 'all');

    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
    const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);

    const handleViewOrder = (order: Order) => {
        setViewingOrder(order);
        router.post(
            '/admin/notifications/mark-order-read',
            { order_id: order.id, order_number: order.order_number },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['adminNotifications', 'pendingOrdersCount'],
            }
        );
    };

    const statusForm = useForm({
        status: '',
        payment_status: '',
    });

    const deleteForm = useForm({});

    const handleFilterChange = (params: { search?: string; status?: string; payment_status?: string }) => {
        router.get(`${prefix}/admin/orders`, {
            search: params.search ?? search,
            status: params.status ?? selectedStatus,
            payment_status: params.payment_status ?? selectedPaymentStatus,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleQuickStatusChange = (orderId: number, newStatus: string) => {
        router.patch(`${prefix}/admin/orders/${orderId}/status`, {
            status: newStatus,
        }, {
            preserveScroll: true,
        });
    };

    const handleQuickPaymentStatusChange = (orderId: number, newPaymentStatus: string) => {
        router.patch(`${prefix}/admin/orders/${orderId}/status`, {
            payment_status: newPaymentStatus,
        }, {
            preserveScroll: true,
        });
    };

    const handleDeleteSubmit = () => {
        if (!deletingOrder) return;
        deleteForm.delete(`${prefix}/admin/orders/${deletingOrder.id}`, {
            onSuccess: () => {
                setDeletingOrder(null);
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'delivered':
                return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">Delivered</Badge>;
            case 'shipped':
                return <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300">Shipped</Badge>;
            case 'processing':
                return <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300">Processing</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300">Pending</Badge>;
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPaymentBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-emerald-100 text-emerald-800 text-[10px] dark:bg-emerald-950 dark:text-emerald-300">Paid</Badge>;
            case 'unpaid':
                return <Badge className="bg-neutral-100 text-neutral-600 text-[10px] dark:bg-neutral-800 dark:text-neutral-400">Unpaid</Badge>;
            case 'refunded':
                return <Badge variant="destructive" className="text-[10px]">Refunded</Badge>;
            default:
                return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
        }
    };

    const columns = [
        'Order',
        'Customer & City',
        'Total & Method',
        'Payment',
        'Fulfillment',
        { header: 'Actions', className: 'text-right' },
    ];

    return (
        <>
            <Head title="Orders & Fulfillment" />

            <DataTable<Order>
                title="Orders & Dispatch"
                totalCount={totalOrders}
                countLabel="Total Orders"
                search={search}
                onSearchChange={(val) => {
                    setSearch(val);
                    handleFilterChange({ search: val });
                }}
                searchPlaceholder="Search by order #, customer, or phone..."
                toolbarClassName="grid gap-3 sm:grid-cols-3"
                filters={
                    <>
                        <div>
                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    handleFilterChange({ status: e.target.value });
                                }}
                                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-800 shadow-sm focus:border-primary focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                            >
                                <option value="all">All Fulfillment Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <select
                                value={selectedPaymentStatus}
                                onChange={(e) => {
                                    setSelectedPaymentStatus(e.target.value);
                                    handleFilterChange({ payment_status: e.target.value });
                                }}
                                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-800 shadow-sm focus:border-primary focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                            >
                                <option value="all">All Payment Statuses</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>
                    </>
                }
                columns={columns}
                items={orderList}
                emptyMessage="No orders matching the specified filter criteria."
                paginationData={orders}
                renderRow={(o) => (
                    <tr key={o.id} className="hover:bg-neutral-50/70 transition-colors dark:hover:bg-neutral-800/40">
                        <td className="px-6 py-4">
                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                                {o.order_number}
                            </div>
                            <div className="text-[11px] text-neutral-400">
                                {formatDate(o.placed_at, 'with-time')}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="font-medium text-neutral-800 dark:text-neutral-200">
                                {o.customer_name}
                            </div>
                            <div className="text-xs text-neutral-400">
                                {o.city} • {o.customer_phone || o.customer_email}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                                ৳{Number(o.total_amount).toLocaleString()}
                            </div>
                            <div className="text-[11px] text-neutral-500 capitalize">
                                {o.payment_method.replace('_', ' ')}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <select
                                value={o.payment_status}
                                onChange={(e) => handleQuickPaymentStatusChange(o.id, e.target.value)}
                                className="rounded border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-800 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                            >
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </td>
                        <td className="px-6 py-4">
                            <select
                                value={o.status}
                                onChange={(e) => handleQuickStatusChange(o.id, e.target.value)}
                                className="rounded border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-neutral-800 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                            >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewOrder(o)}
                                    className="h-8 px-2.5 text-xs flex items-center gap-1"
                                >
                                    <Eye className="size-3" />
                                    <span>Details</span>
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeletingOrder(o)}
                                    className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                                >
                                    <Trash2 className="size-3" />
                                </Button>
                            </div>
                        </td>
                    </tr>
                )}
            />

            {/* Order Details Dialog */}
            <Dialog open={!!viewingOrder} onOpenChange={(open) => !open && setViewingOrder(null)}>
                <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-lg">
                                Order #{viewingOrder?.order_number}
                            </DialogTitle>
                            {viewingOrder && getStatusBadge(viewingOrder.status)}
                        </div>
                        <DialogDescription>
                            Placed on {formatDate(viewingOrder?.placed_at, 'with-time')}
                        </DialogDescription>
                    </DialogHeader>

                    {viewingOrder && (
                        <div className="space-y-4 pt-2 text-xs">
                            {/* Customer & Shipping Info */}
                            <div className="rounded-lg border border-neutral-200 p-3.5 space-y-2 dark:border-neutral-800">
                                <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide">
                                    Customer & Shipping Address
                                </div>
                                <div className="grid gap-2 sm:grid-cols-2 text-neutral-600 dark:text-neutral-300">
                                    <div>
                                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">{viewingOrder.customer_name}</p>
                                        <p>{viewingOrder.customer_email}</p>
                                        <p>{viewingOrder.customer_phone}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-neutral-800 dark:text-neutral-200">Delivery Address:</p>
                                        <p>{viewingOrder.shipping_address}</p>
                                        <p>{viewingOrder.city}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items Table */}
                            <div className="rounded-lg border border-neutral-200 p-3.5 space-y-2 dark:border-neutral-800">
                                <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide">
                                    Purchased Items
                                </div>
                                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {viewingOrder.items?.map((item) => (
                                        <div key={item.id} className="py-2 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="size-9 rounded border border-neutral-200 overflow-hidden bg-neutral-100">
                                                    {item.product_image ? (
                                                        <img src={item.product_image} alt="" className="size-full object-cover" />
                                                    ) : (
                                                        <Package className="size-4 m-auto mt-2 text-neutral-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                                                        {item.product_name}
                                                    </div>
                                                    <div className="text-[11px] text-neutral-400">
                                                        ৳{item.price} × {item.quantity}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                                                ৳{item.total.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="rounded-lg border border-neutral-200 p-3.5 space-y-1.5 text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>৳{viewingOrder.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping Delivery Fee</span>
                                    <span>৳{viewingOrder.shipping_fee.toLocaleString()}</span>
                                </div>
                                {viewingOrder.discount > 0 && (
                                    <div className="flex justify-between text-primary">
                                        <span>Promotion Discount</span>
                                        <span>-৳{viewingOrder.discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 border-t border-neutral-100 font-bold text-sm text-neutral-900 dark:border-neutral-800 dark:text-neutral-100">
                                    <span>Total Amount</span>
                                    <span>৳{viewingOrder.total_amount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="pt-2">
                        <Button variant="outline" onClick={() => setViewingOrder(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Order Dialog */}
            <Dialog open={!!deletingOrder} onOpenChange={(open) => !open && setDeletingOrder(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Order Record</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete order <strong>#{deletingOrder?.order_number}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-3">
                        <Button variant="outline" onClick={() => setDeletingOrder(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteSubmit}
                            disabled={deleteForm.processing}
                        >
                            {deleteForm.processing ? 'Deleting...' : 'Confirm Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

OrdersIndex.layout = () => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Orders',
            href: '/admin/orders',
        },
    ],
});
