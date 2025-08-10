import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { showToast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Download, FileText, Plus, Upload } from 'lucide-react';
import { useEffect } from 'react';
import { columns } from './columns';

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
                    <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                        {/* Tombol Create (utama - biru/primary) */}
                        <Button asChild>
                            <Link href="/master/apar/create">
                                <Plus className="mr-1 h-4 w-4" />
                                Create
                            </Link>
                        </Button>

                        {/* Tombol Import (secondary atau outline) */}
                        <Button asChild variant="secondary">
                            <Link href="/master/apar/import">
                                <Upload className="mr-1 h-4 w-4" />
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
                            <Download className="mr-1 h-4 w-4" />
                            Export
                        </Button>

                        {/* Tombol Download Template (outline) */}
                        <Button asChild variant="outline">
                            <a href="/template/master_apar.xlsx" download>
                                <FileText className="mr-1 h-4 w-4" />
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
