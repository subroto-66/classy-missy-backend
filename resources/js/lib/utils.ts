import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

/**
 * Format a date string or timestamp into a human-readable format.
 * Examples:
 *   formatDate('2026-11-10T00:00:00.000000Z') -> 'Nov 10, 2026'
 *   formatDate('2026-11-10T14:30:00Z', 'with-time') -> 'Nov 10, 2026, 02:30 PM'
 */
export function formatDate(
    dateInput?: string | Date | null,
    format: 'short' | 'medium' | 'long' | 'with-time' = 'medium'
): string {
    if (!dateInput) return '—';

    try {
        let d: Date;

        if (typeof dateInput === 'string') {
            // If date is in YYYY-MM-DD or starts with YYYY-MM-DD
            const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (match && format !== 'with-time') {
                const [, year, month, day] = match;
                d = new Date(Number(year), Number(month) - 1, Number(day));
            } else {
                d = new Date(dateInput);
            }
        } else {
            d = dateInput;
        }

        if (isNaN(d.getTime())) {
            return String(dateInput);
        }

        if (format === 'short') {
            return d.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            });
        }

        if (format === 'with-time') {
            return d.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        }

        if (format === 'long') {
            return d.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            });
        }

        // Default 'medium': 'Nov 10, 2026'
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    } catch {
        return String(dateInput);
    }
}

/**
 * Format a date range into a clean, readable string.
 * Example: 'Nov 10, 2026 – Dec 10, 2026'
 */
export function formatDateRange(
    startDate?: string | null,
    endDate?: string | null
): string {
    if (!startDate && !endDate) return 'Always Active';
    if (startDate && !endDate) return `From ${formatDate(startDate)}`;
    if (!startDate && endDate) return `Until ${formatDate(endDate)}`;

    const start = formatDate(startDate);
    const end = formatDate(endDate);

    return `${start} – ${end}`;
}

/**
 * Format a date string safely for HTML <input type="date" /> (YYYY-MM-DD)
 */
export function toInputDate(dateInput?: string | null): string {
    if (!dateInput) return '';
    try {
        const match = dateInput.match(/^(\d{4}-\d{2}-\d{2})/);
        if (match) {
            return match[1];
        }
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    } catch {
        return '';
    }
}
