import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import {
    Bell,
    CheckCircle2,
    Command,
    ExternalLink,
    Globe,
    LayoutGrid,
    Moon,
    Search,
    ShieldCheck,
    Sun,
    User,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const page = usePage();
    const user = page.props.auth?.user as { name?: string; role?: { name?: string } } | undefined;
    const roleName = user?.role?.name || 'Super Admin';

    return (
        <header className="sticky top-3 z-30 mx-4 sm:mx-6 my-2.5 flex h-14 shrink-0 items-center justify-between rounded-xl border border-[#dbdade]/70 bg-white/95 px-4 shadow-[0_2px_6px_0_rgba(47,43,61,0.08)] backdrop-blur-md transition-all dark:border-[#434968] dark:bg-[#2f3349]/95">
            {/* Left: Sidebar Toggle + Vuexy Search Input */}
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1 text-[#5d596c] hover:text-[#7367f0] dark:text-[#cfcde4]" />

                <div className="relative hidden md:flex items-center">
                    <Search className="absolute left-2.5 size-4 text-[#a5a3ae]" />
                    <input
                        type="text"
                        placeholder="Search (Ctrl+/)"
                        className="h-9 w-64 rounded-lg bg-[#f8f7fa] pl-9 pr-8 text-xs text-[#444050] placeholder:text-[#a5a3ae] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7367f0] dark:bg-[#25293c] dark:text-[#cfcde4] dark:focus:bg-[#2f3349]"
                        readOnly
                    />
                    <kbd className="absolute right-2.5 rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#82808b] shadow-xs border border-[#dbdade]/50 dark:bg-[#2f3349] dark:border-[#434968] dark:text-[#a5a3ae]">
                        ⌘K
                    </kbd>
                </div>

                <div className="hidden lg:flex items-center gap-2 pl-2">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            {/* Right: Quick Actions, Live Storefront & User Profile */}
            <div className="flex items-center gap-2.5">
                {/* Live Storefront Pill */}
                <a
                    href="https://eclectic-kleicha-c2a33e.netlify.app/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#28c76f]/10 border border-[#28c76f]/30 px-3 py-1.5 text-xs font-semibold text-[#28c76f] transition hover:bg-[#28c76f]/20"
                >
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#28c76f] opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-[#28c76f]" />
                    </span>
                    <span className="hidden sm:inline">Storefront Live</span>
                    <ExternalLink className="size-3" />
                </a>

                {/* Notifications Button with Red Pill Badge */}
                <div className="relative">
                    <button
                        type="button"
                        className="flex size-9 items-center justify-center rounded-lg text-[#5d596c] hover:bg-[#f4f5fb] hover:text-[#7367f0] dark:text-[#cfcde4] dark:hover:bg-[#353952]"
                    >
                        <Bell className="size-[18px]" />
                        <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-[#ff4c51] text-[9px] font-bold text-white shadow-xs">
                            5
                        </span>
                    </button>
                </div>

                {/* Role Badge */}
                <span className="hidden md:inline-flex items-center gap-1 rounded-md bg-[#7367f0]/10 px-2.5 py-1 text-xs font-semibold text-[#7367f0] border border-[#7367f0]/20">
                    <ShieldCheck className="size-3.5" />
                    <span>{roleName}</span>
                </span>

                {/* User Avatar with Green Online Status */}
                <div className="flex items-center gap-2 pl-1">
                    <div className="relative">
                        <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#7367f0] to-[#9e95f5] text-xs font-bold text-white shadow-sm">
                            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
                        </div>
                        <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-[#28c76f] ring-2 ring-white dark:ring-[#2f3349]" />
                    </div>
                </div>
            </div>
        </header>
    );
}
