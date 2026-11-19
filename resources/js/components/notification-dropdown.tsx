import { useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Bell,
    Check,
    CheckCheck,
    ChevronLeft,
    ChevronRight,
    Clock,
    ExternalLink,
    Mail,
    Newspaper,
    Package,
    ShoppingBag,
    Sparkles,
    Star,
    Trash2,
    UserCheck,
    Volume2,
    VolumeX,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
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

/**
 * Melodic 3-tone notification chime synthesized via Web Audio API.
 * High fidelity and 100% self-contained (no external audio assets needed).
 */
function playNotificationChime() {
    try {
        const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const now = ctx.currentTime;

        const notes = [
            { freq: 1046.5, time: 0, duration: 0.22 },     // C6
            { freq: 1318.51, time: 0.11, duration: 0.22 },   // E6
            { freq: 1567.98, time: 0.22, duration: 0.45 },   // G6
        ];

        notes.forEach(({ freq, time, duration }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + time);
            gain.gain.setValueAtTime(0.18, now + time);
            gain.gain.exponentialRampToValueAtTime(0.001, now + time + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + time);
            osc.stop(now + time + duration);
        });
    } catch {
        // Silently catch audio context autoplay restrictions
    }
}

export function NotificationDropdown() {
    const page = usePage();
    const adminNotifications = page.props.adminNotifications as AdminNotificationsSummary | undefined;

    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread' | 'orders' | 'alerts'>('all');
    const [items, setItems] = useState<NotificationItem[]>(adminNotifications?.latest || []);
    const [unreadCount, setUnreadCount] = useState<number>(adminNotifications?.unread_count || 0);

    // Audio enabled state saved in localStorage
    const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('classy_admin_sound_enabled') !== 'false';
        }
        return true;
    });

    // Track known notification IDs to only trigger sound/toast on genuinely new arrivals
    const knownIdsRef = useRef<Set<string>>(
        new Set((adminNotifications?.latest || []).map((n) => n.id))
    );

    // Keep state in sync with Inertia shared props
    useEffect(() => {
        if (adminNotifications) {
            setItems(adminNotifications.latest || []);
            setUnreadCount(adminNotifications.unread_count || 0);
            (adminNotifications.latest || []).forEach((n) => knownIdsRef.current.add(n.id));
        }
    }, [adminNotifications]);

    // Live background polling for orders and notifications every 12 seconds
    useEffect(() => {
        let isMounted = true;

        const checkLatestNotifications = async () => {
            try {
                const res = await fetch('/admin/notifications', {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (!res.ok) return;
                const json = await res.json();
                if (!isMounted || json.status !== 'success' || !json.data) return;

                const latest: NotificationItem[] = json.data.latest || [];
                const freshUnreadCount: number = json.data.unread_count ?? 0;

                // Detect brand new notifications not previously in memory
                const newArrivals = latest.filter((item) => !knownIdsRef.current.has(item.id));

                if (newArrivals.length > 0) {
                    newArrivals.forEach((item) => knownIdsRef.current.add(item.id));

                    // Check for order notifications
                    const newOrder = newArrivals.find((item) => item.type === 'order');
                    if (newOrder) {
                        if (soundEnabled) {
                            playNotificationChime();
                        }
                        toast.success(`🛒 ${newOrder.title}`, {
                            description: newOrder.message,
                            action: {
                                label: 'View Orders',
                                onClick: () => router.visit(`/admin/notifications/${newOrder.id}/view`),
                            },
                            duration: 10000,
                        });

                        // If user is currently looking at /admin/orders, reload orders automatically
                        if (window.location.pathname.includes('/admin/orders')) {
                            router.reload({
                                only: ['orders', 'pendingOrdersCount'],
                                preserveScroll: true,
                                preserveState: true,
                            });
                        }
                    } else {
                        const firstUnread = newArrivals.find((n) => !n.read);
                        if (firstUnread) {
                            toast.info(firstUnread.title, {
                                description: firstUnread.message,
                                duration: 6000,
                            });
                        }
                    }

                    setItems(latest);
                    setUnreadCount(freshUnreadCount);

                    // Sync shared props for sidebar badge updates
                    router.reload({
                        only: ['adminNotifications', 'pendingOrdersCount'],
                        preserveScroll: true,
                        preserveState: true,
                    });
                } else if (freshUnreadCount !== unreadCount) {
                    setUnreadCount(freshUnreadCount);
                    setItems(latest);
                }
            } catch {
                // Background polling errors are non-critical
            }
        };

        const interval = setInterval(checkLatestNotifications, 12000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [soundEnabled, unreadCount]);

    const toggleSound = (e: React.MouseEvent) => {
        e.stopPropagation();
        const next = !soundEnabled;
        setSoundEnabled(next);
        if (typeof window !== 'undefined') {
            localStorage.setItem('classy_admin_sound_enabled', String(next));
        }
        if (next) {
            playNotificationChime();
            toast.success('Order notification sound turned ON');
        } else {
            toast.info('Order notification sound muted');
        }
    };

    const handleSendTestOrderAlert = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (soundEnabled) {
            playNotificationChime();
        }
        router.post(
            '/admin/notifications/test',
            { type: 'order' },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success('Test order alert generated! Check the chime & badge.');
                },
            }
        );
    };

    const handleMarkAsRead = (item: NotificationItem) => {
        if (!item.read) {
            setItems((prev) =>
                prev.map((n) => (n.id === item.id ? { ...n, read: true, read_at: new Date().toISOString() } : n))
            );
            setUnreadCount((c) => Math.max(0, c - 1));
        }

        setOpen(false);

        if (item.link) {
            router.visit(`/admin/notifications/${item.id}/view`);
        } else if (!item.read) {
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

    const [pageNumber, setPageNumber] = useState(1);
    const pageSize = 5;

    const filteredItems = items.filter((item) => {
        if (filter === 'unread') return !item.read;
        if (filter === 'orders') return item.type === 'order';
        if (filter === 'alerts') return item.type === 'stock' || item.type === 'system' || item.type === 'review';
        return true;
    });

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
    const paginatedItems = filteredItems.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

    const handleSetFilter = (newFilter: 'all' | 'unread' | 'orders' | 'alerts') => {
        setFilter(newFilter);
        setPageNumber(1);
    };

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

                    <div className="flex items-center gap-2">
                        {/* Audio Chime Mute/Unmute Toggle */}
                        <button
                            type="button"
                            onClick={toggleSound}
                            title={soundEnabled ? 'Order sound is ON (click to mute)' : 'Order sound is MUTED (click to turn ON)'}
                            className={cn(
                                'flex items-center justify-center size-7 rounded-md transition-colors',
                                soundEnabled
                                    ? 'text-primary bg-primary/10 hover:bg-primary/20'
                                    : 'text-neutral-400 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800'
                            )}
                        >
                            {soundEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
                        </button>

                        {/* Test Order Trigger */}
                        <button
                            type="button"
                            onClick={handleSendTestOrderAlert}
                            title="Test live order notification chime & popup"
                            className="flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50 px-2 py-1 rounded-md transition-colors"
                        >
                            <Sparkles className="size-3" />
                            <span>Test</span>
                        </button>

                        {unreadCount > 0 ? (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                title="Mark all as read"
                                className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline transition-all ml-1"
                            >
                                <CheckCheck className="size-3.5" />
                                <span>Mark read</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleMarkAllUnread}
                                title="Mark all as unread"
                                className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-primary transition-all ml-1"
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
                            onClick={() => handleSetFilter(tab)}
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
                                We will alert you with chime & badge whenever new orders or customer updates happen.
                            </p>
                        </div>
                    ) : (
                        paginatedItems.map((item) => (
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

                {/* Dropdown Mini Pagination Bar */}
                {filteredItems.length > 0 && (
                    <div className="flex items-center justify-between border-t border-[#dbdade]/50 dark:border-[#434968]/60 px-4 py-2 bg-[#fdfdfd] dark:bg-[#282b3d] text-[11px] text-neutral-500 dark:text-neutral-400">
                        <span>
                            Showing {(pageNumber - 1) * pageSize + 1}–{Math.min(pageNumber * pageSize, filteredItems.length)} of {filteredItems.length}
                        </span>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    disabled={pageNumber === 1}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPageNumber((p) => Math.max(1, p - 1));
                                    }}
                                    className="flex size-6 items-center justify-center rounded border border-[#dbdade]/60 dark:border-[#434968] hover:bg-neutral-100 dark:hover:bg-[#353952] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    title="Previous page"
                                >
                                    <ChevronLeft className="size-3" />
                                </button>
                                <span className="font-semibold text-neutral-700 dark:text-neutral-200 px-1">
                                    {pageNumber}/{totalPages}
                                </span>
                                <button
                                    type="button"
                                    disabled={pageNumber >= totalPages}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPageNumber((p) => Math.min(totalPages, p + 1));
                                    }}
                                    className="flex size-6 items-center justify-center rounded border border-[#dbdade]/60 dark:border-[#434968] hover:bg-neutral-100 dark:hover:bg-[#353952] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    title="Next page"
                                >
                                    <ChevronRight className="size-3" />
                                </button>
                            </div>
                        )}
                    </div>
                )}

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
