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
        title: 'Manage Skala Prioritas',
        href: '/master/priority-scale',
    },
];

export default function PagePriorityScale({ priorityScales }: { priorityScales: never[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Skala Prioritas" />
            <div className="p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <SectionHeader
                        title="Manage Skala Prioritas"
                        subtitle="Kelola data skala prioritas Anda di sini. Anda dapat menambah, mengubah, dan menghapus skala prioritas."
                    />
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/master/priority-scale/create">Create Data</Link>
                    </Button>
                </div>
                <div className="w-full">
                    <DataTable columns={columns} data={priorityScales} />
                </div>
            </div>
        </AppLayout>
    );
}
