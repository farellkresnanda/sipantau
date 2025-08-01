'use client';

import React, { useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table'; // Pastikan komponen DataTable Anda tersedia
import { showToast } from '@/components/ui/toast'; // Pastikan showToast Anda tersedia
import type { BreadcrumbItem } from '@/types'; // Asumsi Anda punya tipe BreadcrumbItem
import SectionHeader from '@/components/section-header'; // <<< TAMBAHKAN BARIS INI
import { columns, AcInspectionRow } from './columns'; // Akan kita buat di langkah berikutnya

// --- Definisikan Tipe untuk Objek Paginator dari Laravel ---
// Ini sesuai dengan struktur yang dikirim Laravel dari method index()
// Anda bisa memindahkan interface ini ke '@/types/index.ts' jika ingin menggunakannya secara global
export interface LaravelPaginator<T> {
    current_page: number;
    data: T[]; // Array data yang sebenarnya
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
// Sesuaikan dengan data yang dikirim dari AcInspectionController@index
interface AcIndexPageProps {
    inspections: LaravelPaginator<AcInspectionRow>;
    // Jika ada props lain dari backend, tambahkan di sini
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Inspeksi AC', href: '/inspection/ac' },
];

export default function AcInspectionPage({ inspections }: AcIndexPageProps) {
    // Ambil flash messages dari props Inertia
    const { flash } = usePage().props as {
        flash?: { success?: string; error?: string; message?: string };
    };

    // Efek untuk menampilkan toast messages
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
            <Head title="Inspeksi AC" />
            <div className="space-y-6 p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <SectionHeader
                        title="Daftar Inspeksi AC"
                        subtitle="Kelola data Inspeksi AC di sini. Anda dapat menambah, mengubah, dan menghapus Inspeksi AC."
                    />
                    <Button asChild className="w-full sm:w-auto">
                        <Link href={route('inspection.ac.create')}>Buat Inspeksi AC</Link>
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