import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Avatar } from '@radix-ui/react-avatar';
import { format } from 'date-fns';
import { AlertCircle, Calendar, Camera, FileText, GitCommit, ListTree, MapPin } from 'lucide-react';
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
                    <Badge title={`Status Temuan: ${temuan.temuan_status?.nama}`}>{temuan.temuan_status?.nama}</Badge>
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
                                    <p className="mt-1 whitespace-pre-wrap">{temuan.rencana_perbaikan || '-'}</p>
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
                                        <div className="mt-1 font-medium">{temuan.nomor_car_manual || '-'}</div>
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
                    </div>
                    {/* Kolom 2: Riwayat Approval Temuan */}
                    <div className="space-y-3">
                        <Card>
                            <CardContent className="space-y-4">
                                <h3 className="text-lg font-semibold">Riwayat Approval</h3>
                                <div className="grid gap-6">
                                    {temuan.temuan_approval_riwayat && temuan.temuan_approval_riwayat.length > 0 ? (
                                        temuan.temuan_approval_riwayat.map((approval: any, index: number) => (
                                            <div key={index} className="flex items-center gap-4">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/micah/svg?seed=${approval.tahap}`} />
                                                    <AvatarFallback>{approval.tahap[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-1 items-start justify-between gap-4">
                                                    <div className="space-y-1">
                                                        <p className="text-sm leading-none font-medium">{approval.tahap}</p>
                                                        <p className="text-muted-foreground text-sm">{approval.status_approval}</p>
                                                    </div>
                                                    <div className="text-muted-foreground ml-auto text-right text-sm whitespace-nowrap">
                                                        {format(new Date(approval.created_at), 'dd-MM-yyyy')}
                                                        <div className="text-xs">{format(new Date(approval.created_at), 'HH:mm')} WIB</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground text-sm">Tidak ada riwayat approval.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
