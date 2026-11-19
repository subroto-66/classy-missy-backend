import { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Bell,
    Check,
    CheckCheck,
    Clock,
    ExternalLink,
    Filter,
    Mail,
    Newspaper,
    Package,
    ShoppingBag,
    Sparkles,
    Star,
    Trash2,
    UserCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { NotificationItem, NotificationType, PaginatedData } from '@/types';

type Props = {
    notifications: PaginatedData<NotificationItem> | NotificationItem[];
    unreadCount: number;
    totalCount: number;
    filter?: string;
};

function getNotificationIcon(type: NotificationType) {
    switch (type) {
        case 'order':
            return <ShoppingBag className="size-5 text-emerald-600 dark:text-emerald-400" />;
        case 'stock':
            return <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />;
        case 'customer':
            return <UserCheck className="size-5 text-blue-600 dark:text-blue-400" />;
        case 'review':
            return <Star className="size-5 text-purple-600 dark:text-purple-400" />;
        case 'blog':
            return <Newspaper className="size-5 text-rose-600 dark:text-rose-400" />;
        default:
            return <Bell className="size-5 text-primary" />;
    }
}

function getNotificationBadgeStyle(type: NotificationType) {
    switch (type) {
        case 'order':
            return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/50';
        case 'stock':
            return 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/50';
        case 'customer':
            return 'bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/50';
        case 'review':
            return 'bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800/50';
        case 'blog':
            return 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/50';
        default:
            return 'bg-primary/10 border-primary/20 dark:bg-primary/20 dark:border-primary/30';
    }
}

export default function NotificationsIndex({
    notifications,
    unreadCount: initialUnreadCount = 0,
    totalCount: initialTotalCount = 0,
    filter: currentFilter = 'all',
}: Props) {
    const list = Array.isArray(notifications) ? notifications : notifications?.data || [];
    const pagination = !Array.isArray(notifications) ? notifications : null;

    const [activeFilter, setActiveFilter] = useState(currentFilter);
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    const [items, setItems] = useState<NotificationItem[]>(list);

    // Keep local state in sync when server props update
    useEffect(() => {
        const fresh = Array.isArray(notifications) ? notifications : notifications?.data || [];
        setItems(fresh);
        setUnreadCount(initialUnreadCount);
    }, [notifications, initialUnreadCount]);

    const handleFilterChange = (newFilter: string) => {
        setActiveFilter(newFilter);
        router.get(
            '/admin/notifications',
            { filter: newFilter },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleToggleRead = (item: NotificationItem) => {
        if (item.read) {
            // Mark as unread
            setItems((prev) =>
                prev.map((n) => (n.id === item.id ? { ...n, read: false, read_at: null } : n))
            );
            setUnreadCount((c) => c + 1);

            router.patch(
                `/admin/notifications/${item.id}/unread`,
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                }
            );
        } else {
            // Mark as read
            setItems((prev) =>
                prev.map((n) => (n.id === item.id ? { ...n, read: true, read_at: new Date().toISOString() } : n))
            );
            setUnreadCount((c) => Math.max(0, c - 1));

            router.patch(
                `/admin/notifications/${item.id}/read`,
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                }
            );
        }
    };

    const handleMarkAsRead = (item: NotificationItem) => {
        if (!item.read) {
            setItems((prev) =>
                prev.map((n) => (n.id === item.id ? { ...n, read: true, read_at: new Date().toISOString() } : n))
            );
            setUnreadCount((c) => Math.max(0, c - 1));

            router.patch(
                `/admin/notifications/${item.id}/read`,
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                }
            );
        }

        if (item.link) {
            router.visit(item.link);
        }
    };

    const handleMarkAllRead = () => {
        setItems((prev) => prev.map((n) => ({ ...n, read: true, read_at: new Date().toISOString() })));
        setUnreadCount(0);

        router.post(
            '/admin/notifications/mark-all-read',
            {},
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const handleMarkAllUnread = () => {
        setItems((prev) => prev.map((n) => ({ ...n, read: false, read_at: null })));
        setUnreadCount(items.length);

        router.post(
            '/admin/notifications/mark-all-unread',
            {},
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const handleSendTestAlert = () => {
        router.post(
            '/admin/notifications/test',
            {},
            {
                preserveScroll: true,
            }
        );
    };

    const handleDelete = (id: string) => {
        const toDelete = items.find((n) => n.id === id);
        setItems((prev) => prev.filter((n) => n.id !== id));
        if (toDelete && !toDelete.read) {
            setUnreadCount((c) => Math.max(0, c - 1));
        }

        router.delete(`/admin/notifications/${id}`, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleClearAllRead = () => {
        setItems((prev) => prev.filter((n) => !n.read));

        router.delete('/admin/notifications/clear-all', {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const orderCount = items.filter((n) => n.type === 'order').length;
    const stockCount = items.filter((n) => n.type === 'stock').length;

    return (
        <>
            <Head title="Notifications & Alerts" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-[#2f2b3d] dark:text-white">
                                Notifications & Alerts
                            </h1>
                            {unreadCount > 0 && (
                                <Badge className="bg-[#ff4c51] text-white">
                                    {unreadCount} Unread
                                </Badge>
                            )}
                        </div>
                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                            Real-time alerts for customer orders, inventory stock levels, user signups, and store activity.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleSendTestAlert}
                            className="flex items-center gap-1.5 text-xs text-neutral-700 hover:text-primary dark:text-neutral-200"
                            title="Generate a test unread notification"
                        >
                            <Sparkles className="size-3.5 text-amber-500" />
                            <span>Test Unread Alert</span>
                        </Button>

                        {unreadCount > 0 ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10"
                            >
                                <CheckCheck className="size-3.5" />
                                <span>Mark All Read</span>
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleMarkAllUnread}
                                className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-primary dark:text-neutral-300"
                            >
                                <Mail className="size-3.5" />
                                <span>Mark All Unread</span>
                            </Button>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleClearAllRead}
                            className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-red-600 hover:border-red-300 dark:text-neutral-300"
                        >
                            <Trash2 className="size-3.5" />
                            <span>Clear Read</span>
                        </Button>
                    </div>
                </div>

                {/* Stat Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border border-[#dbdade]/70 bg-white shadow-xs dark:border-[#434968] dark:bg-[#2f3349]">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                Unread Alerts
                            </CardTitle>
                            <span className="flex size-8 items-center justify-center rounded-lg bg-[#ff4c51]/10 text-[#ff4c51]">
                                <Bell className="size-4" />
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#ff4c51]">
                                {unreadCount}
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                                Requiring administrator review
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border border-[#dbdade]/70 bg-white shadow-xs dark:border-[#434968] dark:bg-[#2f3349]">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                Total Activity
                            </CardTitle>
                            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Check className="size-4" />
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#2f2b3d] dark:text-white">
                                {initialTotalCount || items.length}
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                                Logged store events
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border border-[#dbdade]/70 bg-white shadow-xs dark:border-[#434968] dark:bg-[#2f3349]">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                Order Alerts
                            </CardTitle>
                            <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                                <ShoppingBag className="size-4" />
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {orderCount}
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                                New purchases & checkout updates
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border border-[#dbdade]/70 bg-white shadow-xs dark:border-[#434968] dark:bg-[#2f3349]">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                Stock & Inventory
                            </CardTitle>
                            <span className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40">
                                <AlertTriangle className="size-4" />
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                {stockCount}
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                                Low stock and restock warnings
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dbdade]/60 pb-3 dark:border-[#434968]">
                    <div className="flex items-center gap-1.5">
                        {[
                            { key: 'all', label: 'All Notifications' },
                            { key: 'unread', label: 'Unread Only' },
                            { key: 'orders', label: 'Orders' },
                            { key: 'alerts', label: 'Stock & System Alerts' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleFilterChange(tab.key)}
                                className={cn(
                                    'rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all',
                                    activeFilter === tab.key
                                        ? 'bg-primary text-white shadow-xs'
                                        : 'text-neutral-600 hover:bg-[#f4f5fb] dark:text-neutral-300 dark:hover:bg-[#353952]'
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <span className="text-xs text-neutral-400">
                        Showing {items.length} notifications
                    </span>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#dbdade] p-12 text-center dark:border-[#434968]">
                            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                                <Bell className="size-6" />
                            </div>
                            <h3 className="text-base font-semibold text-[#2f2b3d] dark:text-white">
                                No notifications found
                            </h3>
                            <p className="mt-1 text-xs text-neutral-400 max-w-sm">
                                You are all caught up! New orders, inventory warnings, and customer alerts will appear here in real time.
                            </p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div
                                key={item.id}
                                className={cn(
                                    'group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 transition-all shadow-xs',
                                    item.read
                                        ? 'border-[#dbdade]/70 bg-white hover:border-[#dbdade] dark:border-[#434968] dark:bg-[#2f3349]'
                                        : 'border-primary/30 bg-primary/[0.02] hover:border-primary/50 dark:border-primary/40 dark:bg-[#353952]/40'
                                )}
                            >
                                <div className="flex items-start gap-3.5 min-w-0">
                                    {/* Icon Badge */}
                                    <div
                                        className={cn(
                                            'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-xs',
                                            getNotificationBadgeStyle(item.type)
                                        )}
                                    >
                                        {getNotificationIcon(item.type)}
                                    </div>

                                    {/* Text Content */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3
                                                className={cn(
                                                    'text-sm font-semibold text-[#2f2b3d] dark:text-white',
                                                    !item.read && 'font-bold'
                                                )}
                                            >
                                                {item.title}
                                            </h3>
                                            {!item.read && (
                                                <Badge className="bg-[#ff4c51] text-white text-[10px] px-1.5 py-0 h-4 font-bold">
                                                    NEW
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="mt-1 text-xs text-neutral-600 leading-relaxed dark:text-neutral-300">
                                            {item.message}
                                        </p>

                                        <div className="mt-2 flex items-center gap-3 text-[11px] text-neutral-400">
                                            <span className="flex items-center gap-1">
                                                <Clock className="size-3" />
                                                {item.time_ago}
                                            </span>
                                            <span>•</span>
                                            <span className="capitalize">{item.type}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleToggleRead(item)}
                                        className={cn(
                                            'text-xs h-8',
                                            item.read
                                                ? 'text-neutral-500 hover:text-primary hover:bg-primary/10'
                                                : 'text-primary hover:bg-primary/10'
                                        )}
                                        title={item.read ? 'Mark as unread' : 'Mark as read'}
                                    >
                                        {item.read ? (
                                            <>
                                                <Mail className="mr-1 size-3.5" />
                                                Mark as unread
                                            </>
                                        ) : (
                                            <>
                                                <Check className="mr-1 size-3.5" />
                                                Mark as read
                                            </>
                                        )}
                                    </Button>

                                    {item.link && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => handleMarkAsRead(item)}
                                            className="text-xs h-8"
                                        >
                                            <span>{item.action_label || 'View'}</span>
                                            <ExternalLink className="ml-1 size-3" />
                                        </Button>
                                    )}

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(item.id)}
                                        className="size-8 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                        title="Delete notification"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-[#dbdade]/60 pt-4 dark:border-[#434968]">
                        <span className="text-xs text-neutral-500">
                            Page {pagination.current_page} of {pagination.last_page}
                        </span>

                        <div className="flex items-center gap-1">
                            {pagination.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={cn(
                                        'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                                        link.active
                                            ? 'bg-primary text-white'
                                            : 'text-neutral-600 hover:bg-[#f4f5fb] dark:text-neutral-300 dark:hover:bg-[#353952]',
                                        !link.url && 'opacity-40 cursor-not-allowed'
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
