import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { BreadcrumbItem } from '@/types';
import ValidatorVerifyPpeDialog from './verify-dialog';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, Factory, FileText, MapPin, ShieldCheck, UserCheck } from 'lucide-react';
import { format } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Inspeksi K3L', href: '/inspection/k3l' },
    { title: 'Detail', href: '#' },
];

type PageProps = {
    k3lInspection: {
        uuid: string;
        approval_status_code: string;
        inspection_date: string;
        location: { name: string };
        note_validator?: string;
        entity?: { name: string };
        plant?: { name: string };
        created_by?: { name: string };
        approved_by?: { name: string };
        approval_status?: { id: number; name: string };
        items: Array<{
            master_k3l_master_k3l_description_id: string;
            condition: string;
            note: string;
            master_k3l_description: {
                id: string;
                description: string;
                master_k3l_id: string;
                master_k3l: {
                    id: string;
                    objective: string;
                };
            };
        }>;
    };
};

export default function ShowK3LInspection({ k3lInspection }: PageProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const groupedItems = useMemo(() => {
        return Object.values(
            k3lInspection.items.reduce((acc, item) => {
                const key = item.master_k3l_description.master_k3l_id;
                const objective = item.master_k3l_description.master_k3l.objective;

                if (!acc[key]) {
                    acc[key] = { title: objective, items: [] };
                }

                acc[key].items.push(item);
                return acc;
            }, {} as Record<string, { title: string; items: typeof k3lInspection.items }>)
        );
    }, [k3lInspection]);

    const totalPages = Math.ceil(groupedItems.length / itemsPerPage);
    const paginatedGroupedItems = groupedItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Inspeksi K3L" />
            <div className="space-y-6 p-4">
                {/* Badge Ringkasan */}
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" title="Tanggal Inspeksi">
                        <Calendar className="mr-1 h-4 w-4" />
                        {format(new Date(k3lInspection.inspection_date), 'dd MMMM yyyy')}
                    </Badge>
                    <Badge variant="outline" title="Lokasi">
                        <MapPin className="mr-1 h-4 w-4" />
                        {k3lInspection.location?.name}
                    </Badge>
                    <Badge variant="outline" title="Entitas">
                        <Building2 className="mr-1 h-4 w-4" />
                        {k3lInspection.entity?.name}
                    </Badge>
                    <Badge variant="outline" title="Plant">
                        <Factory className="mr-1 h-4 w-4" />
                        {k3lInspection.plant?.name}
                    </Badge>
                    <Badge variant="outline" title="Petugas Inspeksi">
                        <UserCheck className="mr-1 h-4 w-4" />
                        {k3lInspection.created_by?.name}
                    </Badge>
                    <Badge variant="outline" title="Status">
                        <ShieldCheck className="mr-1 h-4 w-4" />
                        {k3lInspection.approval_status?.name ?? 'Draft'}
                    </Badge>
                </div>

                <Card>
                    <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <div className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                                <Calendar className="h-4 w-4" />
                                Tanggal Inspeksi
                            </div>
                            <div className="text-sm">{k3lInspection.inspection_date}</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                                <MapPin className="h-4 w-4" />
                                Lokasi
                            </div>
                            <div className="text-sm">{k3lInspection.location.name}</div>
                        </div>
                        {k3lInspection.approval_status_code !== 'SOP' && (
                            <>
                                <div>
                                    <div className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                                        <UserCheck className="h-4 w-4" />
                                        Validator
                                    </div>
                                    <div className="text-sm">{k3lInspection.approved_by?.name || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                                        <FileText className="h-4 w-4" />
                                        Catatan Validator
                                    </div>
                                    <div className="text-sm">{k3lInspection.note_validator || '-'}</div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="overflow-x-auto">
                        {/* Desktop Table */}
                        <div className="hidden md:block">
                            <Table className="w-full min-w-[700px] table-fixed border-collapse whitespace-normal">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10">#</TableHead>
                                        <TableHead className="min-w-[300px]">Tujuan & Deskripsi</TableHead>
                                        <TableHead className="w-24 text-center">Jawaban</TableHead>
                                        <TableHead>Catatan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedGroupedItems.map((group, index) =>
                                        group.items.map((item, subIndex) => (
                                            <TableRow key={item.master_k3l_master_k3l_description_id}>
                                                <TableCell>{subIndex === 0 ? (currentPage - 1) * itemsPerPage + index + 1 : ''}</TableCell>
                                                <TableCell className="align-top text-sm whitespace-pre-line">
                                                    {subIndex === 0 && <div className="font-semibold">{group.title}</div>}
                                                    <div className="pl-2">
                                                        {`${String.fromCharCode(97 + subIndex)}. ${item.master_k3l_description.description}`}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center align-top">{item.condition}</TableCell>
                                                <TableCell className="align-top">{item.note || '-'}</TableCell>
                                            </TableRow>
                                        )),
                                    )}
                                </TableBody>
                            </Table>

                            {/* Desktop Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-3 flex items-center justify-between px-1 text-sm">
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="rounded border px-3 py-1 disabled:opacity-50"
                                    >
                                        Prev
                                    </button>
                                    <div className="space-x-1">
                                        {Array.from({ length: totalPages }, (_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`rounded border px-3 py-1 ${currentPage === i + 1 ? 'bg-primary text-white' : 'bg-white'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="rounded border px-3 py-1 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Table */}
                        <div className="block md:hidden">
                            <Table className="w-full min-w-full table-fixed border-collapse whitespace-normal">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10">#</TableHead>
                                        <TableHead>Deskripsi + Jawaban</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedGroupedItems.map((group, index) =>
                                        group.items.map((item, subIndex) => (
                                            <TableRow key={item.master_k3l_master_k3l_description_id}>
                                                <TableCell>{subIndex === 0 ? (currentPage - 1) * itemsPerPage + index + 1 : ''}</TableCell>
                                                <TableCell className="align-top text-sm whitespace-pre-line">
                                                    {subIndex === 0 && <div className="font-semibold">{group.title}</div>}
                                                    <div className="pl-2">
                                                        {`${String.fromCharCode(97 + subIndex)}. ${item.master_k3l_description.description}`}
                                                    </div>
                                                    <div className="pt-2 pl-2 text-xs font-medium">
                                                        Jawaban: {item.condition} <br />
                                                        Catatan: {item.note || '-'}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )),
                                    )}
                                </TableBody>
                            </Table>

                            {/* Mobile Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-3 flex items-center justify-between px-1 text-sm">
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="rounded border px-3 py-1 disabled:opacity-50"
                                    >
                                        Prev
                                    </button>
                                    <span>
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="rounded border px-3 py-1 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Verify Dialog */}
                <ValidatorVerifyPpeDialog inspection={k3lInspection} />
            </div>
        </AppLayout>
    );
}
