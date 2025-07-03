import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Temuan',
        href: '/k3temuan',
    },
    {
        title: 'Lihat Detail Temuan',
        href: '#',
    },
];

export default function ShowK3Temuan({ k3temuan }: { k3temuan: any }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Temuan" />
            <Card className="shadow-md">
                <CardHeader>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{k3temuan.nomor_car_auto}</Badge>
                        <Badge>{k3temuan.status_temuan?.nama}</Badge>
                        <Badge>{k3temuan.status_approval?.nama}</Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-8">
                    {/* Karyawan */}
                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            <h3 className="text-lg font-semibold">Karyawan</h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <Label className="text-muted-foreground text-sm">Tanggal</Label>
                                    <div className="mt-1 font-medium">{format(new Date(k3temuan.tanggal), 'dd MMMM yyyy')}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-sm">Jenis Ketidaksesuaian</Label>
                                    <div className="mt-1 font-medium">{k3temuan.jenis_ketidaksesuaian?.nama}</div>
                                </div>
                            </div>

                            <div>
                                <Label className="text-muted-foreground text-sm">Deskripsi Temuan</Label>
                                <p className="mt-1 whitespace-pre-wrap">{k3temuan.deskripsi_temuan}</p>
                            </div>

                            <div>
                                <Label className="text-muted-foreground text-sm">Foto Temuan (Sebelum Perbaikan)</Label>
                                <img
                                    src={`/storage/${k3temuan.foto_temuan_sebelum}`}
                                    alt="Foto Sebelum"
                                    className="mt-2 h-[300px] w-[400px] rounded-lg border object-cover shadow"
                                />
                            </div>

                            <div>
                                <Label className="text-muted-foreground text-sm">Detail Lokasi Temuan</Label>
                                <p className="mt-1 whitespace-pre-wrap">{k3temuan.detail_lokasi_temuan}</p>
                            </div>

                            <div>
                                <Label className="text-muted-foreground text-sm">Tulis Akar Masalah</Label>
                                <p className="mt-1 whitespace-pre-wrap">{k3temuan.akar_masalah}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Teknisi */}
                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            <h3 className="text-lg font-semibold">Teknisi</h3>
                            <div>
                                <Label className="text-muted-foreground text-sm">Rencana Perbaikan</Label>
                                <p className="mt-1 whitespace-pre-wrap">{k3temuan.rencana_perbaikan}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-sm">Batas Waktu Perbaikan</Label>
                                <div className="mt-1 font-medium">{format(new Date(k3temuan.batas_waktu_perbaikan), 'dd MMMM yyyy')}</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Admin */}
                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            <h3 className="text-lg font-semibold">Admin</h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <Label className="text-muted-foreground text-sm">Nomor CAR</Label>
                                    <div className="mt-1 font-medium">{k3temuan.nomor_car_auto}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-sm">Verifikasi Rencana Perbaikan</Label>
                                    <p className="mt-1">{k3temuan.admin_verifikasi_rencana ? 'Ya' : 'Belum'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-sm">Sudah Diverifikasi</Label>
                                    <p className="mt-1">{k3temuan.admin_diverifikasi ? 'Ya' : 'Belum'}</p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-sm">Tindakan Perbaikan yang Dilakukan</Label>
                                <p className="mt-1 whitespace-pre-wrap">{k3temuan.tindakan_perbaikan}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-sm">Verifikasi Pengerjaan Perbaikan</Label>
                                <p className="mt-1">{k3temuan.verifikasi_pengerjaan ? 'Sudah' : 'Belum'}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-sm">Catatan</Label>
                                <p className="mt-1 whitespace-pre-wrap">{k3temuan.catatan_admin}</p>
                            </div>
                            {k3temuan.foto_temuan_sesudah && (
                                <div>
                                    <Label className="text-muted-foreground text-sm">Foto Temuan (Setelah Perbaikan)</Label>
                                    <img
                                        src={`/storage/${k3temuan.foto_temuan_sesudah}`}
                                        alt="Foto Sesudah"
                                        className="mt-2 h-[300px] w-[400px] rounded-lg border object-cover shadow"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Validator */}
                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            <h3 className="text-lg font-semibold">Validator</h3>
                            <div>
                                <Label className="text-muted-foreground text-sm">Verifikasi Akhir Hasil Perbaikan</Label>
                                <p className="mt-1">{k3temuan.verifikasi_akhir ? 'Sudah' : 'Belum'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* System */}
                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            <h3 className="text-lg font-semibold">By System</h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <Label className="text-muted-foreground text-sm">Status Temuan</Label>
                                    <p className="mt-1">{k3temuan.status_temuan?.nama}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-sm">Status Approval</Label>
                                    <p className="mt-1">{k3temuan.status_approval?.nama}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-sm">Created By</Label>
                                    <p className="mt-1">{k3temuan.created_by?.name}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-sm">Nomor (Generate Otomatis)</Label>
                                    <p className="mt-1">{k3temuan.nomor_car_auto}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
