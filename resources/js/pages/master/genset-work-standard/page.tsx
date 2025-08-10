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
        title: 'Master Standar Kerja Genset',
        href: '/master/genset-work-standard',
    },
];

export default function PageGensetWorkStandard({ masterGensetWorkStandards }: { masterGensetWorkStandards: never[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Master Standar Kerja Genset" />
            <div className="p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <SectionHeader
                        title="Master Standar Kerja Genset"
                        subtitle="Kelola data standar kerja genset Anda di sini. Anda dapat menambah, mengubah, dan menghapus standar kerja genset."
                    />
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/master/genset-work-standard/create">Create Data</Link>
                    </Button>
                </div>
                <div className="w-full">
                    <DataTable columns={columns} data={masterGensetWorkStandards} />
                </div>
            </div>
        </AppLayout>
    );
}
