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
    ClipboardCheck, ComputerIcon, DoorClosedIcon, FenceIcon,
    FileUserIcon,
    HardHat, HotelIcon,
    Info,
    LayoutGrid,
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
        href: '/finding',
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
                href: '/inspeksi/building',
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
                href: '/analysis/jsa',
                icon: UsersIcon,
            },
            {
                title: 'Izin Kerja',
                href: '/analysis/izin-kerja',
                icon: UsersIcon,
            },
            {
                title: 'Program Kerja K3',
                href: '/analysis/dokumen',
                icon: FileUserIcon,
            },
            {
                title: 'Kecelakaan Kerja ',
                href: '/analysis/dokumen',
                icon: FileUserIcon,
            },
            {
                title: 'IBPR',
                href: '/analysis/ibpr',
                icon: BackpackIcon,
            },
            {
                title: 'Informasi K3',
                href: '/analysis/hse-information',
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
                href: '/master/entity',
                icon: HotelIcon,
            },
            {
                title: 'Master AC',
                href: '/master/ac',
                icon: Wind,
            },
            {
                title: 'Master APAR',
                href: '/master/apar',
                icon: ClipboardCheck,
            },
            {
                title: 'Master APD',
                href: '/master/apd',
                icon: HardHat,
            },
            {
                title: 'Master Gedung',
                href: '/master/building',
                icon: Building2,
            },
            {
                title: 'Master Genset',
                href: '/master/genset',
                icon: Power,
            },
            {
                title: 'Master K3L',
                href: '/master/k3l',
                icon: Recycle,
            },
            {
                title: 'Master P3K',
                href: '/master/p3k',
                icon: BriefcaseMedical,
            },
            {
                title: 'Master Ketidaksesuaian',
                href: '/master/nonconformity-type',
                icon: DoorClosedIcon,
            },
            {
                title: 'Master Konsekuensi',
                href: '/master/consequence',
                icon: TargetIcon,
            },
            {
                title: 'Master Uji Riksa Fasilitas',
                href: '/master/test-facility-report',
                icon: Building2,
            },
            {
                title: 'Master Uji Riksa Peralatan',
                href: '/master/test-equipment-report',
                icon: ComputerIcon,
            },
            {
                title: 'Master Lokasi',
                href: '/master/location',
                icon: LayoutGrid,
            },
            {
                title: 'Master Plant',
                href: '/master/plant',
                icon: FenceIcon,
            },
            {
                title: 'Master Probabilitas',
                href: '/master/probability',
                icon: ChartBarIcon,
            },
            {
                title: 'Master Sertifikasi K3',
                href: '/master/hse-certification',
                icon: ShieldCheck,
            },
            {
                title: 'Master Skala Prioritas',
                href: '/master/priority-scale',
                icon: TargetIcon,
            },
            {
                title: 'Master Standar Kerja Gedung',
                href: '/master/building-work-standard',
                icon: ClipboardCheck,
            },
            {
                title: 'Master Standar Kerja Genset',
                href: '/master/genset-work-standard',
                icon: Power,
            },
            {
                title: 'Master Statistik K3',
                href: '/master/hse-statistic',
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
