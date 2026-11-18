import { Link } from '@inertiajs/react';
import {
    LayoutDashboard,
    Megaphone,
    Newspaper,
    Package,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Tags,
    UserCheck,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';

export function AppSidebar() {
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();
    const { toggleSidebar } = useSidebar();

    const navItems = [
        {
            title: 'Analytics & Sales',
            href: '/dashboard',
            icon: LayoutDashboard,
            badge: 'Hot',
            badgeColor: 'bg-[#ff4c51] text-white',
        },
        {
            title: 'Roles & Permissions',
            href: '/admin/roles',
            icon: ShieldCheck,
            dividerBefore: true,
        },
        {
            title: 'Users & Staff',
            href: '/admin/users',
            icon: Users,
        },
        {
            title: 'Products List',
            href: '/admin/products',
            icon: Package,
            dividerBefore: true,
        },
        {
            title: 'Categories',
            href: '/admin/categories',
            icon: Tags,
        },
        {
            title: 'Brands',
            href: '/admin/brands',
            icon: Sparkles,
        },
        {
            title: 'Orders',
            href: '/admin/orders',
            icon: ShoppingBag,
            badge: '5',
            badgeColor: 'bg-primary/15 text-primary',
        },
        {
            title: 'Customers',
            href: '/admin/customers',
            icon: UserCheck,
        },
        {
            title: 'Glow Campaigns',
            href: '/admin/campaigns',
            icon: Megaphone,
        },
        {
            title: 'Blogs & Articles',
            href: '/admin/blogs',
            icon: Newspaper,
        },
    ];

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-r border-[#dbdade]/70 bg-white dark:border-[#434968] dark:bg-[#2f3349] transition-all"
        >
            {/* Vuexy Brand Header */}
            <SidebarHeader className="h-16 px-4 flex items-center justify-between border-b border-[#dbdade]/50 dark:border-[#434968]">
                <div className="flex items-center justify-between w-full">
                    <Link href="/dashboard" className="flex items-center gap-2.5">
                        <AppLogo />
                    </Link>
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className="hidden group-data-[state=expanded]:flex size-5 rounded-full border-2 border-primary items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
                        title="Toggle Sidebar"
                    >
                        <div className="size-2 rounded-full bg-primary" />
                    </button>
                </div>
            </SidebarHeader>

            {/* Clean Nav Menu Items (No section header text) */}
            <SidebarContent className="px-3 py-3">
                <SidebarMenu className="space-y-1">
                    {navItems.map((item) => {
                        const isDashboard = item.href === '/dashboard';
                        const active = isDashboard
                            ? isCurrentUrl(item.href)
                            : isCurrentUrl(item.href) || isCurrentOrParentUrl(item.href);

                        return (
                            <div key={item.title}>
                                {item.dividerBefore && (
                                    <div className="my-2 mx-1 h-px bg-[#dbdade]/50 dark:bg-[#434968]/50 group-data-[collapsible=icon]:hidden" />
                                )}
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={active}
                                        tooltip={{ children: item.title }}
                                        className={`group/btn h-10 rounded-lg px-3.5 transition-all text-[13.5px] font-medium ${
                                            active
                                                ? '!bg-gradient-to-r !from-primary !to-[var(--primary-hover)] !text-white !shadow-[0_2px_6px_0_rgba(var(--primary-rgb),0.48)] font-semibold'
                                                : 'text-[#5d596c] hover:bg-primary/10 hover:text-primary dark:text-[#cfcde4] dark:hover:bg-[#353952]'
                                        }`}
                                    >
                                        <Link
                                            href={item.href}
                                            prefetch
                                            className={`flex items-center justify-between w-full min-w-0 ${
                                                active ? '!text-white' : ''
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <item.icon
                                                    className={`size-[18px] shrink-0 transition-colors ${
                                                        active
                                                            ? '!text-white'
                                                            : 'text-[#82808b] group-hover/btn:text-primary dark:text-[#a5a3ae] dark:group-hover/btn:text-primary'
                                                    }`}
                                                />
                                                <span
                                                    className={`truncate whitespace-nowrap transition-colors ${
                                                        active
                                                            ? '!text-white font-semibold'
                                                            : 'text-[#5d596c] group-hover/btn:text-primary dark:text-[#cfcde4] dark:group-hover/btn:text-primary'
                                                    }`}
                                                >
                                                    {item.title}
                                                </span>
                                            </div>
                                            {item.badge && (
                                                <span
                                                    className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                                                        active
                                                            ? 'bg-white/25 !text-white'
                                                            : item.badgeColor || 'bg-primary text-white'
                                                    }`}
                                                >
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </div>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            {/* Vuexy Sidebar Footer: User Profile */}
            <SidebarFooter className="border-t border-[#dbdade]/50 p-2.5 dark:border-[#434968]">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
