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
        href: '/users',
    },
    {
        title: 'Kelola Data Pengguna',
        href: '/users',
    },
];

export default function PageUser({ users }: { users: never[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Data Pengguna" />
            <div className="p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <SectionHeader
                        title="Kelola Data Pengguna"
                        subtitle="Kelola data pengguna di sini. Anda dapat menambah, mengubah, dan menghapus data pengguna."
                    />
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/users/create">Create User</Link>
                    </Button>
                </div>
                <div className="w-full">
                    <DataTable columns={columns} data={users} />
                </div>
            </div>
        </AppLayout>
    );
}
