import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { columns } from './columns';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Inspeksi Gedung',
        href: '/inspection/building',
    },
];

export default function PageBuildingInspection({ buildingInspections }: { buildingInspections: never[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inspeksi Gedung" />
            <div className="p-4">
                <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Bagian Header Kiri */}
                    <SectionHeader
                        title="Inspeksi Gedung"
                        subtitle="Kelola data inspeksi Gedung. Anda dapat menambah, mengubah, dan menghapus data inspeksi Gedung."
                    />

                    {/* Tombol Aksi */}
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/inspection/building/create">Buat Inspeksi</Link>
                    </Button>
                </div>

                <div className="w-full">
                    <DataTable columns={columns} data={buildingInspections} />
                </div>
            </div>
        </AppLayout>
    );
}
