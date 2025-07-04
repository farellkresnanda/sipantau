'use client';

import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { showToast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { columns, MasterGedung } from './columns';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Master Gedung', href: '/master/gedung' },
];

export default function PageMasterGedung({ masterGedung }: { masterGedung: MasterGedung[] }) {
    const { flash } = usePage().props as {
        flash?: { success?: string; error?: string; message?: string };
    };

    useEffect(() => {
        if (flash?.success) showToast({ type: 'success', message: flash.success });
        if (flash?.error) showToast({ type: 'error', message: flash.error });
        if (flash?.message) showToast({ message: flash.message });
    }, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Master Gedung" />
            <div className="p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <SectionHeader
                        title="Master Gedung"
                        subtitle="Kelola data master lokasi gedung. Anda dapat menambah, mengubah, dan menghapus data gedung."
                    />
                    <Button asChild className="w-full sm:w-auto">
                        {/* Link ke halaman pembuatan data gedung */}
                        <Link href={route('gedung.create')}>Create Data</Link>
                    </Button>
                </div>
                <div className="w-full">
                    {/* Menggunakan columns dan data MasterGedung */}
                    <DataTable columns={columns} data={masterGedung ?? []} />
                </div>
            </div>
        </AppLayout>
    );
}
