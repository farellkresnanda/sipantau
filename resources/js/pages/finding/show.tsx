import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Avatar } from '@radix-ui/react-avatar';
import { format } from 'date-fns';
import VerifyDialog from './verify-dialog';
import {
    AlertCircle,
    Building2,
    Calendar,
    Camera, CheckCircle,
    Factory,
    FileText,
    GitCommit,
    ListTree,
    MapPin,
    User
} from 'lucide-react';
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect } from 'react';
import { showToast } from '@/components/ui/toast';
import ApprovalHistorySection from '@/pages/finding/approval-history';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Temuan',
        href: '/finding',
    },
    {
        title: 'Lihat Detail Temuan',
        href: '#',
    },
];

export default function ShowFinding({ finding }: { finding: any }) {
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
            <Head title="Detail Temuan" />
            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1" title={`Nomor: ${finding.car_number_auto}`}>
                        <FileText className="h-4 w-4 text-orange-500" />
                        {finding.car_number_auto}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1" title={`Status Temuan: ${finding.finding_status?.name}`}>
                        <AlertCircle className="h-4 w-4 text-blue-500" />
                        {finding.finding_status?.name}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1" title={`Entitas: ${finding.entity?.name}`}>
                        <Building2 className="h-4 w-4 text-green-500" />
                        {finding.entity?.name}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1" title={`Plant: ${finding.plant?.name}`}>
                        <Factory className="h-4 w-4 text-purple-500" />
                        {finding.plant?.name}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1" title={`Dibuat oleh: ${finding.created_by?.name}`}>
                        <User className="h-4 w-4 text-red-500" />
                        {finding.created_by?.name}
                    </Badge>
                    <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                        title={`Dibuat pada: ${format(new Date(finding.created_at), 'dd MMMM yyyy')}`}
                    >
                        <Calendar className="h-4 w-4 text-yellow-500" />
                        {format(new Date(finding.created_at), 'dd MMMM yyyy')}
                    </Badge>
                    {finding.finding_status?.code === 'SCF' && (
                        <button
                            onClick={() => window.open(`/finding/${finding.uuid}/print`, '_blank')}
                            className="inline-flex items-center gap-1 rounded-md border border-transparent bg-blue-500 px-2.5 py-0.5 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
                        >
                            <FileText className="h-4 w-4" />
                            Export PDF
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
                    {/* Kolom 1: Detail Temuan (Karyawan s/d System) */}
                    <div className="space-y-4">
                        {/* Karyawan */}
                        <Card>
                            <CardContent className="space-y-6 pt-1">
                                <h3 className="text-lg font-semibold">Karyawan</h3>

                                {/* Tanggal dan Jenis */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {/* Tanggal dan Lokasi */}
                                    <div className="space-y-4">
                                        {/* Tanggal */}
                                        <div>
                                            <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                                <Calendar className="h-4 w-4" />
                                                Tanggal Temuan
                                            </Label>
                                            <div className="mt-1 text-sm">{format(new Date(finding.date), 'dd MMMM yyyy')}</div>
                                        </div>
                                        {/* Lokasi */}
                                        <div>
                                            <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                                <MapPin className="h-4 w-4" />
                                                Detail Lokasi
                                            </Label>
                                            <p className="mt-1 text-sm whitespace-pre-wrap">{finding.location_details}</p>
                                        </div>
                                    </div>
                                    {/* Jenis dan Sub Jenis */}
                                    <div className="space-y-4">
                                        {/* Ketidaksesuaian */}
                                        <div>
                                            <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                                <AlertCircle className="h-4 w-4" />
                                                Ketidaksesuaian
                                            </Label>
                                            <div className="mt-1 text-sm">{finding.nonconformity_type?.name}</div>
                                        </div>
                                        {/* Sub Ketidaksesuaian */}
                                        <div>
                                            <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                                <ListTree className="h-4 w-4" />
                                                Sub Ketidaksesuaian
                                            </Label>
                                            <div className="mt-1 text-sm">{finding.nonconformity_sub_type?.name}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Deskripsi Temuan */}
                                <div>
                                    <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                        <FileText className="h-4 w-4" />
                                        Deskripsi Temuan
                                    </Label>
                                    <p className="mt-1 text-sm whitespace-pre-wrap">{finding.finding_description}</p>
                                </div>

                                {/* Akar Masalah */}
                                <div>
                                    <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                        <GitCommit className="h-4 w-4" />
                                        Tulis Akar Masalah
                                    </Label>
                                    <p className="mt-1 text-sm whitespace-pre-wrap">{finding.root_cause}</p>
                                </div>

                                {/* Foto */}
                                {finding.photo_before && (
                                    <div>
                                        <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                            <Camera className="h-4 w-4" />
                                            Foto Temuan (Sebelum Perbaikan)
                                        </Label>
                                        <a
                                            href={`/storage/${finding.photo_before}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-1 inline-block text-sm text-blue-600 hover:underline"
                                        >
                                            Lihat foto sebelum perbaikan
                                        </a>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Teknisi */}
                        <Card>
                            <CardContent className="space-y-4 pt-1">
                                <h3 className="text-lg font-semibold">Teknisi</h3>
                                {/* Need Permit */}
                                <div>
                                    <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                        <FileText className="h-4 w-4" />
                                        Butuh Izin Kerja (Need Permit)
                                    </Label>
                                    <div className="mt-1 text-sm">{finding.need_permit ? 'Ya' : 'Tidak'}</div>
                                </div>
                                {/* Rencana Perbaikan */}
                                <div>
                                    <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                        <FileText className="h-4 w-4" />
                                        Rencana Perbaikan
                                    </Label>
                                    <p className="mt-1 text-sm whitespace-pre-wrap">{finding.corrective_plan || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                        <ListTree className="h-4 w-4" />
                                        Tindakan Perbaikan yang Dilakukan
                                    </Label>
                                    <p className="mt-1 text-sm whitespace-pre-wrap">{finding.corrective_action || '-'}</p>
                                </div>
                                {/* Batas Waktu Perbaikan */}
                                <div>
                                    <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                        <Calendar className="h-4 w-4" />
                                        Batas Waktu Perbaikan
                                    </Label>
                                    <div className="mt-1">
                                        {finding.corrective_due_date ? format(new Date(finding.corrective_due_date), 'dd MMMM yyyy') : '-'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Admin */}
                        <Card>
                            <CardContent className="space-y-4 pt-1">
                                <h3 className="text-lg font-semibold">Admin</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                            <FileText className="h-4 w-4" />
                                            Nomor CAR (Entitas/Plant)
                                        </Label>
                                        <div className="mt-1 text-sm">{finding.car_number_manual || '-'}</div>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                        <FileText className="h-4 w-4" />
                                        Catatan
                                    </Label>
                                    <p className="mt-1 text-sm whitespace-pre-wrap">
                                        {finding.finding_approval_histories?.find((history: any) => history.stage === 'Finalizing')?.note || '-'}
                                    </p>
                                </div>
                                {finding.photo_after && (
                                    <div>
                                        <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                            <Camera className="h-4 w-4" />
                                            Foto Temuan (Setelah Perbaikan)
                                        </Label>
                                        <a
                                            href={`/storage/${finding.photo_after}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 block text-blue-600 hover:underline"
                                        >
                                            Lihat foto setelah perbaikan
                                        </a>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Validator */}
                        <Card>
                            <CardContent className="space-y-4 pt-1">
                                <h3 className="text-lg font-semibold">Validator</h3>
                                {/* Komentar Validator */}
                                <div>
                                    <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                        <FileText className="h-4 w-4" />
                                        Catatan
                                    </Label>
                                    <p className="mt-1 text-sm whitespace-pre-wrap">
                                        {finding.finding_approval_histories?.find((history: any) => history.stage === 'Verification')?.note || '-'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Kolom 2: Riwayat Approval Temuan */}
                    <ApprovalHistorySection finding={finding} />
                </div>
            </div>
        </AppLayout>
    );
}
