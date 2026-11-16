import React, { ReactNode } from 'react';
import { Plus, Search } from 'lucide-react';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { PaginatedData } from '@/types';

export interface CatalogListProps<T> {
    title: string;
    totalCount: number;
    countLabel?: string;
    description?: string;
    addButtonLabel: string;
    onAdd: () => void;
    search: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    items: T[];
    renderCard: (item: T) => ReactNode;
    paginationData?: PaginatedData<T> | any;
    gridClassName?: string;
    emptyMessage?: string;
}

export function CatalogList<T>({
    title,
    totalCount,
    countLabel = 'Items',
    description,
    addButtonLabel,
    onAdd,
    search,
    onSearchChange,
    searchPlaceholder = 'Search...',
    items = [],
    renderCard,
    paginationData,
    gridClassName = 'grid gap-5 sm:grid-cols-2 lg:grid-cols-4',
    emptyMessage = 'No records found matching your search.',
}: CatalogListProps<T>) {
    return (
        <div className="space-y-6">
            {/* Header: Title, Total Badge, Description & Add Button */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            {title}
                        </h1>
                        <Badge variant="outline" className="text-xs">
                            {totalCount} {countLabel}
                        </Badge>
                    </div>
                    {description && (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                            {description}
                        </p>
                    )}
                </div>

                <Button
                    onClick={onAdd}
                    className="bg-primary hover:bg-[var(--primary-hover)] shadow-[0_2px_4px_rgba(var(--primary-rgb),0.4)] text-white flex items-center gap-1.5 shrink-0"
                >
                    <Plus className="size-4" />
                    <span>{addButtonLabel}</span>
                </Button>
            </div>

            {/* Search Filter Bar */}
            <div className="flex items-center gap-3">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-3 top-2.5 size-4 text-neutral-400" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 text-xs bg-white dark:bg-[#2f3349]"
                    />
                </div>
            </div>

            {/* Items Grid or Empty State Card */}
            {items.length === 0 ? (
                <Card className="border-[#dbdade]/80 bg-white shadow-xs dark:border-[#434968] dark:bg-[#2f3349] p-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    {emptyMessage}
                </Card>
            ) : (
                <>
                    <div className={gridClassName}>{items.map((item) => renderCard(item))}</div>

                    {/* Integrated Pagination Component */}
                    {paginationData && (
                        <Pagination
                            data={paginationData}
                            className="rounded-xl border border-[#dbdade]/70 shadow-xs"
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default CatalogList;
