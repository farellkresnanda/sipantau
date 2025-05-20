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
        title: 'Manage Users',
        href: '/users',
    },
];

export default function PageUser({ users }: { users: never[] }) {
    const { flash } = usePage().props as {
        flash?: { success?: string; error?: string; message?: string };
    };

    useEffect(() => {
        if (flash?.success) {
            showToast({ type: 'success', message: flash.success });
        }
        if (flash?.error) {
            showToast({ type: 'error', message: flash.error });
        }
        if (flash?.message) {
            showToast({ message: flash.message });
        }
    }, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Users" />
            <div className="p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <SectionHeader title="Manage Users" subtitle="Manage your users here. You can add, edit, and delete users." />
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
