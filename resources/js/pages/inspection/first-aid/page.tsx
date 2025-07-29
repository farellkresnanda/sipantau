// resources/js/pages/inspection/first-aid/page.tsx

'use client';

import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { showToast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import type { PageProps } from '@/types';
import type { BreadcrumbItem } from '@/types'; 
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { columns, FirstAidInspectionRow } from './columns';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Inspeksi P3K',
        href: '/inspection/first-aid',
    },
];

// --- Definisikan Tipe untuk Objek Paginator dari Laravel ---
// Ini sesuai dengan struktur yang dikirim Laravel dari method index()
// PENTING: Pastikan ini sudah diekspor dari resources/js/types/index.ts jika Anda ingin menggunakannya kembali
export interface LaravelPaginator<T> { 
    current_page: number;
    data: T[]; // Array data yang sebenarnya, ini yang akan menjadi FirstAidInspectionRow[]
    first_page_url: string | null;
    from: number | null;
    last_page: number;
    last_page_url: string | null;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

// --- Definisikan Tipe Props untuk Halaman Ini ---
// Tipe ini menggabungkan PageProps dasar Inertia dengan prop spesifik halaman ini (inspections)
interface CurrentPageProps extends PageProps {
    inspections: LaravelPaginator<FirstAidInspectionRow>;
}


export default function Page({ inspections }: CurrentPageProps) {
    // Destrukturisasi `flash` dari `usePage().props`. Karena CurrentPageProps extend PageProps,
    // `flash` dan `errors` sudah menjadi bagian dari `usePage().props`.
    const { flash } = usePage().props as unknown as PageProps;

    useEffect(() => {
        if (flash?.success) {
            showToast({ type: 'success', message: flash.success });
        }
        if (flash?.error) {
            showToast({ type: 'error', message: flash.error });
        }
        if (flash?.message) {
            showToast({ message: flash.message });
        }
    }, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inspeksi P3K" />
            <div className="p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <SectionHeader
                        title="Daftar Inspeksi P3K"
                        subtitle="Kelola data Inspeksi P3K di sini. Anda dapat menambah, mengubah, dan menghapus Inspeksi P3K."
                    />
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/inspection/first-aid/create">Buat Inspeksi P3K</Link>
                    </Button>
                </div>
                <div className="w-full overflow-x-auto">
                    <div className="min-w-[1000px]">
                        {/* Mengakses properti 'data' dari objek paginator 'inspections' */}
                        <DataTable columns={columns} data={inspections.data} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}