import React, { ReactNode } from 'react';
import { Plus, Search } from 'lucide-react';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { PaginatedData } from '@/types';

export type DataTableColumn =
    | string
    | {
          header: ReactNode;
          className?: string;
      };

export interface DataTableProps<T> {
    // Header section
    title?: string;
    totalCount?: number;
    countLabel?: string;
    description?: string;
    addButtonLabel?: string;
    onAdd?: () => void;
    addButtonIcon?: ReactNode;
    headerActions?: ReactNode;

    // Filters / Search toolbar
    search?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    filters?: ReactNode;
    toolbarClassName?: string;
    toolbar?: ReactNode;

    // Table data and columns
    columns: DataTableColumn[];
    items: T[];
    renderRow: (item: T, index: number) => ReactNode;
    emptyMessage?: string;

    // Optional Pagination
    paginationData?: PaginatedData<any> | any;

    // Layout / styling
    className?: string;
    cardClassName?: string;
    children?: ReactNode;
}

export function DataTable<T>({
    title,
    totalCount,
    countLabel = 'Records',
    description,
    addButtonLabel,
    onAdd,
    addButtonIcon,
    headerActions,
    search,
    onSearchChange,
    searchPlaceholder = 'Search...',
    filters,
    toolbarClassName,
    toolbar,
    columns,
    items = [],
    renderRow,
    emptyMessage = 'No records found.',
    paginationData,
    className = 'flex flex-1 flex-col gap-6 p-6',
    cardClassName = '',
    children,
}: DataTableProps<T>) {
    // Determine toolbar layout
    const isGridToolbar = toolbarClassName?.includes('grid');
    const defaultToolbarClass = filters
        ? 'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'
        : 'relative max-w-sm';

    return (
        <div className={className}>
            {/* Header: Title, Count Badge, Description, and Header Actions / Add Button */}
            {(title || onAdd || headerActions) && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            {title && (
                                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                    {title}
                                </h1>
                            )}
                            {totalCount !== undefined && (
                                <Badge variant="outline" className="text-xs">
                                    {totalCount} {countLabel}
                                </Badge>
                            )}
                        </div>
                        {description && (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                {description}
                            </p>
                        )}
                    </div>

                    {(onAdd || headerActions) && (
                        <div className="flex items-center gap-2">
                            {headerActions}
                            {onAdd && (
                                <Button
                                    onClick={onAdd}
                                    className="bg-primary hover:bg-[var(--primary-hover)] shadow-[0_2px_4px_rgba(var(--primary-rgb),0.4)] text-white flex items-center gap-1.5 shrink-0"
                                >
                                    {addButtonIcon || <Plus className="size-4" />}
                                    <span>{addButtonLabel || 'Add New'}</span>
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Filter Toolbar */}
            {toolbar ? (
                toolbar
            ) : onSearchChange || filters ? (
                <div className={toolbarClassName || defaultToolbarClass}>
                    {onSearchChange && (
                        <div className={isGridToolbar ? 'relative' : 'relative w-full max-w-sm'}>
                            <Search className="absolute left-3 top-2.5 size-4 text-neutral-400" />
                            <Input
                                placeholder={searchPlaceholder}
                                value={search ?? ''}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-9 text-xs"
                            />
                        </div>
                    )}
                    {filters}
                </div>
            ) : null}

            {/* Table Card */}
            <Card className={`border-neutral-200 shadow-sm dark:border-neutral-800 ${cardClassName}`}>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-semibold text-neutral-500 uppercase tracking-wider dark:border-neutral-800 dark:bg-neutral-900/50">
                                <tr>
                                    {columns.map((col, idx) => {
                                        const isObj =
                                            typeof col === 'object' && col !== null && 'header' in col;
                                        const headerContent = isObj ? col.header : col;
                                        const customClass = isObj ? col.className : '';
                                        return (
                                            <th
                                                key={idx}
                                                className={`px-6 py-3.5 ${customClass || ''}`}
                                            >
                                                {headerContent}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {items.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={columns.length}
                                            className="py-12 text-center text-sm text-neutral-500 dark:text-neutral-400"
                                        >
                                            {emptyMessage}
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item, idx) => renderRow(item, idx))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                {paginationData && <Pagination data={paginationData} />}
            </Card>

            {children}
        </div>
    );
}
