import SectionHeader from '@/components/section-header';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { CheckCircle, XCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'K3 Info',
        href: '/analysis/hse-information',
    },
    {
        title: 'View K3 Info',
        href: '#',
    },
];

interface K3InfoProps {
    hseInformation: {
        title: string;
        description: string;
        image_path: string;
        status: string;
        created_at: string;
        updated_at: string;
    };
}

export default function ShowK3Info({ hseInformation }: K3InfoProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lihat Detail K3 Info" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <SectionHeader title="Lihat K3 Info" subtitle="Informasi detail tentang K3 info yang dipilih." />
                </div>

                <Card className="w-full">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-md font-semibold">Judul</h4>
                                    <p className="text-gray-600">{hseInformation.title}</p>
                                </div>

                                <div>
                                    <h4 className="text-md font-semibold">Deskripsi</h4>
                                    <p className="whitespace-pre-wrap text-gray-600">{hseInformation.description}</p>
                                </div>

                                <div>
                                    <h4 className="text-md font-semibold">Status</h4>
                                    {(() => {
                                        let icon;
                                        let colorClasses;
                                        let label;

                                        if (hseInformation.status === 'On Display') {
                                            icon = <CheckCircle className="h-4 w-4" />;
                                            colorClasses = 'bg-green-100 text-green-700';
                                            label = 'On Display';
                                        } else if (hseInformation.status === 'Not Display') {
                                            icon = <XCircle className="h-4 w-4" />;
                                            colorClasses = 'bg-red-100 text-red-700';
                                            label = 'Not Display';
                                        } else {
                                            return (
                                                <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                                                    ⚠️ Unknown
                                                </div>
                                            );
                                        }

                                        return (
                                            <div
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colorClasses}`}
                                            >
                                                {icon}
                                                {label}
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div>
                                    <h4 className="text-md font-semibold">Dibuat pada</h4>
                                    <p className="text-gray-600">{new Date(hseInformation.created_at).toLocaleString()}</p>
                                </div>

                                <div>
                                    <h4 className="text-md font-semibold">Diperbarui pada</h4>
                                    <p className="text-gray-600">{new Date(hseInformation.updated_at).toLocaleString()}</p>
                                </div>
                            </div>

                            <div>
                                <div className="mt-2">
                                    <img
                                        src={`/storage/${hseInformation.image_path}`}
                                        alt={hseInformation.title}
                                        className="h-auto w-full max-w-md rounded-lg p-3 shadow-md"
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
