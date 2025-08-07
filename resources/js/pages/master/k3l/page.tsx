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
        title: 'Master K3l',
        href: '/master-k3l',
    },
];

export default function PageK3l({ k3List }: { k3List: never[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Master K3L" />
            <div className="p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <SectionHeader
                        title="Master K3L"
                        subtitle="Kelola data master K3l di sistem ini. Anda dapat menambah, mengubah, dan menghapus data master K3l sesuai dengan kebutuhan sistem dan pengguna."
                    />
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/master/k3l/create">Create Data</Link>
                    </Button>
                </div>
                <div className="w-full">
                    <DataTable columns={columns} data={k3List} />
                </div>
            </div>
        </AppLayout>
    );
}
