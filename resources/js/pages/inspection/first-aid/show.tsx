'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { Building2, Calendar, CheckCircle, Clock, FileText, ListChecks, User, XCircle } from 'lucide-react';
import InspectionVerifyDialog from './verify-dialog'; // Impor dialog verifikasi
import { type InspectionFirstAidData } from './columns'; // Impor tipe data

// Definisikan tipe data yang lebih lengkap untuk halaman detail
type InspectionShowData = InspectionFirstAidData & {
    details: {
        id: number;
        quantity_found: number;
        item: {
            id: number;
            item_name: string;
            standard_quantity: number;
        };
        condition: {
            id: number;
            name: string;
        };
    }[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: route('home'),
    },
    {
        title: 'Inspeksi P3K',
        href: route('inspections.index'),
    },
    {
        title: 'Lihat Detail Inspeksi',
        href: '#',
    },
];

export default function ShowInspection({ inspection }: { inspection: InspectionShowData }) {
    const status = inspection.status;
    let statusBadge = {
        icon: <Clock className="h-4 w-4 text-yellow-500" />,
        text: status?.name,
        className: 'bg-yellow-100 text-yellow-700',
    };
    if (status?.id === 2) { // Approved
        statusBadge = {
            icon: <CheckCircle className="h-4 w-4 text-green-500" />,
            text: status.name,
            className: 'bg-green-100 text-green-700',
        };
    } else if (status?.id === 3) { // Rejected
        statusBadge = {
            icon: <XCircle className="h-4 w-4 text-red-500" />,
            text: status.name,
            className: 'bg-red-100 text-red-700',
        };
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Inspeksi P3K - ${inspection.kit?.location}`} />
            <div className="space-y-6 p-4">
                {/* Header Badges */}
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={`flex items-center gap-1 ${statusBadge.className}`}>
                        {statusBadge.icon}
                        {statusBadge.text}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        {inspection.kit?.location}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                        <User className="h-4 w-4 text-blue-500" />
                        {inspection.inspector?.name}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        {format(new Date(inspection.inspection_date), 'dd MMMM yyyy')}
                    </Badge>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
                    {/* Kolom Kiri: Detail dan Checklist */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Detail Inspeksi</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p>
                                    <strong>Lokasi:</strong> {inspection.kit?.location}
                                </p>
                                <p>
                                    <strong>Kode Inventaris:</strong> {inspection.kit?.inventory_code}
                                </p>
                                <p>
                                    <strong>Diinspeksi oleh:</strong> {inspection.inspector?.name}
                                </p>
                                <p>
                                    <strong>Pada Tanggal:</strong> {format(new Date(inspection.inspection_date), 'dd MMMM yyyy, HH:mm')} WIB
                                </p>
                                <p>
                                    <strong>Hasil Temuan:</strong> {inspection.has_findings ? 'Ada Temuan' : 'Sesuai'}
                                </p>
                                {inspection.notes && (
                                    <p className="whitespace-pre-wrap pt-2">
                                        <strong>Catatan:</strong> <br />
                                        {inspection.notes}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ListChecks /> Hasil Checklist Inspeksi
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="divide-y">
                                    {inspection.details?.map((detail) => (
                                        <div key={detail.id} className="grid grid-cols-3 gap-4 py-3 text-sm">
                                            <div className="col-span-2 font-medium">{detail.item.item_name}</div>
                                            <div className="text-right">
                                                <p>
                                                    {detail.quantity_found} / {detail.item.standard_quantity}
                                                </p>
                                                <p className="text-xs text-gray-500">{detail.condition.name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Kolom Kanan: Status Validasi */}
                    <div className="space-y-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Status Validasi</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {inspection.status?.id === 1 ? (
                                    <p className="text-muted-foreground text-sm">Menunggu verifikasi dari Validator.</p>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/micah/svg?seed=${inspection.validator?.name}`} />
                                            <AvatarFallback>{inspection.validator?.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium leading-none">{inspection.validator?.name}</p>
                                            <p className="text-muted-foreground text-sm">
                                                {format(new Date(inspection.validated_at!), 'dd MMM yyyy, HH:mm')} WIB
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {/* Tombol verifikasi akan muncul di sini jika user adalah validator & status pending */}
                                <InspectionVerifyDialog inspection={inspection} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}