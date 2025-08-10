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
        title: 'Master AC',
        href: '/master/ac',
    },
];

export default function PageMasterAc({ masterAc }: { masterAc: never[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Master AC" />
            <div className="p-4">
                <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Bagian Header Kiri */}
                    <SectionHeader
                        title="Master AC"
                        subtitle="Kelola data master AC. Anda dapat menambah, mengubah, dan menghapus data AC."
                    />

                    {/* Tombol Aksi */}
                    <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2">
                        {/* Tombol Create */}
                        <Button asChild>
                            <Link href="/master/ac/create">
                                <Plus className="w-4 h-4 mr-1" />
                                Create
                            </Link>
                        </Button>

                        {/* Tombol Import */}
                        <Button asChild variant="secondary">
                            <Link href="/master/ac/import">
                                <Upload className="w-4 h-4 mr-1" />
                                Import
                            </Link>
                        </Button>

                        {/* Tombol Export */}
                        <Button
                            variant="outline"
                            onClick={() => {
                                window.location.href = '/master/ac/export';
                            }}
                        >
                            <Download className="w-4 h-4 mr-1" />
                            Export
                        </Button>

                        {/* Tombol Template */}
                        <Button asChild variant="outline">
                            <a href="/template/master_ac.xlsx" download>
                                <FileText className="w-4 h-4 mr-1" />
                                Template
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="w-full">
                    <DataTable columns={columns} data={masterAc} />
                </div>
            </div>
        </AppLayout>
    );
}
