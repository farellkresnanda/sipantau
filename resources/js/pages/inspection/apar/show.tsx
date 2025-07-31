import { Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import {
    Calendar,
    Building2,
    Factory,
    CheckCircle2,
    XCircle,
    FileText, AlertCircle, User
} from 'lucide-react';
import type { BreadcrumbItem } from '@/types';
import VerifyAparDialog from './verify-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Inspeksi APAR', href: '/inspection/apar' },
    { title: 'Lihat Detail Inspeksi', href: '#' },
];

export default function ShowAparInspection({ aparInspection }: { aparInspection: any }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Inspeksi APAR" />
            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1" title={`Nomor: ${aparInspection.code}`}>
                        <FileText className="h-4 w-4 text-orange-500" />
                        {aparInspection.code}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1" title={`Status Temuan: ${aparInspection.approval_status?.name}`}>
                        <AlertCircle className="h-4 w-4 text-blue-500" />
                        {aparInspection.approval_status?.name}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1" title={`Entitas: ${aparInspection.entity?.name}`}>
                        <Building2 className="h-4 w-4 text-green-500" />
                        {aparInspection.entity?.name}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1" title={`Plant: ${aparInspection.plant?.name}`}>
                        <Factory className="h-4 w-4 text-purple-500" />
                        {aparInspection.plant?.name}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1" title={`Dibuat oleh: ${aparInspection.created_by?.name}`}>
                        <User className="h-4 w-4 text-red-500" />
                        {aparInspection.created_by?.name}
                    </Badge>
                    <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                        title={`Dibuat pada: ${format(new Date(aparInspection.created_at), 'dd MMMM yyyy')}`}
                    >
                        <Calendar className="h-4 w-4 text-yellow-500" />
                        {format(new Date(aparInspection.created_at), 'dd MMMM yyyy')}
                    </Badge>
                    {aparInspection.aparInspection_status?.code === 'SCF' && (
                        <button
                            onClick={() => window.open(`/inspection/apar/${aparInspection.uuid}/print`, '_blank')}
                            className="inline-flex items-center gap-1 rounded-md border border-transparent bg-blue-500 px-2.5 py-0.5 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
                        >
                            <FileText className="h-4 w-4" />
                            Export PDF
                        </button>
                    )}
                </div>

                <Card>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Detail Inspeksi APAR</h2>
                        </div>
                        <Table className="mt-4">
                            <TableBody>
                                <TableRow>
                                    <TableCell>Nomor APAR</TableCell>
                                    <TableCell>{aparInspection.apar?.apar_no}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Tipe APAR</TableCell>
                                    <TableCell>{aparInspection.apar?.type}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Lokasi APAR</TableCell>
                                    <TableCell>{aparInspection.apar?.location}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Entitas</TableCell>
                                    <TableCell>{aparInspection.entity?.name}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Plant</TableCell>
                                    <TableCell>{aparInspection.plant?.name}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Tanggal Inspeksi</TableCell>
                                    <TableCell>{format(new Date(aparInspection.date_inspection), 'dd MMMM yyyy')}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Status Inspeksi</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{aparInspection.approval_status?.name || 'Belum Diverifikasi'}</Badge>
                                    </TableCell>
                                </TableRow>
                                {aparInspection.expired_year && (
                                    <TableRow>
                                        <TableCell>Masa Berlaku (Tahun)</TableCell>
                                        <TableCell>{aparInspection.expired_year}</TableCell>
                                    </TableRow>
                                )}
                                {aparInspection.created_by && (
                                    <TableRow>
                                        <TableCell>Dibuat Oleh</TableCell>
                                        <TableCell>{aparInspection.created_by.name}</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <h3 className="mb-1 text-lg font-semibold">Detail Inspeksi</h3>
                        <Table className="mt-1">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Pemeriksaan</TableHead>
                                    <TableHead>Kondisi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {aparInspection.items?.map((detail: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>{detail.field}</TableCell>
                                        <TableCell>
                                            {detail.value === 'baik' ? (
                                                <span className="flex items-center text-green-600">
                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                    Baik
                                                </span>
                                            ) : detail.value === 'tidak_baik' ? (
                                                <span className="flex items-center text-red-600">
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    Tidak Baik
                                                </span>
                                            ) : (
                                                detail.value
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <h3 className="mb-4 text-lg font-semibold">Catatan</h3>
                        <div className="rounded-lg border p-4 text-sm">{aparInspection.note || 'Tidak ada catatan'}</div>
                    </CardContent>
                </Card>

                <div className="flex gap-2">
                    <VerifyAparDialog inspection={aparInspection} />
                </div>
            </div>
        </AppLayout>
    );
}
