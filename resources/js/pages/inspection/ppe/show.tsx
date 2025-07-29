import { Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Calendar, MapPin, Building2, Factory, UserCheck, ShieldCheck } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';
import ValidatorVerifyPpeDialog from './verify-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Inspeksi APD', href: '/inspection/ppe' },
    { title: 'Lihat Detail Inspeksi', href: '#' },
];

export default function ShowPpeInspection({ ppeInspection }: { ppeInspection: any }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Inspeksi APD" />
            <div className="space-y-6 p-4">
                {/* Badge Ringkasan */}
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" title="Tanggal Inspeksi">
                        <Calendar className="mr-1 h-4 w-4" />
                        {format(new Date(ppeInspection.inspection_date), 'dd MMMM yyyy')}
                    </Badge>
                    <Badge variant="outline" title="Lokasi / Nama Pemilik">
                        <MapPin className="mr-1 h-4 w-4" />
                        {ppeInspection.location || '-'}
                    </Badge>
                    <Badge variant="outline" title="Entitas">
                        <Building2 className="mr-1 h-4 w-4" />
                        {ppeInspection.entity?.name}
                    </Badge>
                    <Badge variant="outline" title="Plant">
                        <Factory className="mr-1 h-4 w-4" />
                        {ppeInspection.plant?.name}
                    </Badge>
                    <Badge variant="outline" title="Petugas Inspeksi">
                        <UserCheck className="mr-1 h-4 w-4" />
                        {ppeInspection.created_by?.name}
                    </Badge>
                    <Badge variant="outline" title="Status">
                        <ShieldCheck className="mr-1 h-4 w-4" />
                        {ppeInspection.approval_status?.name ?? 'Draft'}
                    </Badge>
                </div>

                {/* Info Umum */}
                <Card>
                    <CardContent className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">Deskripsi Pekerjaan</p>
                            <p className="text-sm">{ppeInspection.job_description || '-'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">Nama Proyek</p>
                            <p className="text-sm">{ppeInspection.project_name || '-'}</p>
                        </div>
                        {ppeInspection.approved_at && (
                            <>
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">Komentar Validator</p>
                                    <p className="text-sm">{ppeInspection.note_validator || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">Disetujui Oleh</p>
                                    <p className="text-sm">{ppeInspection.approved_by?.name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">Tanggal Disetujui</p>
                                    <p className="text-sm">{format(new Date(ppeInspection.approved_at), 'dd MMMM yyyy')}</p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Tabel Hasil Inspeksi */}
                <Card className="overflow-hidden">
                    <CardContent className="overflow-x-auto pt-4">
                        <Table className="w-full table-auto border-collapse whitespace-normal">
                            <TableHeader>
                                <TableRow>
                                    <TableHead rowSpan={2} className="w-14 border bg-gray-100 text-center align-middle text-sm leading-tight p-1">
                                        No
                                    </TableHead>
                                    <TableHead rowSpan={2} className="w-32 border bg-gray-100 text-center align-middle text-sm leading-tight p-1">
                                        Nama APD
                                    </TableHead>
                                    <TableHead rowSpan={2} className="w-48 border bg-gray-100 text-center align-middle text-sm leading-tight p-1">
                                        Kriteria Inspeksi
                                    </TableHead>

                                    {/* Kondisi */}
                                    <TableHead colSpan={2} className="w-32 border bg-gray-100 text-center align-middle text-sm leading-tight p-1">
                                        Kondisi
                                    </TableHead>

                                    {/* Pemakaian APD */}
                                    <TableHead colSpan={2} className="w-32 border bg-gray-100 text-center align-middle text-sm leading-tight p-1">
                                        Pemakaian APD
                                    </TableHead>

                                    <TableHead rowSpan={2} className="w-20 border bg-gray-100 text-center align-middle text-sm leading-tight p-1">
                                        Jumlah
                                    </TableHead>
                                    <TableHead rowSpan={2} className="w-64 border bg-gray-100 text-center align-middle text-sm leading-tight p-1">
                                        Keterangan
                                    </TableHead>
                                </TableRow>

                                <TableRow>
                                    {/* Subkolom Kondisi */}
                                    <TableHead className="w-16 border bg-green-100 text-center text-sm leading-tight p-1">
                                        Baik
                                    </TableHead>
                                    <TableHead className="w-16 border bg-red-100 text-center text-sm leading-tight p-1">
                                        Rusak
                                    </TableHead>

                                    {/* Subkolom Pemakaian */}
                                    <TableHead className="w-16 border bg-yellow-100 text-center text-sm leading-tight p-1">
                                        Terpakai
                                    </TableHead>
                                    <TableHead className="w-16 border bg-blue-100 text-center text-sm leading-tight p-1">
                                        Tidak Terpakai
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {ppeInspection.items?.map((item: any, index: number) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="border text-center">{index + 1}</TableCell>
                                        <TableCell className="border break-words whitespace-normal">{item.ppe_check_item?.apd_name}</TableCell>
                                        <TableCell className="border break-words whitespace-normal">{item.ppe_check_item?.inspection_criteria}</TableCell>
                                        <TableCell className="border text-center">{item.good_condition ?? 0}</TableCell>
                                        <TableCell className="border text-center">{item.bad_condition ?? 0}</TableCell>
                                        <TableCell className="border text-center">{item.used ?? 0}</TableCell>
                                        <TableCell className="border text-center">{item.unused ?? 0}</TableCell>
                                        <TableCell className="border text-center font-semibold">{(item.good_condition ?? 0) + (item.bad_condition ?? 0)}</TableCell>
                                        <TableCell>{item.notes || '-'}</TableCell>
                                    </TableRow>
                                ))}
                                {ppeInspection.items?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-muted-foreground text-center">
                                            Tidak ada data inspeksi.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Verify Dialog */}
                <ValidatorVerifyPpeDialog inspection={ppeInspection} />
            </div>
        </AppLayout>
    );
}
