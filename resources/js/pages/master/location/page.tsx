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
        title: 'Master Lokasi',
        href: '/master-location',
    },
];

export default function PageAc({ locationList }: { locationList: never[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Master Lokasi" />
            <div className="p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <SectionHeader
                        title="Master Lokasi"
                        subtitle="Kelola data master Lokasi di sistem ini. Anda dapat menambah, mengubah, dan menghapus data master Lokasi sesuai dengan kebutuhan sistem dan pengguna."
                    />
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/master/location/create">Create Data</Link>
                    </Button>
                </div>
                <div className="w-full">
                    <DataTable columns={columns} data={locationList} />
                </div>
            </div>
        </AppLayout>
    );
}
