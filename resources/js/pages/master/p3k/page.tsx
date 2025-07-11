'use client';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { showToast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Download, FileText, Plus, Upload } from 'lucide-react';
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
                {/* Tombol Aksi */}
                <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                    {/* Tombol Create (utama - biru/primary) */}
                    <Button asChild>
                        <Link href="/master/p3k/create">
                            <Plus className="mr-1 h-4 w-4" />
                            Create
                        </Link>
                    </Button>

                    {/* Tombol Import (secondary atau outline) */}
                    <Button asChild variant="secondary">
                        <Link href="/master/p3k/import">
                            <Upload className="mr-1 h-4 w-4" />
                            Import
                        </Link>
                    </Button>

                    {/* Tombol Export (outline) */}
                    <Button
                        variant="outline"
                        onClick={() => {
                            window.location.href = '/master/p3k/export';
                        }}
                    >
                        <Download className="mr-1 h-4 w-4" />
                        Export
                    </Button>

                    {/* Tombol Download Template (outline) */}
                    <Button asChild variant="outline">
                        <a href="/template/master_p3k.xlsx" download>
                            <FileText className="mr-1 h-4 w-4" />
                            Template
                        </a>
                    </Button>
                </div>
                <div className="w-full">
                    <DataTable columns={columns} data={masterP3k ?? []} />
                </div>
            </div>
        </AppLayout>
    );
}
