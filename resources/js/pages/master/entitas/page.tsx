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
        title: 'Manage Entitas',
        href: '/master-entitas',
    },
];

export default function PageEntitas({ entitas }: { entitas: never[] }) {
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
            <Head title="Manage Entitas" />
            <div className="p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <SectionHeader title="Manage Entitas" subtitle="Manage your entitas here. You can add, edit, and delete entitas." />
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/master-entitas/create">Create Entitas</Link>
                    </Button>
                </div>
                <div className="w-full">
                    <DataTable columns={columns} data={entitas} />
                </div>
            </div>
        </AppLayout>
    );
}
