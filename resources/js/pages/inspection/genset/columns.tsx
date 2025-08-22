'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id as indonesiaLocale } from 'date-fns/locale';

// UI & Icons
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Info, CheckCircle, XCircle } from 'lucide-react';

// ====== TYPES ======
export type GensetInspectionRow = {
  id: number;
  uuid: string;
  car_auto_number: string;
  inspection_date: string;
  approval_status_code: 'SOP' | 'SAP' | 'SRE' | string;
  genset: { serial_number?: string | null; merk?: string | null } | null;
  entity: { name: string } | null;
  plant: { name: string } | null;
  createdBy: { name: string } | null;
  periods?: string[]; // ← DITERIMA dari backend
  created_at?: string;
};

// Ziggy helper (jika ada)
declare function route(name: string, params?: any): string;

// ====== Helpers untuk normalisasi periode ======
const PERIOD_KEYS = ['MINGGUAN', 'BULANAN', '3 BULANAN', '6 BULANAN', 'TAHUNAN'] as const;
type PeriodKey = typeof PERIOD_KEYS[number];

function normalizeText(t?: string | null) {
  return (t ?? '').toString().trim().toLowerCase();
}

function bucketPeriod(raw?: string | null): PeriodKey | null {
  const t = normalizeText(raw);
  if (!t) return null;
  if (t.includes('minggu') || t.includes('week')) return 'MINGGUAN';
  if (t.includes('3') || t.includes('tri') || t.includes('quarter')) return '3 BULANAN';
  if (t.includes('6') || t.includes('semester')) return '6 BULANAN';
  if (t.includes('tahun') || t.includes('year')) return 'TAHUNAN';
  if (t.includes('bulan') || t.includes('month')) return 'BULANAN';
  return 'BULANAN';
}

const periodLabel: Record<PeriodKey, string> = {
  'MINGGUAN': 'Mingguan',
  'BULANAN': 'Bulanan',
  '3 BULANAN': '3 Bulanan',
  '6 BULANAN': '6 Bulanan',
  'TAHUNAN': 'Tahunan',
};

const periodBadgeClass: Record<PeriodKey, string> = {
  'MINGGUAN': 'bg-emerald-100 text-emerald-800',
  'BULANAN': 'bg-blue-100 text-blue-800',
  '3 BULANAN': 'bg-violet-100 text-violet-800',
  '6 BULANAN': 'bg-amber-100 text-amber-800',
  'TAHUNAN': 'bg-rose-100 text-rose-800',
};

// ====== Columns ======
export const columns: ColumnDef<GensetInspectionRow>[] = [
  {
    header: 'No',
    cell: ({ row }) => row.index + 1,
    size: 10,
  },
  {
    header: 'Status',
    cell: ({ row }) => {
      const code = row.original.approval_status_code;
      let icon: React.ReactNode = <Info className="h-4 w-4" />;
      let cls = 'bg-blue-100 text-blue-800';
      let label = 'Open';

      if (code === 'SAP') { icon = <CheckCircle className="h-4 w-4" />; cls = 'bg-green-100 text-green-800'; label = 'Approved'; }
      if (code === 'SRE') { icon = <XCircle className="h-4 w-4" />; cls = 'bg-red-100 text-red-800'; label = 'Rejected'; }

      // Show page ⇒ RESOURCE (pakai ID)
      // semula: { genset: row.original.id }
      const showHref = route
        ? route('inspection.genset.show', { genset: row.original.uuid })
        : `/inspection/genset/${row.original.uuid}`;


      return (
        <Link href={showHref}>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium transition-all hover:ring-2 hover:ring-offset-1 ${cls}`}>
            {icon}
            {label}
          </span>
        </Link>
      );
    },
  },
  {
    header: 'Entitas & Plant',
    cell: ({ row }) => (
      <div>
        <div>{row.original.entity?.name ?? '-'}</div>
        <div className="text-sm text-muted-foreground">{row.original.plant?.name ?? '-'}</div>
      </div>
    ),
  },
  {
    header: 'Nomor & Tanggal',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.car_auto_number}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.inspection_date
            ? format(new Date(row.original.inspection_date), 'dd MMM yyyy', { locale: indonesiaLocale })
            : '-'}
        </div>
      </div>
    ),
  },
  {
    header: 'Genset (SN & Merek)',
    cell: ({ row }) => (
      <div>
        <div>{row.original.genset?.serial_number ?? '-'}</div>
        <div className="text-sm text-muted-foreground">{row.original.genset?.merk ?? '-'}</div>
      </div>
    ),
  },

  // ====== KOLOM BARU: PERIODE INSPEKSI ======
  {
    header: 'Periode',
    cell: ({ row }) => {
      const uniqueBuckets: PeriodKey[] = Array.from(
        new Set(
          (row.original.periods ?? [])
            .map(p => bucketPeriod(p))
            .filter((x): x is PeriodKey => !!x)
        )
      );

      if (uniqueBuckets.length === 0) {
        return <span className="text-muted-foreground text-sm">—</span>;
      }

      return (
        <div className="flex flex-wrap gap-1.5">
          {uniqueBuckets.map((p) => (
            <span
              key={p}
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${periodBadgeClass[p]}`}
              title={periodLabel[p]}
            >
              {periodLabel[p]}
            </span>
          ))}
        </div>
      );
    },
  },

  {
    header: 'Dibuat Oleh',
    accessorFn: (row) => row.createdBy?.name ?? '-',
  },
  {
    header: '#',
        id: 'actions',
        cell: ({ row }) => {
            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                    router.delete(`/inspection/genset/${row.original.uuid}`);
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
                            <Link href={`/inspection/genset/${row.original.uuid}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="w-full text-left text-red-600 hover:text-red-700">
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];