'use client';

import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import {
    Building2,
    Calendar,
    Factory,
    MapPin,
    ShieldCheck,
    UserCheck,
} from 'lucide-react';
import type { BreadcrumbItem} from '@/types';

// --- Definisi Tipe Data ---
// Pastikan definisi tipe ini akurat sesuai data yang dikirim controller
interface MasterP3kItem {
    id: number;
    item_name: string;
    standard_quantity: number;
    unit: string;
}

interface FirstAidInspectionCondition {
    id: number;
    name: string;
}

interface FirstAidInspectionItemData {
    id: number;
    inspection_id: number;
    first_aid_check_item_id: number;
    quantity_found: number;
    condition_id: number;
    noted: string | null; // Pastikan ini 'noted'
    expired_at: string | null;
    created_at: string;
    updated_at: string;
    item?: MasterP3kItem; // Relasi ke MasterP3kItem
    condition?: FirstAidInspectionCondition; // Relasi ke FirstAidInspectionCondition
}

interface MasterP3kLocation {
    id: number;
    location: string;
    inventory_code: string;
    entity_code: string;
    plant_code: string;
}

interface MasterEntity {
    id: number;
    entity_code: string;
    name: string;
}

interface MasterPlant {
    id: number;
    plant_code: string;
    name: string;
}

interface ApprovalStatus {
    id: number;
    code: string;
    name: string;
}

interface User {
    id: number;
    name: string;
}

interface FirstAidInspectionDataProps {
    id: number;
    uuid: string;
    approval_status_code: string;
    entity_code: number;
    plant_code: number;
    car_auto_number: string;
    location_id: number;
    inspection_date: string;
    project_name: string | null;
    validator_note: string | null;
    approved_at: string | null;
    approved_by: number | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    location?: MasterP3kLocation;
    entity?: MasterEntity;
    plant?: MasterPlant;
    createdBy?: User;
    approvalStatus?: ApprovalStatus;
    approvedBy?: User;
    items: FirstAidInspectionItemData[]; // Pastikan ini array
}

interface ShowFirstAidInspectionProps {
    firstAidInspection: FirstAidInspectionDataProps;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Inspeksi P3K', href: '/inspection/first-aid' },
    { title: 'Detail', href: '#' },
];

export default function ShowFirstAidInspection({
    firstAidInspection,
}: ShowFirstAidInspectionProps) {
    // Debugging console log (ini akan muncul di konsol browser)
    console.log('firstAidInspection prop received:', firstAidInspection);
    console.log('Items array received:', firstAidInspection?.items);

    const {
        inspection_date,
        location,
        entity,
        plant,
        createdBy,
        approvalStatus,
        project_name,
        approved_at,
        validator_note,
        approvedBy,
        items = [], // Pastikan items selalu array kosong jika firstAidInspection null/undefined
    } = firstAidInspection ?? {};

    const formatDate = (value?: string | null) => {
        if (!value) return '-';
        try {
            const dateObj = new Date(value);
            if (isNaN(dateObj.getTime())) {
                return '-';
            }
            return format(dateObj, 'dd MMMM yyyy');
        } catch (e) {
            console.error('Failed to format date:', value, e);
            return '-';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Inspeksi P3K" />
            <div className="space-y-6 p-4">
                {/* Informasi Umum (Badges) */}
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                        <Calendar className="mr-1 h-4 w-4" />
                        {formatDate(inspection_date)}
                    </Badge>
                    <Badge variant="outline">
                        <MapPin className="mr-1 h-4 w-4" />
                        {location?.location ?? '-'}
                    </Badge>
                    <Badge variant="outline">
                        <Building2 className="mr-1 h-4 w-4" />
                        {entity?.name ?? '-'}
                    </Badge>
                    <Badge variant="outline">
                        <Factory className="mr-1 h-4 w-4" />
                        {plant?.name ?? '-'}
                    </Badge>
                    <Badge variant="outline">
                        <UserCheck className="mr-1 h-4 w-4" />
                        {createdBy?.name ?? '-'}
                    </Badge>
                    <Badge variant="outline">
                        <ShieldCheck className="mr-1 h-4 w-4" />
                        {approvalStatus?.name ?? 'Draft'}
                    </Badge>
                </div>

                {/* Detail Proyek dan Validasi */}
                <Card>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Nama Proyek</p>
                            <p className="text-sm">{project_name || '-'}</p>
                        </div>
                        {approved_at && (
                            <>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Komentar Validator</p>
                                    <p className="text-sm">{validator_note || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Disetujui Oleh</p>
                                    <p className="text-sm">{approvedBy?.name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tanggal Disetujui</p>
                                    <p className="text-sm">{formatDate(approved_at)}</p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Tabel Detail Inspeksi */}
                <Card className="overflow-hidden">
                    <CardContent className="overflow-x-auto pt-4">
                        <Table className="w-full table-auto border-collapse whitespace-normal">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">No</TableHead>
                                    <TableHead>Nama Obat</TableHead>
                                    <TableHead>Jumlah</TableHead>
                                    <TableHead>Satuan</TableHead>
                                    <TableHead>Kondisi</TableHead>
                                    <TableHead>Masa Berlaku</TableHead>
                                    <TableHead>Keterangan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* PENTING: Struktur ini sudah benar untuk React.Children.only */}
                                {items.length > 0 ? (
                                    items.map((item: FirstAidInspectionItemData, index: number) => (
                                        <TableRow key={String(item.id ?? index)}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{item.item?.item_name ?? '-'}</TableCell>
                                            <TableCell>{item.quantity_found ?? '-'}</TableCell>
                                            <TableCell>{item.item?.unit ?? '-'}</TableCell>
                                            <TableCell>{item.condition?.name ?? '-'}</TableCell>
                                            <TableCell>
                                                {item.expired_at ? formatDate(item.expired_at) : '-'}
                                            </TableCell>
                                            <TableCell>{item.noted ?? '-'}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            Tidak ada data inspeksi ditemukan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}