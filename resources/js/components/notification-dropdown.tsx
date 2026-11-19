import { useEffect, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Bell,
    Check,
    CheckCheck,
    Clock,
    ExternalLink,
    Mail,
    Newspaper,
    Package,
    ShoppingBag,
    Star,
    Trash2,
    UserCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { AdminNotificationsSummary, NotificationItem, NotificationType } from '@/types';

function getNotificationIcon(type: NotificationType) {
    switch (type) {
        case 'order':
            return <ShoppingBag className="size-4 text-emerald-600 dark:text-emerald-400" />;
        case 'stock':
            return <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />;
        case 'customer':
            return <UserCheck className="size-4 text-blue-600 dark:text-blue-400" />;
        case 'review':
            return <Star className="size-4 text-purple-600 dark:text-purple-400" />;
        case 'blog':
            return <Newspaper className="size-4 text-rose-600 dark:text-rose-400" />;
        default:
            return <Bell className="size-4 text-primary" />;
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

export function NotificationDropdown() {
    const page = usePage();
    const adminNotifications = page.props.adminNotifications as AdminNotificationsSummary | undefined;

    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread' | 'orders' | 'alerts'>('all');
    const [items, setItems] = useState<NotificationItem[]>(adminNotifications?.latest || []);
    const [unreadCount, setUnreadCount] = useState<number>(adminNotifications?.unread_count || 0);

    // Keep state in sync with Inertia shared props
    useEffect(() => {
        if (adminNotifications) {
            setItems(adminNotifications.latest || []);
            setUnreadCount(adminNotifications.unread_count || 0);
        }
    }, [adminNotifications]);

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
            setOpen(false);
            router.visit(item.link);
        }
    };

    const handleToggleRead = (e: React.MouseEvent, item: NotificationItem) => {
        e.stopPropagation();
        if (item.read) {
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

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const itemToDelete = items.find((n) => n.id === id);
        setItems((prev) => prev.filter((n) => n.id !== id));
        if (itemToDelete && !itemToDelete.read) {
            setUnreadCount((c) => Math.max(0, c - 1));
        }

        router.delete(`/admin/notifications/${id}`, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const filteredItems = items.filter((item) => {
        if (filter === 'unread') return !item.read;
        if (filter === 'orders') return item.type === 'order';
        if (filter === 'alerts') return item.type === 'stock' || item.type === 'system' || item.type === 'review';
        return true;
    });

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="Open notifications menu"
                    className="relative flex size-9 items-center justify-center rounded-lg text-[#5d596c] transition-colors hover:bg-[#f4f5fb] hover:text-primary dark:text-[#cfcde4] dark:hover:bg-[#353952]"
                >
                    <Bell className="size-[18px]" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[#ff4c51] text-[10px] font-bold text-white shadow-xs animate-in zoom-in-50">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-80 sm:w-96 p-0 shadow-xl border border-[#dbdade]/70 rounded-xl bg-white dark:bg-[#2f3349] dark:border-[#434968] overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#dbdade]/60 px-4 py-3 bg-[#f8f7fa] dark:bg-[#25293c] dark:border-[#434968]">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#444050] dark:text-white">
                            Notifications
                        </span>
                        {unreadCount > 0 ? (
                            <Badge variant="secondary" className="bg-[#ff4c51]/10 text-[#ff4c51] hover:bg-[#ff4c51]/20 border-transparent text-[11px] font-semibold px-2 py-0.5">
                                {unreadCount} New
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-[10px] text-neutral-400 font-normal">
                                All Caught Up
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5">
                        {unreadCount > 0 ? (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                title="Mark all as read"
                                className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline transition-all"
                            >
                                <CheckCheck className="size-3.5" />
                                <span>Mark read</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleMarkAllUnread}
                                title="Mark all as unread"
                                className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-primary transition-all"
                            >
                                <Mail className="size-3.5" />
                                <span>Mark unread</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 px-3 py-2 border-b border-[#dbdade]/40 dark:border-[#434968]/70 bg-white dark:bg-[#2f3349]">
                    {(['all', 'unread', 'orders', 'alerts'] as const).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setFilter(tab)}
                            className={cn(
                                'rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors',
                                filter === tab
                                    ? 'bg-primary text-white shadow-xs'
                                    : 'text-neutral-500 hover:bg-[#f4f5fb] hover:text-[#444050] dark:text-neutral-300 dark:hover:bg-[#353952]'
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Notification Items List */}
                <div className="max-h-[380px] overflow-y-auto divide-y divide-[#dbdade]/40 dark:divide-[#434968]/60">
                    {filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                                <Bell className="size-5" />
                            </div>
                            <p className="text-sm font-medium text-[#444050] dark:text-[#cfcde4]">
                                No {filter !== 'all' ? filter : ''} notifications
                            </p>
                            <p className="mt-1 text-xs text-neutral-400 max-w-[200px]">
                                We will alert you whenever new orders, customer signups, or stock updates happen.
                            </p>
                        </div>
                    ) : (
                        filteredItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleMarkAsRead(item)}
                                className={cn(
                                    'group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer',
                                    item.read
                                        ? 'bg-white hover:bg-[#f8f7fa] dark:bg-[#2f3349] dark:hover:bg-[#25293c]/80'
                                        : 'bg-primary/[0.03] hover:bg-primary/[0.07] dark:bg-[#353952]/40 dark:hover:bg-[#353952]/70'
                                )}
                            >
                                {/* Type Icon */}
                                <div
                                    className={cn(
                                        'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border',
                                        getNotificationBadgeStyle(item.type)
                                    )}
                                >
                                    {getNotificationIcon(item.type)}
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4
                                            className={cn(
                                                'text-xs font-semibold leading-snug truncate',
                                                item.read
                                                    ? 'text-[#444050] dark:text-[#cfcde4]'
                                                    : 'text-[#2f2b3d] dark:text-white font-bold'
                                            )}
                                        >
                                            {item.title}
                                        </h4>
                                        {!item.read && (
                                            <span className="size-2 shrink-0 rounded-full bg-primary" />
                                        )}
                                    </div>

                                    <p className="mt-0.5 text-xs text-neutral-500 line-clamp-2 leading-relaxed dark:text-neutral-400">
                                        {item.message}
                                    </p>

                                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-neutral-400">
                                        <span className="flex items-center gap-1">
                                            <Clock className="size-3" />
                                            {item.time_ago}
                                        </span>

                                        {item.link && (
                                            <span className="text-primary font-medium flex items-center gap-0.5 text-[10px] group-hover:underline">
                                                {item.action_label || 'View'}
                                                <ExternalLink className="size-2.5" />
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Hover actions: toggle read & delete */}
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        onClick={(e) => handleToggleRead(e, item)}
                                        title={item.read ? 'Mark as unread' : 'Mark as read'}
                                        className={cn(
                                            'p-1 rounded transition-colors',
                                            item.read
                                                ? 'text-neutral-400 hover:text-primary hover:bg-primary/10'
                                                : 'text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                        )}
                                    >
                                        {item.read ? (
                                            <Mail className="size-3.5" />
                                        ) : (
                                            <Check className="size-3.5" />
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={(e) => handleDelete(e, item.id)}
                                        title="Delete notification"
                                        className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-[#dbdade]/60 px-4 py-2.5 bg-[#f8f7fa] dark:bg-[#25293c] dark:border-[#434968]">
                    <Link
                        href="/admin/notifications"
                        onClick={() => setOpen(false)}
                        className="text-xs font-semibold text-primary hover:underline"
                    >
                        View all notifications →
                    </Link>

                    <Link
                        href="/admin/orders"
                        onClick={() => setOpen(false)}
                        className="text-xs text-neutral-500 hover:text-[#444050] dark:text-neutral-400 dark:hover:text-white"
                    >
                        Orders
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
