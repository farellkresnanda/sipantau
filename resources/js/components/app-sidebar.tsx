import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BackpackIcon,
    BookOpen, BookUpIcon, BriefcaseMedical,
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
        href: '/k3temuan',
        icon: DoorClosedIcon,
    },

    {
        title: 'Inspeksi',
        href: '#',
        icon: ComputerIcon,
        children: [
            {
                title: 'Inspeksi APAR',
                href: '/inspeksi/apar',
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
        title: 'Analisis',
        href: '#',
        icon: ChartBarIcon,
        children: [
            {
                title: 'JSA',
                href: '/reports/jsa',
                icon: UsersIcon,
            },
            {
                title: 'Izin Kerja',
                href: '/reports/izin-kerja',
                icon: UsersIcon,
            },
            {
                title: 'Program Kerja K3',
                href: '/reports/dokumen',
                icon: FileUserIcon,
            },
            {
                title: 'Kecelakaan Kerja ',
                href: '/reports/dokumen',
                icon: FileUserIcon,
            },
            {
                title: 'IBPR',
                href: '/reports/ibpr',
                icon: BackpackIcon,
            },
            {
                title: 'Informasi K3',
                href: '/reports/k3info',
                icon: FenceIcon,
            },
        ],
    },

    {
        title: 'Laporan',
        href: '#',
        icon: BookUpIcon,
        children: [
            {
                title: 'Laporan P2K3',
                href: '#',
                icon: UsersIcon,
            },
            {
                title: 'Uji Riksa',
                href: '#',
                icon: UsersIcon,
            },
            {
                title: 'Sertifikasi K3',
                href: '#',
                icon: UsersIcon,
            },
        ],
    },

    {
        title: 'Manage',
        href: '#',
        icon: UsersIcon,
        children: [
            {
                title: 'Master Users',
                href: '/users',
                icon: UsersIcon,
            },
            {
                title: 'Master Inspeksi Ac',
                href: '#',
                icon: UsersIcon,
            },
            {
                title: 'Master Inspeksi Apar',
                href: '#',
                icon: UsersIcon,
            },
            {
                title: 'Master Inspeksi Apd',
                href: '#',
                icon: UsersIcon,
            },
            {
                title: 'Master Inspeksi Gedung',
                href: '#',
                icon: UsersIcon,
            },
            {
                title: 'Master Inspeksi Genset',
                href: '#',
                icon: UsersIcon,
            },
            {
                title: 'Master Inspeksi K3l',
                href: '#',
                icon: UsersIcon,
            },
            {
                title: 'Master Inspeksi K3l Deskripsi',
                href: '#',
                icon: UsersIcon,
            },
            {
                title: 'Master Inspeksi P3k',
                href: '#',
                icon: UsersIcon,
            },
            {
                title: 'Master Jenis Ketidaksesuaian',
                href: '#',
                icon: UsersIcon,
            },
            {
                title: 'Master Jenis Ketidaksesuaian Sub',
                href: '#',
                icon: UsersIcon,
            },
            {
                title: 'Master Konsekuensi',
                href: '#',
                icon: UsersIcon,
            },
            {
                title: 'Master Laporan Uji Riksa Fasilitas',
                href: '#',
                icon: UsersIcon,
            },
            {
                title: 'Master Laporan Uji Riksa Peralatan',
                href: '#',
                icon: UsersIcon,
            },
            {
                title: 'Master Lokasi',
                href: '#',
                icon: UsersIcon,
            },
            {
                title: 'Master Plant',
                href: '#',
                icon: UsersIcon,
            },
            {
                title: 'Master Probabilitas',
                href: '#',
                icon: UsersIcon,
            },
            {
                title: 'Master Rumus Ltifr',
                href: '#',
                icon: UsersIcon,
            },
            {
                title: 'Master Sertifikasi K3',
                href: '#',
                icon: UsersIcon,
            },
            {
                title: 'Master Skala Prioritas',
                href: '#',
                icon: UsersIcon,
            },
            {
                title: 'Master Statistik K3',
                href: '#',
                icon: UsersIcon,
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
