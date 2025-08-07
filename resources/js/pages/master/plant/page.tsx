import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { columns } from './columns';
import { showToast } from '@/components/ui/toast';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Manage Plant',
        href: '/master/plant',
    },
];

export default function PageEntitas({ plantList }: { plantList: never[] }) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage PLant" />
            <div className="p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <SectionHeader
                        title="Manage Plant"
                        subtitle="Kelola data plant Anda di sini. Anda dapat menambah, mengubah, dan menghapus plant."
                    />
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/master/plant/create">Create Data</Link>
                    </Button>
                </div>
                <div className="w-full">
                    <DataTable columns={columns} data={plantList} />
                </div>
            </div>
        </AppLayout>
    );
}
