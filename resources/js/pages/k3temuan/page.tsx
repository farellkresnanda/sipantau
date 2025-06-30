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
        title: 'Temuan',
        href: '/k3temuan',
    },
];

export default function PageK3Temuan({ k3Temuans }: { k3Temuans: any[] }) {
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
            <Head title="Temuan" />
            <div className="p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <SectionHeader title="Temuan Users" subtitle="Temuan your k3temuan here. You can add, edit, and delete k3temuan." />
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/k3temuan/create">Create User</Link>
                    </Button>
                </div>
                <div className="w-full overflow-x-auto">
                    <div className="min-w-[1000px]">
                        <DataTable columns={columns} data={k3Temuans} />
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
