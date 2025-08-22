'use client';

import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import {
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle,
  FileText,
  Factory,
  ShieldCheck,
  User as UserIcon,
  UserCheck,
  XCircle,
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem, PageProps as BasePageProps } from '@/types';
import ValidatorVerifyGensetDialog from './verify-dialog';

// ================= Types =================
type Role = { name: string };
type AuthUser = { id: number; name: string; email: string; roles: Role[] };

type WorkStandard = { id: number; work_item: string; period: string | null };
type Item = { id: number; notes: string | null; work_standard?: WorkStandard | null };

type SimpleMaster = { name?: string | null };
type Genset = { serial_number?: string | null; merk?: string | null };

type Inspection = {
  id: number;
  uuid: string;
  car_auto_number: string;
  inspection_date: string | null;
  approval_status_code: 'SOP' | 'SAP' | 'SRE' | string;
  note_validator?: string | null;
  approved_at?: string | null;
  genset?: Genset | null;
  entity?: SimpleMaster | null;
  plant?: SimpleMaster | null;
  createdBy?: { name?: string | null } | null;
  approvedBy?: { name?: string | null } | null;
  created_by?: { name?: string | null } | null;
  approved_by?: { name?: string | null } | null;
  items: Item[];
};

type ShowPageProps = BasePageProps & {
  gensetInspection: Inspection;
  auth: { user: AuthUser };
};

// Ziggy helper
declare function route(name: string, params?: any): string;

// ================ Helpers ================
function fmt(dateStr?: string | null) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return format(d, 'd MMMM yyyy', { locale: localeID });
}

function statusBadge(code?: string) {
  switch (code) {
    case 'SAP':
      return { label: 'Approved', className: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> };
    case 'SRE':
      return { label: 'Rejected', className: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4" /> };
    default:
      return { label: 'Open', className: 'bg-blue-100 text-blue-800', icon: <ShieldCheck className="h-4 w-4" /> };
  }
}

// ================ Component ================
export default function ShowGensetInspectionPage() {
  const { gensetInspection: inspection } = usePage<ShowPageProps>().props;

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: route('home') },
    { title: 'Inspeksi Genset', href: route('inspection.genset.index') },
    { title: 'Detail', href: '#' },
  ];

  const st = statusBadge(inspection.approval_status_code);
  const isApproved = inspection.approval_status_code === 'SAP';
  const isApprovedOrRejected = inspection.approval_status_code === 'SAP' || inspection.approval_status_code === 'SRE';
  const canVerify = inspection.approval_status_code === 'SOP';

  // Jika route print menerima {id}
  const handlePrint = () => {
    const href = route('inspection.genset.print', inspection.uuid);
    window.open(href, '_blank');
  };

  // Periode unik dari items
  const uniquePeriods = Array.from(
    new Set(
      (inspection.items ?? [])
        .map((it) => it.work_standard?.period || '')
        .filter((p) => p && p.trim().length > 0)
    )
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Detail Inspeksi ${inspection.car_auto_number || ''}`} />

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" title="Nomor Dokumen">
            <FileText className="mr-1.5 h-4 w-4" />
            {inspection.car_auto_number || '-'}
          </Badge>

          <Badge variant="outline" title="Tanggal Inspeksi">
            <Calendar className="mr-1.5 h-4 w-4" />
            {fmt(inspection.inspection_date)}
          </Badge>

          <Badge variant="outline" title="Genset">
            <BadgeCheck className="mr-1.5 h-4 w-4" />
            {(inspection.genset?.serial_number || '-') + ' • ' + (inspection.genset?.merk || '-')}
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
            {inspection.created_by?.name || '-'}
          </Badge>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${st.className}`}
            title="Status"
          >
            {st.icon}
            {st.label}
          </span>

          {/* Export PDF kecil ala halaman AC */}
          {isApproved && (
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1 rounded-md border border-transparent bg-blue-500 px-2.5 py-0.5 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
              title="Export PDF"
            >
              <FileText className="h-4 w-4" />
              Export PDF
            </button>
          )}
        </div>

        {/* Info ringkas */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Inspeksi</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 pt-0 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                <Calendar className="h-4 w-4" /> Tanggal Inspeksi
              </p>
              <p className="text-sm">{fmt(inspection.inspection_date)}</p>
            </div>
            <div>
              <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                <UserIcon className="h-4 w-4" /> Dibuat Oleh
              </p>
              <p className="text-sm">{inspection.created_by?.name ?? '-'}</p>
            </div>

            {isApprovedOrRejected && (
              <>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                    <UserCheck className="h-4 w-4" /> Diverifikasi Oleh
                  </p>
                  <p className="text-sm">{inspection.approved_by?.name ?? '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                    <Calendar className="h-4 w-4" /> Tanggal Verifikasi
                  </p>
                  <p className="text-sm">{fmt(inspection.approved_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                    <FileText className="h-4 w-4" /> Komentar Validator
                  </p>
                  <p className="whitespace-pre-line text-sm">
                    {inspection.note_validator?.trim() || '-'}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Periode yang tercakup */}
        <Card>
          <CardHeader>
            <CardTitle>Periode Tercatat</CardTitle>
          </CardHeader>
        <CardContent className="pt-0">
            {uniquePeriods.length === 0 ? (
              <p className="text-sm text-muted-foreground">—</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {uniquePeriods.map((p) => {
                  let cls = 'bg-gray-100 text-gray-800';
                  const normalized = p.toLowerCase();
                  if (normalized.includes('minggu')) cls = 'bg-emerald-100 text-emerald-800';
                  else if (normalized.includes('3')) cls = 'bg-violet-100 text-violet-800';
                  else if (normalized.includes('6')) cls = 'bg-amber-100 text-amber-800';
                  else if (normalized.includes('tahun')) cls = 'bg-rose-100 text-rose-800';
                  else if (normalized.includes('bulan')) cls = 'bg-blue-100 text-blue-800';

                  return (
                    <span
                      key={p}
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}
                    >
                      {p}
                    </span>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daftar pekerjaan yang dicek */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Pekerjaan</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="border">
              <TableHeader>
                <TableRow className="bg-yellow-300/70">
                  <TableHead className="border font-bold text-black">Pekerjaan</TableHead>
                  <TableHead className="border font-bold text-black w-[160px]">Periode</TableHead>
                  <TableHead className="border font-bold text-black">Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspection.items?.length ? (
                  inspection.items.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell className="border align-top">
                        {it.work_standard?.work_item || '-'}
                      </TableCell>
                      <TableCell className="border align-top">
                        {it.work_standard?.period || '-'}
                      </TableCell>
                      <TableCell className="border align-top whitespace-pre-line">
                        {it.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Tidak ada item inspeksi.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href={route('inspection.genset.index')}>Kembali</Link>
          </Button>

          {/* Verifikasi via dialog (hanya saat SOP) */}
          {canVerify && (
            <ValidatorVerifyGensetDialog
              inspection={{ uuid: inspection.uuid, approval_status_code: inspection.approval_status_code }}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
