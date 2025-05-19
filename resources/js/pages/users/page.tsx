import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {Head, Link} from '@inertiajs/react';
import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import SectionHeader from "@/components/section-header";
import {Button} from "@/components/ui/button";

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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Users" />
            <div className="p-4">
                <div className="mb-3 flex items-center justify-between">
                    <SectionHeader title="Manage Users" subtitle="Manage your users here. You can add, edit, and delete users." />
                    <Button asChild>
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
