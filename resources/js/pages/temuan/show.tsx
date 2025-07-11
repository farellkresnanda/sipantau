import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { AlertCircle, Calendar, Camera, FileText, GitCommit, ListTree, MapPin } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Temuan',
        href: '/temuan',
    },
    {
        title: 'Lihat Detail Temuan',
        href: '#',
    },
];

export default function ShowK3Temuan({ temuan }: { temuan: any }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Temuan" />
            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge title={`Nomor CAR: ${temuan.nomor_car_auto}`}>{temuan.nomor_car_auto}</Badge>
                    <Badge title={`Status Temuan: ${temuan.status_temuan?.nama}`}>{temuan.status_temuan?.nama}</Badge>
                    <Badge title={`Status Approval: ${temuan.status_approval?.nama}`}>{temuan.status_approval?.nama}</Badge>
                </div>

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
                                    <div className="mt-1 text-sm font-medium">{format(new Date(temuan.tanggal), 'dd MMMM yyyy')}</div>
                                </div>
                                {/* Lokasi */}
                                <div>
                                    <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                        <MapPin className="h-4 w-4" />
                                        Detail Lokasi
                                    </Label>
                                    <p className="mt-1 text-sm whitespace-pre-wrap">{temuan.detail_lokasi_temuan}</p>
                                </div>
                            </div>
                            {/* Jenis dan Sub Jenis */}
                            <div className="space-y-4">
                                {/* Jenis Ketidaksesuaian */}
                                <div>
                                    <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                        <AlertCircle className="h-4 w-4" />
                                        Jenis Ketidaksesuaian
                                    </Label>
                                    <div className="mt-1 text-sm font-medium">{temuan.jenis_ketidaksesuaian?.nama}</div>
                                </div>
                                {/* Sub Jenis Ketidaksesuaian */}
                                <div>
                                    <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                        <ListTree className="h-4 w-4" />
                                        Sub Jenis Ketidaksesuaian
                                    </Label>
                                    <div className="mt-1 text-sm font-medium">{temuan.jenis_ketidaksesuaian_sub?.nama}</div>
                                </div>
                            </div>
                        </div>

                        {/* Deskripsi Temuan */}
                        <div>
                            <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                <FileText className="h-4 w-4" />
                                Deskripsi Temuan
                            </Label>
                            <p className="mt-1 text-sm whitespace-pre-wrap">{temuan.deskripsi_temuan}</p>
                        </div>

                        {/* Akar Masalah */}
                        <div>
                            <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                <GitCommit className="h-4 w-4" />
                                Tulis Akar Masalah
                            </Label>
                            <p className="mt-1 text-sm whitespace-pre-wrap">{temuan.akar_masalah}</p>
                        </div>

                        {/* Foto */}
                        {temuan.foto_temuan_sebelum && (
                            <div>
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                    <Camera className="h-4 w-4" />
                                    Foto Temuan (Sebelum Perbaikan)
                                </Label>
                                <a
                                    href={`/storage/${temuan.foto_temuan_sebelum}`}
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
                        {/* Rencana Perbaikan */}
                        <div>
                            <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                <FileText className="h-4 w-4" />
                                Rencana Perbaikan
                            </Label>
                            <p className="mt-1 whitespace-pre-wrap">{temuan.rencana_perbaikan}</p>
                        </div>
                        {/* Batas Waktu Perbaikan */}
                        <div>
                            <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                <Calendar className="h-4 w-4" />
                                Batas Waktu Perbaikan
                            </Label>
                            <div className="mt-1 font-medium">{format(new Date(temuan.batas_waktu_perbaikan), 'dd MMMM yyyy')}</div>
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
                                <div className="mt-1 font-medium">{temuan.nomor_car_manual}</div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                    <GitCommit className="h-4 w-4" />
                                    Verifikasi Rencana Perbaikan
                                </Label>
                                <p className="mt-1">{temuan.admin_verifikasi_rencana ? 'Ya' : 'Belum'}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    Sudah Diverifikasi
                                </Label>
                                <p className="mt-1">{temuan.admin_diverifikasi ? 'Ya' : 'Belum'}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                    <GitCommit className="h-4 w-4" />
                                    Verifikasi Pengerjaan Perbaikan
                                </Label>
                                <p className="mt-1">{temuan.verifikasi_pengerjaan ? 'Sudah' : 'Belum'}</p>
                            </div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                <ListTree className="h-4 w-4" />
                                Tindakan Perbaikan yang Dilakukan
                            </Label>
                            <p className="mt-1 whitespace-pre-wrap">{temuan.tindakan_perbaikan || '-'}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                <FileText className="h-4 w-4" />
                                Catatan
                            </Label>
                            <p className="mt-1 whitespace-pre-wrap">{temuan.catatan_admin || '-'}</p>
                        </div>
                        {temuan.foto_temuan_sesudah && (
                            <div>
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                    <Camera className="h-4 w-4" />
                                    Foto Temuan (Setelah Perbaikan)
                                </Label>
                                <a
                                    href={`/storage/${temuan.foto_temuan_sesudah}`}
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
                        <div>
                            <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                Verifikasi Akhir Hasil Perbaikan
                            </Label>
                            <p className="mt-1">{temuan.verifikasi_akhir ? 'Sudah' : 'Belum'}</p>
                        </div>
                        {/* Komentar Validator */}
                        <div>
                            <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                <FileText className="h-4 w-4" />
                                Komentar Validator
                            </Label>
                            <p className="mt-1 whitespace-pre-wrap">{temuan.komentar_validator || '-'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* System */}
                <Card>
                    <CardContent className="space-y-4 pt-1">
                        <h3 className="text-lg font-semibold">Sistem</h3>
                        {/* System Information Grid */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {/* Created By */}
                            <div>
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                    <GitCommit className="h-4 w-4" />
                                    Dibuat Oleh
                                </Label>
                                <p className="mt-1">{temuan.created_by?.name}</p>
                            </div>
                            {/* Created At */}
                            <div>
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                    <Calendar className="h-4 w-4" />
                                    Dibuat Pada
                                </Label>
                                <p className="mt-1">{format(new Date(temuan.created_at), 'dd MMMM yyyy HH:mm')}</p>
                            </div>
                            {/* Last Updated */}
                            <div>
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">
                                    <FileText className="h-4 w-4" />
                                    Terakhir Diperbarui
                                </Label>
                                <p className="mt-1">{format(new Date(temuan.updated_at), 'dd MMMM yyyy HH:mm')}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
