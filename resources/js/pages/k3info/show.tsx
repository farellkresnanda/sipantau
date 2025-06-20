import SectionHeader from '@/components/section-header';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'K3 Info',
        href: '/reports/k3info',
    },
    {
        title: 'View K3 Info',
        href: '#',
    },
];

interface K3InfoProps {
    k3Info: {
        title: string;
        description: string;
        image_path: string;
    };
}

export default function ShowK3Info({ k3Info }: K3InfoProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View K3 Info" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <SectionHeader title="View K3 Info" subtitle="Detailed information about the K3 info entry." />
                </div>

                <Card className="w-full">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-md font-semibold">Title</h4>
                                    <p className="text-gray-600">{k3Info.title}</p>
                                </div>

                                <div>
                                    <h4 className="text-md font-semibold">Description</h4>
                                    <p className="whitespace-pre-wrap text-gray-600">{k3Info.description}</p>
                                </div>
                            </div>

                            <div>
                                <div className="mt-2">
                                    <img
                                        src={`/storage/${k3Info.image_path}`}
                                        alt={k3Info.title}
                                        className="h-auto w-full max-w-md rounded-lg shadow-md p-3"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
