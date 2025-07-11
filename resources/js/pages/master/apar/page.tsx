import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { showToast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { columns } from './columns';
import { Plus, Upload, Download, FileText } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Master APAR',
        href: '/master-apar',
    },
];

export default function PageMasterApar({ masterApar }: { masterApar: never[] }) {
    const { flash } = usePage().props as {
        flash?: { success?: string; error?: string; message?: string };
    };

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
        <Head title="Inspeksi APAR" />
        <div className="p-4">
            <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Bagian Header Kiri */}
                <SectionHeader
                    title="Master APAR"
                    subtitle="Kelola data master inspeksi APAR. Anda dapat menambah, mengubah, dan menghapus data inspeksi APAR."
                />

                {/* Tombol Aksi */}
               <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2">
    {/* Tombol Create (utama - biru/primary) */}
    <Button asChild>
        <Link href="/master/apar/create">
            <Plus className="w-4 h-4 mr-1" />
            Create
        </Link>
    </Button>

    {/* Tombol Import (secondary atau outline) */}
    <Button asChild variant="secondary">
        <Link href="/master/apar/import">
            <Upload className="w-4 h-4 mr-1" />
            Import
        </Link>
    </Button>

    {/* Tombol Export (outline) */}
    <Button
    variant="outline"
    onClick={() => {
        window.location.href = '/master/apar/export';
    }}
>
    <Download className="w-4 h-4 mr-1" />
    Export
</Button>


    {/* Tombol Download Template (outline) */}
<Button asChild variant="outline">
    <a href="/template/master_apar.xlsx" download>
        <FileText className="w-4 h-4 mr-1" />
        Template
    </a>
</Button>

</div>
            </div>

            <div className="w-full">
                <DataTable columns={columns} data={masterApar} />
            </div>
        </div>
    </AppLayout>
);

}
