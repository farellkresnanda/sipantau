'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Building2,
    Calendar,
    Factory,
    FileText,
    MapPin,
    ShieldCheck,
    UserCheck,
} from 'lucide-react';
import React from 'react';
import ValidatorVerifyFirstAidDialog from './verify-dialog';

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
        createdBy?: { id?: number; name?: string };
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
    approvedBy: string | null;
    creatorNameProp?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Inspeksi P3K', href: '/inspection/first-aid' },
    { title: 'Detail', href: '#' },
];

const getStatusLabel = (code: string) => {
    if (code === 'SAP') return 'Approved';
    if (code === 'SOP') return 'Open';
    if (code === 'SRE') return 'Rejected';
    return code ?? 'Open';
};

export default function ShowFirstAidInspection(props: ShowFirstAidInspectionProps) {
    const { firstAidInspection, inspectorNotes, approvedBy, creatorNameProp } = props;

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
        note_validator,
    } = firstAidInspection;

    const creatorNameToDisplay = creatorNameProp ?? 'Nama Tidak Tersedia';

    if (!firstAidInspection) {
        return <div className="p-4 text-red-600">Data inspeksi tidak ditemukan.</div>;
    }

    const formatDate = (date?: string | null) => {
        if (!date) return '-';
        const parsed = new Date(date);
        return isNaN(parsed.getTime()) ? '-' : format(parsed, 'dd MMMM yyyy');
    };

    const statusLabel = getStatusLabel(approval_status_code);
    const isApprovedOrRejected = ['Approved', 'Rejected'].includes(statusLabel);
    const showExportPdfButton = statusLabel === 'Approved';

    // Kondisi Kunci: Aksi validasi hanya bisa dilakukan jika statusnya 'Open'
    const canVerify = approval_status_code === 'SOP';

    const handleExportPdf = () => {
        window.open(route('first-aid-inspection.print', uuid), '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Inspeksi P3K" />

            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-center gap-2">
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
                        <span>{creatorNameToDisplay}</span>
                    </Badge>
                    <Badge variant="outline" title="Status">
                        <ShieldCheck className="mr-1 h-4 w-4" />
                        {statusLabel}
                    </Badge>

                    {showExportPdfButton && (
                        <Button
                            onClick={handleExportPdf}
                            className="inline-flex items-center gap-1 bg-blue-500 text-white hover:bg-blue-600"
                            size="sm"
                        >
                            <FileText className="h-4 w-4" />
                            Export PDF
                        </Button>
                    )}
                </div>

                <Card>
                    <CardContent className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">
                        <div>
                            <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                                <Calendar className="h-4 w-4" />
                                Tanggal Inspeksi
                            </p>
                            <p className="text-sm">{formatDate(inspection_date)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                                <MapPin className="h-4 w-4" />
                                Lokasi
                            </p>
                            <p className="text-sm">{location?.location ?? '-'}</p>
                        </div>

                        {isApprovedOrRejected && (
                            <>
                                <div>
                                    <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                                        <FileText className="h-4 w-4" />
                                        Nama Proyek
                                    </p>
                                    <p className="text-sm">{project_name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                                        <UserCheck className="h-4 w-4" />
                                        Disetujui Oleh
                                    </p>
                                    <p className="text-sm">{approvedBy ?? '-'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                                        <Calendar className="h-4 w-4" />
                                        Tanggal Disetujui
                                    </p>
                                    <p className="text-sm">{formatDate(approved_at)}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                                        <FileText className="h-4 w-4" />
                                        Komentar Validator
                                    </p>
                                    <p className="whitespace-pre-line text-sm">
                                        {note_validator || '-'}
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="overflow-x-auto pt-4">
                        <Table className="min-w-[700px] w-full table-fixed border-collapse whitespace-normal">
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
                                                    : '(Tidak ada keterangan)'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center text-muted-foreground"
                                        >
                                            Tidak ada data inspeksi ditemukan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="mt-6 flex justify-start gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.visit(route('inspection.first-aid.index'))}
                    >
                        Kembali
                    </Button>

                    {/* Aksi untuk Validator: Tombol/dialog ini hanya muncul jika status 'Open' (SOP) */}
                    {canVerify && (
                        <ValidatorVerifyFirstAidDialog
                            inspection={{ uuid, approval_status_code }}
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}