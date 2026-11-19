import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    CheckCircle2,
    Command,
    ExternalLink,
    Globe,
    LayoutGrid,
    Moon,
    Search,
    Settings,
    ShieldCheck,
    Sun,
    User,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { NotificationDropdown } from '@/components/notification-dropdown';
import { ThemeColorPicker } from '@/components/theme-color-picker';
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
                <SidebarTrigger className="-ml-1 text-[#5d596c] hover:text-primary dark:text-[#cfcde4]" />

                <div className="relative hidden md:flex items-center">
                    <Search className="absolute left-2.5 size-4 text-[#a5a3ae]" />
                    <input
                        type="text"
                        placeholder="Search (Ctrl+/)"
                        className="h-9 w-64 rounded-lg bg-[#f8f7fa] pl-9 pr-8 text-xs text-[#444050] placeholder:text-[#a5a3ae] focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-[#25293c] dark:text-[#cfcde4] dark:focus:bg-[#2f3349]"
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
            <div className="flex items-center gap-2">
                {/* View Live Storefront */}
                <a
                    href="http://localhost:5173"
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#5d596c] hover:text-primary hover:bg-primary/10 transition-colors dark:text-[#cfcde4] dark:hover:bg-[#353952]"
                    title="Open Live Storefront"
                >
                    <Globe className="size-3.5 text-primary" />
                    <span>Live Store</span>
                    <ExternalLink className="size-3 text-[#a5a3ae]" />
                </a>

                {/* Direct Store Settings Link */}
                <Link
                    href="/settings/appearance"
                    className="size-9 rounded-lg flex items-center justify-center text-[#5d596c] hover:text-primary hover:bg-primary/10 transition-colors dark:text-[#cfcde4] dark:hover:bg-[#353952]"
                    title="Store Settings & Branding"
                >
                    <Settings className="size-[18px]" />
                </Link>

                {/* Theme Brand Color Customizer Dropdown */}
                <ThemeColorPicker variant="menu" />

                {/* Notifications Dropdown */}
                <NotificationDropdown />
            </div>
        </header>
    );
}
