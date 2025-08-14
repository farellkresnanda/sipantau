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
        title: 'JSA',
        href: '/analysis/jsa',
    },
];

export default function PageBuildingDocument({ jsaDocuments }: { jsaDocuments: never[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analisis Keselamatan Kerja (JSA)" />
            <div className="p-4">
                <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Bagian Header Kiri */}
                    <SectionHeader
                        title="Analisis Keselamatan Kerja (JSA)"
                        subtitle="Kelola data list dokumen terkait JSA. Anda dapat menambah, mengubah, dan menghapus data dokumen JSA."
                    />

                    {/* Tombol Aksi */}
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/analysis/jsa/create">Buat Dokumen</Link>
                    </Button>
                </div>

                <div className="w-full">
                    <DataTable columns={columns} data={jsaDocuments} />
                </div>
            </div>
        </AppLayout>
    );
}
