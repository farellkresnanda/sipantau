import type {BreadcrumbItem} from "@/types";
import {Head} from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import {Badge} from "@/components/ui/badge";
import {AlertCircle, Building2, Calendar, CheckCircle2, Factory, FileText, User, XCircle} from "lucide-react";
import {format} from "date-fns";
import {Card, CardContent} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import VerifyBuildingDialog from "@/pages/inspection/building/verify-dialog";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Inspeksi Gedung',
        href: '/inspection/building',
    },
    {
        title: 'Lihat Inspeksi Gedung',
        href: '#',
    },
];

export default function PageBuildingInspection({ buildingInspection }: { buildingInspection: any }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Inspeksi Gedung" />
            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1" title={`Nomor: ${buildingInspection.code}`}>
                        <FileText className="h-4 w-4 text-orange-500" />
                        {buildingInspection.code}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1" title={`Status Temuan: ${buildingInspection.approval_status?.name}`}>
                        <AlertCircle className="h-4 w-4 text-blue-500" />
                        {buildingInspection.approval_status?.name}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1" title={`Entitas: ${buildingInspection.entity?.name}`}>
                        <Building2 className="h-4 w-4 text-green-500" />
                        {buildingInspection.entity?.name}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1" title={`Plant: ${buildingInspection.plant?.name}`}>
                        <Factory className="h-4 w-4 text-purple-500" />
                        {buildingInspection.plant?.name}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1" title={`Dibuat oleh: ${buildingInspection.created_by?.name}`}>
                        <User className="h-4 w-4 text-red-500" />
                        {buildingInspection.created_by?.name}
                    </Badge>
                    <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                        title={`Dibuat pada: ${format(new Date(buildingInspection.created_at), 'dd MMMM yyyy')}`}
                    >
                        <Calendar className="h-4 w-4 text-yellow-500" />
                        {format(new Date(buildingInspection.created_at), 'dd MMMM yyyy')}
                    </Badge>
                    {buildingInspection.approval_status_code === 'SAP' && (
                        <button
                            onClick={() => window.open(`/inspection/building/${buildingInspection.uuid}/print`, '_blank')}
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
                            <h2 className="text-lg font-semibold">Detail Inspeksi Gedung</h2>
                        </div>
                        <Table className="mt-4">
                            <TableBody>
                                <TableRow>
                                    <TableCell>Lokasi Gedung</TableCell>
                                    <TableCell>{buildingInspection.building?.location_name}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Entitas</TableCell>
                                    <TableCell>{buildingInspection.entity?.name}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Plant</TableCell>
                                    <TableCell>{buildingInspection.plant?.name}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Tanggal Inspeksi</TableCell>
                                    <TableCell>{format(new Date(buildingInspection.inspection_date), 'dd MMMM yyyy')}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Frekuensi Inspeksi</TableCell>
                                    <TableCell>
                                        {buildingInspection.frequency === 'weekly'
                                            ? 'Mingguan'
                                            : buildingInspection.frequency === 'monthly'
                                              ? 'Bulanan'
                                              : buildingInspection.frequency}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Status Inspeksi</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{buildingInspection.approval_status?.name || 'Belum Diverifikasi'}</Badge>
                                    </TableCell>
                                </TableRow>
                                {buildingInspection.created_by && (
                                    <TableRow>
                                        <TableCell>Dibuat Oleh</TableCell>
                                        <TableCell>{buildingInspection.created_by.name}</TableCell>
                                    </TableRow>
                                )}
                                {buildingInspection.approved_by && (
                                    <TableRow>
                                        <TableCell>Disetujui Oleh</TableCell>
                                        <TableCell>{buildingInspection.approved_by.name}</TableCell>
                                    </TableRow>
                                )}
                                {buildingInspection.approved_at && (
                                    <TableRow>
                                        <TableCell>Disetujui Pada</TableCell>
                                        <TableCell>{buildingInspection.approved_at}</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-3">
                        <h3 className="mb-1 text-lg font-semibold">Detail Inspeksi</h3>

                        {/* MOBILE: Kartu (tanpa tabel, no horizontal scroll) */}
                        <div className="space-y-4 md:hidden">
                            {!buildingInspection.items || buildingInspection.items.length === 0 ? (
                                <div className="text-muted-foreground rounded-md border p-4 text-center text-sm">Tidak ada data detail inspeksi.</div>
                            ) : (
                                buildingInspection.items.map((it: any, idx: number) => {
                                    const repair = Boolean(it.action_repair);
                                    const maintenance = Boolean(it.action_maintenance);
                                    const good = Boolean(it.condition_good);
                                    const broken = Boolean(it.condition_broken);

                                    return (
                                        <div key={idx} className="space-y-3 rounded-lg border p-4">
                                            <div className="text-muted-foreground text-xs">#{idx + 1}</div>

                                            <div>
                                                <div className="text-muted-foreground text-xs font-medium">Pekerjaan</div>
                                                <div className="font-medium break-words whitespace-normal">{it.job_name || it.field || '-'}</div>
                                            </div>

                                            <div>
                                                <div className="text-muted-foreground text-xs font-medium">Deskripsi Standar</div>
                                                <div className="text-sm break-words whitespace-normal">{it.standard_description || '-'}</div>
                                            </div>

                                            {/* Tindakan */}
                                            <div>
                                                <div className="text-muted-foreground mb-1 text-xs font-medium">Tindakan</div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex items-center gap-2">
                                                        {repair ? (
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                        ) : (
                                                            <XCircle className="text-muted-foreground h-4 w-4" />
                                                        )}
                                                        <span className="text-sm">Perbaikan</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {maintenance ? (
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                        ) : (
                                                            <XCircle className="text-muted-foreground h-4 w-4" />
                                                        )}
                                                        <span className="text-sm">Perawatan</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Kondisi */}
                                            <div>
                                                <div className="text-muted-foreground mb-1 text-xs font-medium">Kondisi</div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex items-center gap-2">
                                                        {good ? (
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                        ) : (
                                                            <XCircle className="text-muted-foreground h-4 w-4" />
                                                        )}
                                                        <span className="text-sm">Baik</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {broken ? (
                                                            <CheckCircle2 className="h-4 w-4 text-red-600" />
                                                        ) : (
                                                            <XCircle className="text-muted-foreground h-4 w-4" />
                                                        )}
                                                        <span className="text-sm">Rusak</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-muted-foreground text-xs font-medium">Catatan</div>
                                                <div className="text-sm break-words whitespace-pre-line">{it.remarks || '-'}</div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* DESKTOP: Tabel 2-baris header (rapi, no horizontal scroll dengan colgroup) */}
                        <div className="hidden md:block">
                            <Table className="w-full table-auto border-collapse text-sm">
                                <colgroup>
                                    <col className="w-12" />
                                    <col />
                                    <col />
                                    <col className="w-28" />
                                    <col className="w-32" />
                                    <col className="w-20" />
                                    <col className="w-24" />
                                    <col />
                                </colgroup>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead rowSpan={2} className="bg-yellow-200 text-center align-middle">
                                            #
                                        </TableHead>
                                        <TableHead rowSpan={2} className="bg-yellow-200 align-middle">
                                            Pekerjaan
                                        </TableHead>
                                        <TableHead rowSpan={2} className="bg-yellow-200 align-middle">
                                            Deskripsi Standar
                                        </TableHead>
                                        <TableHead colSpan={2} className="bg-yellow-200 text-center align-middle">
                                            Tindakan
                                        </TableHead>
                                        <TableHead colSpan={2} className="bg-yellow-200 text-center align-middle">
                                            Kondisi
                                        </TableHead>
                                        <TableHead rowSpan={2} className="bg-yellow-200 align-middle">
                                            Catatan
                                        </TableHead>
                                    </TableRow>
                                    <TableRow>
                                        <TableHead className="bg-blue-100 text-center">Perbaikan</TableHead>
                                        <TableHead className="bg-purple-100 text-center">Perawatan</TableHead>
                                        <TableHead className="bg-green-100 text-center">Baik</TableHead>
                                        <TableHead className="bg-red-100 text-center">Rusak</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!buildingInspection.items || buildingInspection.items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-muted-foreground text-center text-sm">
                                                Tidak ada data detail inspeksi.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        buildingInspection.items.map((it: any, idx: number) => {
                                            const repair = Boolean(it.action_repair);
                                            const maintenance = Boolean(it.action_maintenance);
                                            const good = Boolean(it.condition_good);
                                            const broken = Boolean(it.condition_broken);

                                            return (
                                                <TableRow key={idx} className="[&_td]:align-top">
                                                    <TableCell className="text-center">{idx + 1}</TableCell>
                                                    <TableCell className="font-medium break-words whitespace-normal">
                                                        {it.job_name || it.field || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-sm break-words whitespace-normal">
                                                        {it.standard_description || '-'}
                                                    </TableCell>

                                                    <TableCell className="text-center">
                                                        {repair ? (
                                                            <CheckCircle2 className="inline h-4 w-4 text-emerald-600" />
                                                        ) : (
                                                            <XCircle className="text-muted-foreground inline h-4 w-4" />
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {maintenance ? (
                                                            <CheckCircle2 className="inline h-4 w-4 text-emerald-600" />
                                                        ) : (
                                                            <XCircle className="text-muted-foreground inline h-4 w-4" />
                                                        )}
                                                    </TableCell>

                                                    <TableCell className="text-center">
                                                        {good ? (
                                                            <CheckCircle2 className="inline h-4 w-4 text-emerald-600" />
                                                        ) : (
                                                            <XCircle className="text-muted-foreground inline h-4 w-4" />
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {broken ? (
                                                            <CheckCircle2 className="inline h-4 w-4 text-red-600" />
                                                        ) : (
                                                            <XCircle className="text-muted-foreground inline h-4 w-4" />
                                                        )}
                                                    </TableCell>

                                                    <TableCell className="break-words whitespace-pre-line">{it.remarks || '-'}</TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-3">
                        {/* Catatan Validator */}
                        <h3 className="mt-2 mb-4 flex items-center gap-2 text-sm font-semibold">
                            <FileText className="h-4 w-4 text-gray-500" />
                            Catatan Validator
                        </h3>
                        {!buildingInspection.note_validator || buildingInspection.note_validator.length === 0 ? (
                            <div className="text-muted-foreground rounded-md border p-4 text-center text-sm">Belum ada catatan dari validator.</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Validator</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Catatan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>{buildingInspection.approved_by?.name || '-'}</TableCell>
                                        <TableCell>
                                            {buildingInspection.approved_at ? format(new Date(buildingInspection.approved_at), 'dd MMMM yyyy') : '-'}
                                        </TableCell>
                                        <TableCell className="whitespace-pre-line">{buildingInspection.note_validator || '-'}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <div className="flex gap-2">
                    <VerifyBuildingDialog inspection={buildingInspection} />
                </div>
            </div>
        </AppLayout>
    );
}
