import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginatedData, PaginationLink } from '@/types';

interface PaginationProps {
    data: PaginatedData<any> | {
        links?: PaginationLink[];
        from?: number | null;
        to?: number | null;
        total?: number;
        current_page?: number;
        last_page?: number;
    };
    className?: string;
}

export function Pagination({ data, className = '' }: PaginationProps) {
    if (!data || !data.links || data.links.length <= 1) {
        return null;
    }

    const { links, from = 0, to = 0, total = 0 } = data;

    // Helper to format label text (strip &laquo; / &raquo;)
    const renderLabel = (label: string) => {
        if (label.includes('Previous') || label.includes('&laquo;')) {
            return (
                <span className="flex items-center gap-1">
                    <ChevronLeft className="size-3.5" />
                    <span className="hidden sm:inline">Prev</span>
                </span>
            );
        }
        if (label.includes('Next') || label.includes('&raquo;')) {
            return (
                <span className="flex items-center gap-1">
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="size-3.5" />
                </span>
            );
        }
        return label;
    };

    return (
        <div
            className={`flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#dbdade]/70 bg-white px-4 py-3 dark:border-[#434968] dark:bg-[#2f3349] ${className}`}
        >
            {/* Left: Summary text */}
            <div className="text-xs text-[#82808b] dark:text-[#a5a3ae]">
                Showing{' '}
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {from ?? 0}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {to ?? 0}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {total}
                </span>{' '}
                entries
            </div>

            {/* Right: Pagination Navigation buttons */}
            <nav className="flex items-center gap-1" aria-label="Pagination Navigation">
                {links.map((link, index) => {
                    const isPrev = index === 0;
                    const isNext = index === links.length - 1;
                    const isDisabled = !link.url;

                    if (isDisabled) {
                        return (
                            <span
                                key={index}
                                aria-disabled="true"
                                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2.5 text-xs font-medium text-neutral-400 opacity-50 dark:text-neutral-500 cursor-not-allowed select-none ${
                                    isPrev || isNext ? 'border border-[#dbdade]/50 dark:border-[#434968]' : ''
                                }`}
                            >
                                {renderLabel(link.label)}
                            </span>
                        );
                    }

                    if (link.active) {
                        return (
                            <span
                                key={index}
                                aria-current="page"
                                className="inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-primary px-3 text-xs font-semibold text-white shadow-[0_2px_4px_rgba(var(--primary-rgb),0.4)]"
                            >
                                {renderLabel(link.label)}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={index}
                            href={link.url || '#'}
                            preserveState
                            preserveScroll
                            className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-transparent px-2.5 text-xs font-medium text-neutral-600 transition hover:bg-primary/10 hover:text-primary dark:text-neutral-300 dark:hover:bg-primary/20"
                        >
                            {renderLabel(link.label)}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

export default Pagination;
