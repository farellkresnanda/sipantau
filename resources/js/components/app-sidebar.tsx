import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BackpackIcon, BookMarkedIcon,
    BookOpen,
    ChartBarIcon,
    FileUserIcon,
    Info,
    LayoutGrid, ShieldCheck,
    TargetIcon,
    UsersIcon
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Home',
        href: '/home',
        icon: LayoutGrid,
    },

    {
        title: 'Temuan',
        href: '#',
        icon: UsersIcon,
    },

    {
        title: 'Inspeksi',
        href: '#',
        icon: UsersIcon,
    },

    {
        title: 'JSA',
        href: '#',
        icon: UsersIcon,
    },

    {
        title: 'Working Permit',
        href: '#',
        icon: UsersIcon,
    },

    {
        title: 'Dokumen',
        href: '#',
        icon: FileUserIcon,
    },

    {
        title: 'Target & Capaian',
        href: '#',
        icon: TargetIcon,
    },

    {
        title: 'Statistik K3',
        href: '#',
        icon: ChartBarIcon,
    },

    {
        title: 'IBPR',
        href: '#',
        icon: BackpackIcon,
    },

    {
        title: 'Audit K3',
        href: '#',
        icon: ShieldCheck,
    },

    {
        title: 'Manage Users',
        href: '/users',
        icon: UsersIcon,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'About Us',
        href: '/about-us',
        icon: Info,
    },
    {
        title: 'Informasi K3',
        href: 'informasi-k3',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/home" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
