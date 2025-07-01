'use client';

import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { showToast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { columns, MasterApd } from './columns';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Master APD', href: '/master/apd' },
];

export default function PageMasterApd({ masterApd }: { masterApd: MasterApd[] }) {
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
            <Head title="Master APD" />
            <div className="p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <SectionHeader
                        title="Master APD"
                        subtitle="Kelola data master daftar APD. Anda dapat menambah, mengubah, dan menghapus data daftar APD."
                    />
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/master/apd/create">Create Master APD</Link>
                    </Button>
                </div>
                <div className="w-full">
                    <DataTable columns={columns} data={masterApd ?? []} />
                </div>
            </div>
        </AppLayout>
    );
}
