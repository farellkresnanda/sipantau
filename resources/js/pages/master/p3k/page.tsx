'use client';

import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { showToast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { columns, MasterP3k } from './columns';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Master P3K', href: '/master/p3k' },
];

export default function PageMasterP3k({ masterP3k }: { masterP3k: MasterP3k[] }) {
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
            <Head title="Master P3K" />
            <div className="p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <SectionHeader
                        title="Master P3K"
                        subtitle="Kelola data master lokasi kotak P3K. Anda dapat menambah, mengubah, dan menghapus data P3K."
                    />
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/master/p3k/create">Create Data</Link>
                    </Button>
                </div>
                <div className="w-full">
                    <DataTable columns={columns} data={masterP3k ?? []} />
                </div>
            </div>
        </AppLayout>
    );
}