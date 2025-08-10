import AppLayout from '@/layouts/app-layout';
import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { showToast } from '@/components/ui/toast';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import type { BreadcrumbItem } from '@/types';
import { columns } from './columns';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Inspeksi K3L', href: '/inspection/k3l' },
];

export default function PageK3LInspection({ k3lInspections }: { k3lInspections: any[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inspeksi K3L" />
            <div className="p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <SectionHeader
                        title="Daftar Inspeksi K3L"
                        subtitle="Kelola data inspeksi K3L di sini. Anda dapat menambah, mengubah, dan menghapus inspeksi."
                    />
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/inspection/k3l/create">Buat Inspeksi</Link>
                    </Button>
                </div>

                <div className="w-full overflow-x-auto">
                    <div className="min-w-[1000px]">
                        <DataTable columns={columns} data={k3lInspections} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
