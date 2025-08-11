'use client';

import { useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import SectionHeader from '@/components/section-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { showToast } from '@/components/ui/toast';

// [FIX 1] Definisikan tipe LaravelPaginator di sini jika belum ada di global @/types
// Atau pastikan tipe ini diekspor dari @/types/index.ts
export interface LaravelPaginator<T> {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
}

// [FIX 2] Pastikan `columns` dan tipe datanya diimpor dengan benar
import { columns, AcInspectionRow } from './columns';

// Tipe props yang diterima dari controller@index
interface AcIndexPageProps {
    inspections: LaravelPaginator<AcInspectionRow>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: route('home') },
    { title: 'Laporan Inspeksi AC', href: route('inspection.ac.index') },
];

export default function AcInspectionPage({ inspections }: AcIndexPageProps) {
    const { flash } = usePage().props as {
        flash?: { success?: string; error?: string; };
    };

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
            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <SectionHeader
                        title="Laporan Inspeksi AC"
                        subtitle="Kelola dan lihat riwayat semua laporan inspeksi AC yang telah dibuat."
                    />
                    <Button asChild className="w-full sm:w-auto">
                        <Link href={route('inspection.ac.create')}>Buat Inspeksi Baru</Link>
                    </Button>
                </div>

                {/* [FIX 3] Hapus prop 'links' karena tidak didukung oleh komponen DataTable Anda */}
                <DataTable 
                    columns={columns} 
                    data={inspections.data}
                />
            </div>
        </AppLayout>
    );
}