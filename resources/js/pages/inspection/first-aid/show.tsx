import React from 'react';
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
import {
    Building2,
    Calendar,
    Factory,
    FileText,
    MapPin,
    ShieldCheck,
    UserCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import ValidatorVerifyFirstAidDialog from './verify-dialog';
import type { BreadcrumbItem } from '@/types';

interface ShowFirstAidInspectionProps {
    firstAidInspection: {
        uuid: string;
        approval_status_code: string;
        inspection_date: string;
        project_name: string | null;
        approved_at: string | null;
        approved_by: number | null;
        car_auto_number?: string | null;
        location?: { location: string };
        entity?: { name: string };
        plant?: { name: string };
        createdBy?: { name: string }; // Pastikan tipe ini sudah benar di sini
        approvalStatus?: { name: string };
        note_validator: string | null;
    };
    inspectorNotes: Array<{
        item_name: string;
        note: string | null;
        condition: string;
        quantity_found: number;
        expired_at: string | null;
    }>;
    approvedBy: string | null; // Ini adalah prop terpisah yang Anda buat
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Inspeksi P3K', href: '/inspection/first-aid' },
    { title: 'Detail', href: '#' },
];

export default function ShowFirstAidInspection(props: ShowFirstAidInspectionProps) { // Menggunakan 'props' langsung
    const { firstAidInspection, inspectorNotes, approvedBy } = props; // Destructuring dari 'props'

    // Tidak perlu destructuring ulang dari firstAidInspection jika sudah di-destructure di atas
    const {
        uuid,
        approval_status_code,
        inspection_date,
        project_name,
        car_auto_number,
        approved_at,
        location,
        entity,
        plant,
        // createdBy, // Hapus createdBy dari destructuring ini
        approvalStatus,
        note_validator,
    } = firstAidInspection;

    // === DEBUGGING TAMBAHAN UNTUK createdBy ===
    // Pastikan createdBy diakses dari firstAidInspection langsung
    const creatorName = firstAidInspection.createdBy?.name ?? '-';
    // console.log("Final creatorName for display:", creatorName);
    // ==========================================

    if (!firstAidInspection) {
        return <div className="p-4 text-red-600">Data inspeksi tidak ditemukan.</div>;
    }

    const formatDate = (date?: string | null) => {
        if (!date) return '-';
        const parsed = new Date(date);
        return isNaN(parsed.getTime()) ? '-' : format(parsed, 'dd MMMM yyyy');
    };

    const isApprovedOrRejected = ['SAP', 'SRE'].includes(approval_status_code);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Inspeksi P3K" />

            <div className="space-y-6 p-4">
                {/* Ringkasan Badge */}
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" title="Nomor CAR">
                        <FileText className="mr-1 h-4 w-4" />
                        {car_auto_number || '-'}
                    </Badge>
                    <Badge variant="outline" title="Tanggal Inspeksi">
                        <Calendar className="mr-1 h-4 w-4" />
                        {formatDate(inspection_date)}
                    </Badge>
                    <Badge variant="outline" title="Lokasi">
                        <MapPin className="mr-1 h-4 w-4" />
                        {location?.location ?? '-'}
                    </Badge>
                    <Badge variant="outline" title="Entitas">
                        <Building2 className="mr-1 h-4 w-4" />
                        {entity?.name ?? '-'}
                    </Badge>
                    <Badge variant="outline" title="Plant">
                        <Factory className="mr-1 h-4 w-4" />
                        {plant?.name ?? '-'}
                    </Badge>
                    <Badge variant="outline" title="Petugas Inspeksi">
                        <UserCheck className="mr-1 h-4 w-4" />
                        {/* MENGGUNAKAN creatorName YANG SUDAH DIKONFIRMASI */}
                        {creatorName}
                    </Badge>
                    <Badge variant="outline" title="Status">
                        <ShieldCheck className="mr-1 h-4 w-4" />
                        {approvalStatus?.name ?? 'Draft'}
                    </Badge>

                    <ValidatorVerifyFirstAidDialog
                        inspection={{ uuid, approval_status_code }}
                    />
                </div>

                {/* Informasi Utama & Verifikasi */}
                <Card>
                    <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-4">
                        {/* Tanggal Inspeksi - Selalu Tampil di dalam Card */}
                        <div>
                            <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                                <Calendar className="h-4 w-4" />
                                Tanggal Inspeksi
                            </p>
                            <p className="text-sm">{formatDate(inspection_date)}</p>
                        </div>

                        {/* Lokasi - Selalu Tampil di dalam Card */}
                        <div>
                            <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                                <MapPin className="h-4 w-4" />
                                Lokasi
                            </p>
                            <p className="text-sm">{location?.location ?? '-'}</p>
                        </div>

                        {/* Bagian detail yang hanya tampil jika status SAP atau SRE */}
                        {isApprovedOrRejected && (
                            <>
                                {/* Nama Proyek - Conditional */}
                                <div>
                                    <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                                        <FileText className="h-4 w-4" />
                                        Nama Proyek
                                    </p>
                                    <p className="text-sm">{project_name || '-'}</p>
                                </div>

                                {/* Disetujui Oleh - Conditional */}
                                <div>
                                    <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                                        <UserCheck className="h-4 w-4" />
                                        Disetujui Oleh
                                    </p>
                                    <p className="text-sm">{approvedBy ?? '-'}</p>
                                </div>

                                {/* Tanggal Disetujui - Conditional */}
                                <div>
                                    <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                                        <Calendar className="h-4 w-4" />
                                        Tanggal Disetujui
                                    </p>
                                    <p className="text-sm">{formatDate(approved_at)}</p>
                                </div>

                                {/* Komentar Validator - Conditional */}
                                <div className="md:col-span-2">
                                    <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                                        <FileText className="h-4 w-4" />
                                        Komentar Validator
                                    </p>
                                    <p className="text-sm whitespace-pre-line">
                                        {note_validator || '-'}
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Tabel Detail Item */}
                <Card>
                    <CardContent className="overflow-x-auto pt-4">
                        <Table className="w-full min-w-[700px] table-fixed border-collapse whitespace-normal">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">No</TableHead>
                                    <TableHead>Nama Obat</TableHead>
                                    <TableHead>Jumlah</TableHead>
                                    <TableHead>Kondisi</TableHead>
                                    <TableHead>Masa Berlaku</TableHead>
                                    <TableHead>Keterangan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inspectorNotes.length > 0 ? (
                                    inspectorNotes.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{item.item_name}</TableCell>
                                            <TableCell>{item.quantity_found}</TableCell>
                                            <TableCell>{item.condition}</TableCell>
                                            <TableCell>{formatDate(item.expired_at)}</TableCell>
                                            <TableCell>
                                                {item.note && item.note.trim() !== ''
                                                    ? item.note
                                                    : '(Tidak ada keterangan)'
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
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