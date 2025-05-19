import { Head } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import {Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Activity logs',
        href: '/settings/activity-log',
    },
];

type ActivityLog = {
    id: number;
    causer_id: number;
    description: string;
    event: string;
    created_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
};

export default function ActivityLog({ activityLogs }: { activityLogs: ActivityLog[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity logs" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Activity logs" description="View history of actions taken in your account" />

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No.</TableHead>
                                <TableHead>Causer</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activityLogs.slice(0, 10).map((log, index) => (
                                <TableRow key={log.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{log.user?.name ?? log.causer_id}</TableCell>
                                    <TableCell>{log.description}</TableCell>
                                    <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        {activityLogs.length > 10 && (
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={4} className="text-right">
                                        Showing first 10 of {activityLogs.length} entries
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        )}
                    </Table>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
