// resources/js/pages/analysis/k3-program/columns.tsx
'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id as indonesiaLocale } from 'date-fns/locale';
import { Info, CheckCircle, XCircle, MoreVertical } from 'lucide-react';

// UI
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Ziggy (opsional)
declare function route(name: string, params?: any): string;

export type K3ProgramRow = {
  id: number;
  uuid: string;
  year: number;
  target_description: string | null;
  entity_code: string;
  plant_code: string;
  entity?: { name?: string } | null;
  plant?: { name?: string } | null;
  approval_status_code: 'SOP' | 'SAP' | 'SRE';
  updated_at: string; // ISO
  abilities?: { can_edit?: boolean; can_verify?: boolean; can_delete?: boolean };
};

function fmtDate(v?: string) {
  if (!v) return '-';
  const d = new Date(v);
  if (isNaN(+d)) return v;
  return format(d, 'dd MMM yyyy HH:mm', { locale: indonesiaLocale });
}

// helper aman: jika Ziggy ada, pakai; kalau tidak, pakai path fallback
const hrefShow = (uuid: string) =>
  typeof route === 'function'
    ? route('analysis.k3-program.show', { k3_program: uuid })
    : `/analysis/k3-program/${uuid}`;

const hrefEdit = (uuid: string) =>
  typeof route === 'function'
    ? route('analysis.k3-program.edit', { k3_program: uuid })
    : `/analysis/k3-program/${uuid}/edit`;

const urlDestroy = (uuid: string) =>
  typeof route === 'function'
    ? route('analysis.k3-program.destroy', { k3_program: uuid })
    : `/analysis/k3-program/${uuid}`;

// contoh bila kamu punya halaman capaian (sesuaikan bila route-nya beda)
const hrefAchievements = (uuid: string) =>
  `/analysis/k3-program/${uuid}/achievements`;

// route custom verify kamu: POST k3-program/{program:uuid}/verify
const urlVerify = (uuid: string) =>
  typeof route === 'function'
    ? route('analysis.k3-program.verify', { program: uuid })
    : `/analysis/k3-program/${uuid}/verify`;

export const columns: ColumnDef<K3ProgramRow>[] = [
  // No
  {
    header: 'No',
    cell: ({ row }) => <span className="tabular-nums">{row.index + 1}</span>,
    size: 10,
  },

  // Status (klik badge → show)
  {
    header: 'Status',
    cell: ({ row }) => {
      const code = row.original.approval_status_code;
      let icon: React.ReactNode = <Info className="h-4 w-4" />;
      let cls = 'bg-blue-100 text-blue-800';
      let label = 'Open';

      if (code === 'SAP') {
        icon = <CheckCircle className="h-4 w-4" />;
        cls = 'bg-green-100 text-green-800';
        label = 'Approved';
      }
      if (code === 'SRE') {
        icon = <XCircle className="h-4 w-4" />;
        cls = 'bg-red-100 text-red-800';
        label = 'Rejected';
      }

      return (
        <Link href={hrefShow(row.original.uuid)} aria-label={`Buka detail program: status ${label}`}>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium transition-all hover:ring-2 hover:ring-offset-1 ${cls}`}>
            {icon}
            {label}
          </span>
        </Link>
      );
    },
  },

  // Tahun
  {
    accessorKey: 'year',
    header: 'Tahun',
    cell: ({ row }) => <span className="tabular-nums">{row.original.year}</span>,
  },

  // Entitas & Plant
  {
    header: 'Entitas & Plant',
    cell: ({ row }) => {
      const entName = row.original.entity?.name || row.original.entity_code || '-';
      const plantName = row.original.plant?.name || row.original.plant_code || '-';
      return (
        <div className="leading-tight">
          <div className="text-foreground">{entName}</div>
          <div className="text-muted-foreground text-xs">{plantName}</div>
        </div>
      );
    },
  },

  // Deskripsi Target
  {
    accessorKey: 'target_description',
    header: 'Deskripsi Target',
    cell: ({ row }) => (
      <span className="line-clamp-2">{row.original.target_description || '-'}</span>
    ),
  },

  // Diupdate
  {
    accessorKey: 'updated_at',
    header: 'Diupdate',
    cell: ({ row }) => (
      <span className="text-muted-foreground">{fmtDate(row.original.updated_at)}</span>
    ),
  },

  // Aksi (dropdown)
  {
    id: 'actions',
    header: '#',
    cell: ({ row }) => {
      const { uuid, abilities } = row.original;
      const canEdit = abilities?.can_edit ?? false;
      const canDelete = abilities?.can_delete ?? canEdit;
      const canVerify = abilities?.can_verify ?? false;

      const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus Program K3 ini? Tindakan ini tidak dapat dibatalkan.')) {
          router.delete(urlDestroy(uuid), { preserveScroll: true });
        }
      };

      const handleVerify = () => {
        if (confirm('Verifikasi program ini?')) {
          router.post(urlVerify(uuid), {}, { preserveScroll: true });
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={hrefAchievements(uuid)}>Isi Capaian</Link>
            </DropdownMenuItem>

            {canEdit && (
              <DropdownMenuItem asChild>
                <Link href={hrefEdit(uuid)}>Edit</Link>
              </DropdownMenuItem>
            )}

            {canVerify && (
              <DropdownMenuItem onClick={handleVerify}>
                Verifikasi
              </DropdownMenuItem>
            )}

            {canDelete && (
              <DropdownMenuItem
                onClick={handleDelete}
                className="w-full text-left text-red-600 hover:text-red-700"
              >
                Hapus
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
