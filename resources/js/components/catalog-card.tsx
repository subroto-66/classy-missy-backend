import React, { ReactNode } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface CatalogCardProps {
    title: string;
    eyebrow?: string | null;
    description?: string | null;
    image?: string | null;
    imageHeight?: string;
    fallbackIcon?: ReactNode;
    status?: boolean | 'active' | 'inactive' | 'live' | 'paused';
    statusLabel?: string;
    headerBadge?: ReactNode;
    meta?: ReactNode;
    footerLeft?: ReactNode;
    onEdit?: () => void;
    onDelete?: () => void;
    className?: string;
}

export function CatalogCard({
    title,
    eyebrow,
    description,
    image,
    imageHeight = 'h-36',
    fallbackIcon,
    status,
    statusLabel,
    headerBadge,
    meta,
    footerLeft,
    onEdit,
    onDelete,
    className = '',
}: CatalogCardProps) {
    // Determine status badge
    let statusBadge: ReactNode = null;
    if (status !== undefined) {
        const isActive = status === true || status === 'active' || status === 'live';
        const label =
            statusLabel ||
            (isActive
                ? status === 'live'
                    ? 'Live'
                    : 'Active'
                : status === 'paused'
                  ? 'Paused'
                  : 'Disabled');

        statusBadge = isActive ? (
            <Badge className="bg-emerald-500/90 text-white text-[10px] shadow-xs">
                {label}
            </Badge>
        ) : (
            <Badge
                variant="outline"
                className="bg-black/50 text-white border-white/20 text-[10px]"
            >
                {label}
            </Badge>
        );
    }

    return (
        <Card
            className={`flex flex-col justify-between overflow-hidden border-[#dbdade]/80 bg-white shadow-xs transition hover:shadow-md dark:border-[#434968] dark:bg-[#2f3349] p-0 ${className}`}
        >
            <div>
                {/* Top Image Banner */}
                <div
                    className={`relative ${imageHeight} w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden`}
                >
                    {image ? (
                        <img
                            src={image}
                            alt={title}
                            className="size-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center text-neutral-400">
                            {fallbackIcon}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Top Right Badges */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                        {headerBadge}
                        {statusBadge}
                    </div>

                    {/* Bottom overlay text on banner if eyebrow is provided (e.g. Campaign) */}
                    {eyebrow && (
                        <div className="absolute bottom-2.5 left-3.5 right-3.5 text-white z-10">
                            <p className="text-[10px] font-semibold tracking-wider uppercase text-rose-300">
                                {eyebrow}
                            </p>
                            <h3 className="text-base font-bold truncate drop-shadow-sm">
                                {title}
                            </h3>
                        </div>
                    )}
                </div>

                {/* Card Body */}
                <CardContent className="p-4 space-y-2">
                    {!eyebrow && (
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-neutral-900 truncate dark:text-neutral-100">
                                {title}
                            </h3>
                            {meta}
                        </div>
                    )}

                    {description && (
                        <p className="text-xs text-neutral-500 line-clamp-2 dark:text-neutral-400">
                            {description}
                        </p>
                    )}
                </CardContent>
            </div>

            {/* Card Footer Actions */}
            <div className="flex items-center justify-between border-t border-[#dbdade]/60 px-4 py-2.5 text-xs dark:border-[#434968]">
                <div className="min-w-0 text-neutral-400">{footerLeft}</div>
                <div className="flex items-center gap-1.5 shrink-0">
                    {onEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onEdit}
                            className="h-7 text-xs px-2.5 flex items-center gap-1 text-primary border-primary/30 hover:bg-primary/10 hover:text-primary"
                        >
                            <Pencil className="size-3" />
                            <span>Edit</span>
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDelete}
                            className="h-7 text-xs px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                            title="Delete item"
                        >
                            <Trash2 className="size-3" />
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}

export default CatalogCard;
