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
        title: 'Master Standar Kerja Gedung',
        href: '/master/building-work-standard',
    },
];

export default function PageMasterBuildingWorkStandard({ masterBuildingWorkStandards }: { masterBuildingWorkStandards: never[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Master Standar Kerja Gedung" />
            <div className="p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <SectionHeader
                        title="Master Standar Kerja Gedung"
                        subtitle="Kelola data standar kerja building Anda di sini. Anda dapat menambah, mengubah, dan menghapus standar kerja building."
                    />
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/master/building-work-standard/create">Create Data</Link>
                    </Button>
                </div>
                <div className="w-full">
                    <DataTable columns={columns} data={masterBuildingWorkStandards} />
                </div>
            </div>
        </AppLayout>
    );
}
