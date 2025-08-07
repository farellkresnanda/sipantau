import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { showToast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { columns } from './columns';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Manage Sertifikasi K3',
        href: '/master/hse-certification',
    },
];

export default function PageHseCertification({ masterHseCertifications }: { masterHseCertifications: never[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Sertifikasi K3" />
            <div className="p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <SectionHeader
                        title="Manage Sertifikasi K3"
                        subtitle="Kelola data tipe sertifikasi K3 Anda di sini. Anda dapat menambah, mengubah, dan menghapus tipe sertifikasi K3."
                    />
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/master/hse-certification/create">Create Data</Link>
                    </Button>
                </div>
                <div className="w-full">
                    <DataTable columns={columns} data={masterHseCertifications} />
                </div>
            </div>
        </AppLayout>
    );
}
