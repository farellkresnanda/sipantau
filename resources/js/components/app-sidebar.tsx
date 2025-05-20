import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BackpackIcon,
    BookOpen, BriefcaseMedical,
    Building2,
    ChartBarIcon,
    ClipboardCheck, ComputerIcon, DoorClosedIcon, DoorOpenIcon, FenceIcon,
    FileUserIcon,
    HardHat,
    Info, InfoIcon,
    LayoutGrid, LucideBadgeInfo,
    Power,
    Recycle,
    ShieldCheck,
    TargetIcon,
    UsersIcon,
    Wind
} from 'lucide-react';
import AppLogo from './app-logo';

interface NavItemWithChildren extends NavItem {
    children?: NavItem[];
}

const mainNavItems: NavItemWithChildren[] = [
    {
        title: 'Home',
        href: '/home',
        icon: LayoutGrid,
    },

    {
        title: 'Temuan',
        href: '/temuan',
        icon: DoorClosedIcon,
    },

    {
        title: 'Inspeksi',
        href: '#',
        icon: ComputerIcon,
        children: [
            {
                title: 'Inspeksi APAR/APAB',
                href: '/inspeksi/apar-apab',
                icon: ClipboardCheck,
            },
            {
                title: 'Inspeksi Kotak P3K',
                href: '/inspeksi/kotak-p3k',
                icon: BriefcaseMedical,
            },
            {
                title: 'Inspeksi APD',
                href: '/inspeksi/apd',
                icon: HardHat,
            },
            {
                title: 'Inspeksi K3L',
                href: '/inspeksi/k3l',
                icon: Recycle,
            },
            {
                title: 'Inspeksi AC',
                href: '/inspeksi/ac',
                icon: Wind,
            },
            {
                title: 'Pemeliharaan Gedung',
                href: '/inspeksi/gedung',
                icon: Building2,
            },
            {
                title: 'Pemeliharaan Genset',
                href: '/inspeksi/genset',
                icon: Power,
            },
        ],
    },

    {
        title: 'Reports & Analytics',
        href: '#',
        icon: ChartBarIcon,
        children: [
            {
                title: 'JSA',
                href: '/reports/jsa',
                icon: UsersIcon,
            },
            {
                title: 'Working Permit',
                href: '/reports/working-permit',
                icon: UsersIcon,
            },
            {
                title: 'Dokumen',
                href: '/reports/dokumen',
                icon: FileUserIcon,
            },
            {
                title: 'Target & Capaian',
                href: '/reports/target-capaian',
                icon: TargetIcon,
            },
            {
                title: 'Statistik K3',
                href: '/reports/statistik-k3',
                icon: ChartBarIcon,
            },
            {
                title: 'IBPR',
                href: '/reports/ibpr',
                icon: BackpackIcon,
            },
            {
                title: 'Informasi K3',
                href: '/reports/informasi-k3',
                icon: FenceIcon,
            },
            {
                title: 'Audit K3',
                href: '/reports/audit-k3',
                icon: ShieldCheck,
            },
        ],
    },

    {
        title: 'Manage',
        href: '#',
        icon: UsersIcon,
        children: [
            {
                title: 'Users',
                href: '/users',
                icon: UsersIcon,
            },
            {
                title: 'Gedung',
                href: '/master/gedung',
                icon: Building2,
            },
            {
                title: 'Kategori Inspeksi',
                href: '/master/kategori-inspeksi',
                icon: ClipboardCheck,
            },
            {
                title: 'Kategori Temuan',
                href: '/master/kategori-temuan',
                icon: DoorClosedIcon,
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'About Us',
        href: '/about-us',
        icon: Info,
    },
    {
        title: 'Dokumentasi',
        href: 'dokumentasi',
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
