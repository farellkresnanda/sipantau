'use client';

import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Building2,
  Calendar,
  ClipboardCheck,
  Factory,
  FileText,
  MapPin,
  Printer,
  ShieldCheck,
  User as UserIcon,
  UserCheck,
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem, PageProps as BasePageProps } from '@/types';
import VerifyDialog from '@/pages/inspection/ac/verify-dialog';

// --- Type Definitions ---

// Tipe spesifik untuk user yang memiliki roles
interface AuthUser {
    id: number;
    name: string;
    email: string;
    roles: { name: string }[];
}

interface MasterAc {
  room: string;
  inventory_code: string;
}

interface InspectionItem {
  master_ac: MasterAc;
  maintenance_status: string;
  condition_status: string;
  notes: string | null;
}

interface User {
    name: string;
}

interface ApprovalStatus {
    name: string;
    code: string;
    badge_class: string;
}

interface SimpleMasterData {
    name: string;
}

interface Inspection {
  uuid: string;
  car_auto_number: string;
  inspection_date: string | null;
  items: InspectionItem[];
  createdBy?: User;
  approvalStatus?: ApprovalStatus;
  entity?: SimpleMasterData;
  plant?: SimpleMasterData;
  approvedBy?: User;
  approved_at?: string | null;
  note_validator?: string | null;
}

// Tipe Props yang spesifik dan benar untuk halaman ini
type ShowAcInspectionPageProps = BasePageProps & {
  acInspection: Inspection;
  auth: {
      user: AuthUser;
  };
};

