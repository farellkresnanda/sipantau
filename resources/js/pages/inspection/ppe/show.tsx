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
                    <Badge variant="outline" title="Lokasi">
                        <MapPin className="mr-1 h-4 w-4" />
                        {ppeInspection.location?.name}
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
                        <Table className="w-full table-fixed border-collapse whitespace-normal">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">No</TableHead>
                                    <TableHead className="w-40">Nama APD</TableHead>
                                    <TableHead className="w-52">Kriteria Inspeksi</TableHead>
                                    <TableHead className="w-24">Kondisi</TableHead>
                                    <TableHead className="w-24">Pemakaian</TableHead>
                                    <TableHead className="w-20">Jumlah</TableHead>
                                    <TableHead className="w-48">Keterangan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ppeInspection.items?.map((item: any, index: number) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="break-words whitespace-normal">{item.ppe_check_item?.apd_name}</TableCell>
                                        <TableCell className="break-words whitespace-normal">{item.ppe_check_item?.inspection_criteria}</TableCell>
                                        <TableCell>{item.condition}</TableCell>
                                        <TableCell>{item.usage}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>{item.notes}</TableCell>
                                    </TableRow>
                                ))}
                                {ppeInspection.items?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-muted-foreground text-center">
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
