// resources/js/pages/inspection/ac/page.tsx

'use client';

import { useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import type { PageProps, BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import SectionHeader from '@/components/section-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { showToast } from '@/components/ui/toast';
import { columns, AcInspectionRow } from './columns';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: route('home') },
    { title: 'Laporan Inspeksi AC', href: route('inspection.ac.index') },
];

// Tipe untuk link paginasi dari Laravel
interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

// Tipe data untuk Paginator Laravel
export interface LaravelPaginator<T> {
    current_page: number;
    data: T[];
    first_page_url: string | null;
    from: number | null;
    last_page: number;
    last_page_url: string | null;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

// Menambahkan tipe untuk user dan auth agar konsisten
type UserWithRoles = {
    id: number;
    name: string;
    email: string;
    roles: { name: string }[];
};

interface CurrentPageProps extends PageProps {
    inspections: LaravelPaginator<AcInspectionRow>;
    auth: PageProps['auth'] & {
        user: UserWithRoles;
    };
}

export default function AcInspectionPage({ inspections }: CurrentPageProps) {
    const { flash, auth } = usePage<CurrentPageProps>().props;

    const canCreate = auth.user.roles.some(role => ['SuperAdmin', 'Technician'].includes(role.name));

    // Efek untuk menampilkan notifikasi (toast) dari server
    useEffect(() => {
        if (flash?.success) {
            showToast({ type: 'success', message: flash.success });
        }
        if (flash?.error) {
            showToast({ type: 'error', message: flash.error });
        }
    }, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Inspeksi AC" />
            <div className="p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-center">
                    <SectionHeader
                        title="Laporan Inspeksi AC"
                        subtitle="Kelola dan lihat riwayat semua laporan inspeksi AC yang telah dibuat."
                    />
                    {canCreate && (
                        <Button asChild className="w-full sm:w-auto">
                            <Link href={route('inspection.ac.create')}>Buat Inspeksi</Link>
                        </Button>
                    )}
                </div>

                <div className="w-full">
                    <DataTable columns={columns} data={inspections.data} />
                </div>
                
            </div>
        </AppLayout>
    );
}
