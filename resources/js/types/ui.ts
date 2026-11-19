import type { ReactNode } from 'react';
import type { BreadcrumbItem } from '@/types/navigation';

export type AppLayoutProps = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};

export type AppVariant = 'header' | 'sidebar';

export type FlashToast = {
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
};

export type AuthLayoutProps = {
    children?: ReactNode;
    name?: string;
    title?: string;
    description?: string;
};

export type NotificationType = 'order' | 'stock' | 'customer' | 'review' | 'blog' | 'system';

export type NotificationItem = {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string | null;
    action_label?: string;
    metadata?: Record<string, unknown>;
    read: boolean;
    read_at?: string | null;
    created_at: string;
    time_ago: string;
};

export type AdminNotificationsSummary = {
    unread_count: number;
    total_count: number;
    latest: NotificationItem[];
    pending_orders_count?: number;
};
