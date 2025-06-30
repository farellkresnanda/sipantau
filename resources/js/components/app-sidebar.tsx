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
    HardHat, HotelIcon,
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
                icon: BookUpIcon,
            },
            {
                title: 'Uji Riksa',
                href: '#',
                icon: ClipboardCheck,
            },
            {
                title: 'Sertifikasi K3',
                href: '#',
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
                title: 'Master Users',
                href: '/users',
                icon: UsersIcon,
            },
            {
                title: 'Master Entitas',
                href: 'master-entitas',
                icon: HotelIcon,
            },
            {
                title: 'Master Inspeksi Ac',
                href: '#',
                icon: Wind,
            },
            {
                title: 'Master Inspeksi Apar',
                href: '#',
                icon: ClipboardCheck,
            },
            {
                title: 'Master Inspeksi Apd',
                href: '#',
                icon: HardHat,
            },
            {
                title: 'Master Inspeksi Gedung',
                href: '#',
                icon: Building2,
            },
            {
                title: 'Master Inspeksi Genset',
                href: '#',
                icon: Power,
            },
            {
                title: 'Master Inspeksi K3l',
                href: '#',
                icon: Recycle,
            },
            {
                title: 'Master Inspeksi K3l Deskripsi',
                href: '#',
                icon: InfoIcon,
            },
            {
                title: 'Master Inspeksi P3k',
                href: '#',
                icon: BriefcaseMedical,
            },
            {
                title: 'Master Jenis Ketidaksesuaian',
                href: '#',
                icon: DoorClosedIcon,
            },
            {
                title: 'Master Jenis Ketidaksesuaian Sub',
                href: '#',
                icon: DoorOpenIcon,
            },
            {
                title: 'Master Konsekuensi',
                href: '#',
                icon: TargetIcon,
            },
            {
                title: 'Master Laporan Uji Riksa Fasilitas',
                href: '#',
                icon: Building2,
            },
            {
                title: 'Master Laporan Uji Riksa Peralatan',
                href: '#',
                icon: ComputerIcon,
            },
            {
                title: 'Master Lokasi',
                href: '#',
                icon: LayoutGrid,
            },
            {
                title: 'Master Plant',
                href: '#',
                icon: FenceIcon,
            },
            {
                title: 'Master Probabilitas',
                href: '#',
                icon: ChartBarIcon,
            },
            {
                title: 'Master Rumus Ltifr',
                href: '#',
                icon: LucideBadgeInfo,
            },
            {
                title: 'Master Sertifikasi K3',
                href: '#',
                icon: ShieldCheck,
            },
            {
                title: 'Master Skala Prioritas',
                href: '#',
                icon: TargetIcon,
            },
            {
                title: 'Master Statistik K3',
                href: '#',
                icon: ChartBarIcon,
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