export default function ShowAcInspectionPage() {
  const { acInspection: inspection, auth } = usePage<ShowAcInspectionPageProps>().props;
  const [isVerifyDialogOpen, setVerifyDialogOpen] = React.useState(false);

  if (!inspection) {
    return (
      <AppLayout breadcrumbs={[]}>
        <Head title="Data Tidak Ditemukan" />
        <div className="p-8 text-center">
          <p className="text-lg text-red-600">Data inspeksi tidak ditemukan.</p>
          <Button variant="outline" onClick={() => router.get(route('inspection.ac.index'))} className="mt-4">
            Kembali ke Daftar Inspeksi
          </Button>
        </div>
      </AppLayout>
    );
  }

  const firstItem = inspection.items?.[0];
  
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'd MMMM yyyy', { locale: id });
  };

  const formattedInspectionDate = formatDate(inspection.inspection_date);
  const formattedApprovalDate = formatDate(inspection.approved_at);

  const isApprovedOrRejected = ['SAP', 'SRE'].includes(inspection.approvalStatus?.code || '');
  const isOpenForVerification = inspection.approvalStatus?.code === 'SOP';
  const userIsValidator = auth.user?.roles?.some(role => role.name === 'Validator');
  const isApproved = inspection.approvalStatus?.code === 'SAP';

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: route('home') },
    { title: 'Laporan Inspeksi AC', href: route('inspection.ac.index') },
    { title: 'Detail', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Detail Inspeksi ${inspection.car_auto_number}`} />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">

        {/* Header section with Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" title="Nomor Dokumen">
            <FileText className="mr-1.5 h-4 w-4" />
            {inspection.car_auto_number || '-'}
          </Badge>
          <Badge variant="outline" title="Tanggal Inspeksi">
            <Calendar className="mr-1.5 h-4 w-4" />
            {formattedInspectionDate}
          </Badge>
          <Badge variant="outline" title="Lokasi AC">
            <MapPin className="mr-1.5 h-4 w-4" />
            {firstItem?.master_ac?.room || '-'}
          </Badge>
          <Badge variant="outline" title="Entitas">
            <Building2 className="mr-1.5 h-4 w-4" />
            {inspection.entity?.name ?? '-'}
          </Badge>
          <Badge variant="outline" title="Plant">
            <Factory className="mr-1.5 h-4 w-4" />
            {inspection.plant?.name ?? '-'}
          </Badge>
          <Badge variant="outline" title="Petugas Inspeksi">
            <UserIcon className="mr-1.5 h-4 w-4" />
            {inspection.createdBy?.name || '-'}
          </Badge>
          <Badge variant={inspection.approvalStatus?.badge_class as any || 'secondary'} title="Status">
            <ShieldCheck className="mr-1.5 h-4 w-4" />
            {inspection.approvalStatus?.name || 'N/A'}
          </Badge>
          {isApproved && (
            <button
                onClick={() => window.open(route('inspection.ac.print', inspection.uuid), '_blank')}
                className="inline-flex items-center gap-1 rounded-md border border-transparent bg-blue-500 px-2.5 py-0.5 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
            >
                <FileText className="h-4 w-4" />
                Export PDF
            </button>

          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Inspeksi</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 pt-0 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                <Calendar className="h-4 w-4" /> Tanggal Inspeksi
              </p>
              <p className="text-sm">{formattedInspectionDate}</p>
            </div>
            <div>
              <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                <MapPin className="h-4 w-4" /> Lokasi
              </p>
              <p className="text-sm">{firstItem?.master_ac?.room ?? '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                <ClipboardCheck className="h-4 w-4" /> Kode Inventaris
              </p>
              <p className="text-sm">{firstItem?.master_ac?.inventory_code ?? '-'}</p>
            </div>

            {isApprovedOrRejected && (
              <>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                    <UserCheck className="h-4 w-4" /> Diverifikasi Oleh
                  </p>
                  <p className="text-sm">{inspection.approvedBy?.name ?? '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                    <Calendar className="h-4 w-4" /> Tanggal Verifikasi
                  </p>
                  <p className="text-sm">{formattedApprovalDate}</p>
                </div>
                <div>
                    <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                        <FileText className="h-4 w-4" /> Komentar Validator
                    </p>
                    <p className="whitespace-pre-line text-sm">{inspection.note_validator || '-'}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detail Temuan Inspeksi</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="border">
              <TableHeader>
                <TableRow>
                  <TableHead colSpan={2} className="border bg-yellow-400 text-center font-bold text-black">Status</TableHead>
                  <TableHead colSpan={2} className="border bg-yellow-400 text-center font-bold text-black">Kondisi</TableHead>
                  <TableHead rowSpan={2} className="border bg-yellow-400 align-middle text-center font-bold text-black w-auto">Keterangan</TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="border bg-yellow-200 text-center w-[120px]">Perbaikan</TableHead>
                  <TableHead className="border bg-yellow-200 text-center w-[120px]">Perawatan</TableHead>
                  <TableHead className="border bg-yellow-200 text-center w-[120px]">Baik</TableHead>
                  <TableHead className="border bg-yellow-200 text-center w-[120px]">Rusak</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {firstItem ? (
                  <TableRow>
                    <TableCell className="border text-center">
                      <Checkbox
                        className="h-5 w-5 rounded-sm border-[2px] border-gray-400 disabled:opacity-100 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-700"
                        checked={firstItem.maintenance_status === 'Perbaikan'}
                        disabled
                      />
                    </TableCell>
                    <TableCell className="border text-center">
                      <Checkbox
                        className="h-5 w-5 rounded-sm border-[2px] border-gray-400 disabled:opacity-100 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-700"
                        checked={firstItem.maintenance_status === 'Perawatan'}
                        disabled
                      />
                    </TableCell>
                    <TableCell className="border text-center">
                      <Checkbox
                        className="h-5 w-5 rounded-sm border-[2px] border-gray-400 disabled:opacity-100 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-700"
                        checked={firstItem.condition_status === 'Baik'}
                        disabled
                      />
                    </TableCell>
                    <TableCell className="border text-center">
                      <Checkbox
                        className="h-5 w-5 rounded-sm border-[2px] border-gray-400 disabled:opacity-100 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-700"
                        checked={firstItem.condition_status === 'Rusak'}
                        disabled
                      />
                    </TableCell>
                    <TableCell className="border">
                      <Textarea value={firstItem.notes ?? ''} readOnly className="bg-gray-50" />
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Tidak ada detail item inspeksi ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-start gap-2">
          <Button type="button" variant="outline" onClick={() => router.get(route('inspection.ac.index'))}>
            Kembali
          </Button>

          {isOpenForVerification && userIsValidator && (
            <Button
              type="button"
              onClick={() => setVerifyDialogOpen(true)}
              className="bg-yellow-400 text-black hover:bg-yellow-300"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Verifikasi
            </Button>
          )}
        </div>

        <VerifyDialog
          open={isVerifyDialogOpen}
          onOpenChange={setVerifyDialogOpen}
          inspection={inspection} 
        />
      </div>
    </AppLayout>
  );
}