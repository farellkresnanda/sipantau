'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, Clock, Info, MoreHorizontal, XCircle } from 'lucide-react';
import { format } from 'date-fns';

// ✅ Tipe data inspeksi P3K
export type InspectionFirstAidData = {
  id: number;
  uuid: string;
  kit: {
    location: string;
    inventory_code: string;
  } | null;
  status: {
    id: number;
    name: string;
  } | null;
  inspector: {
    name: string;
  } | null;
  validator: {
    name: string;
  } | null;
  entity: {
    name: string;
  } | null;
  plant: {
    name: string;
  } | null;
  has_findings: boolean;
  inspection_date: string;
  validated_at: string | null;
  notes: string | null;
};

// ✅ Daftar kolom tabel
export const columns: ColumnDef<InspectionFirstAidData>[] = [
  {
    accessorKey: 'index',
    header: 'No',
    cell: ({ row }) => row.index + 1,
  },
  {
    header: 'Status Inspeksi',
    accessorKey: 'status.name',
    cell: ({ row }) => {
      const status = row.original.status;
      const statusId = status?.id;
      const statusName = status?.name ?? 'Tidak Diketahui';

      let icon: React.ReactNode = null;
      let colorClasses = '';

      switch (statusId) {
        case 1:
          icon = <Clock className="h-4 w-4" />;
          colorClasses = 'bg-yellow-100 text-yellow-700';
          break;
        case 2:
          icon = <CheckCircle className="h-4 w-4" />;
          colorClasses = 'bg-green-100 text-green-700';
          break;
        case 3:
          icon = <XCircle className="h-4 w-4" />;
          colorClasses = 'bg-red-100 text-red-700';
          break;
        default:
          icon = <Info className="h-4 w-4" />;
          colorClasses = 'bg-gray-100 text-gray-700';
      }

      return (
        <Link
          href={route('inspection.first-aid.show', row.original.id)}
          className="inline-flex items-center gap-2 hover:underline"
        >
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${colorClasses}`}
          >
            {icon}
            {statusName}
          </span>
        </Link>
      );
    },
  },
  {
    header: 'Entitas & Plant',
    accessorKey: 'entity.name',
    cell: ({ row }) => {
      const entity = row.original.entity?.name ?? '-';
      const plant = row.original.plant?.name ?? '-';

      return (
        <div className="flex flex-col">
          <span className="font-medium">{entity}</span>
          <span className="text-sm text-gray-500">{plant}</span>
        </div>
      );
    },
  },
  {
    header: 'Lokasi P3K',
    accessorKey: 'kit.location',
    cell: ({ row }) => {
      const location = row.original.kit?.location ?? '-';
      const inventoryCode = row.original.kit?.inventory_code ?? '-';
      return (
        <div className="flex flex-col">
          <span className="font-medium">{location}</span>
          <span className="text-sm text-gray-500">{inventoryCode}</span>
        </div>
      );
    },
  },
  {
    header: 'Tanggal Inspeksi',
    accessorKey: 'inspection_date',
    cell: ({ row }) => {
      const date = row.original.inspection_date;
      return date ? format(new Date(date), 'dd MMM yyyy') : '-';
    },
  },
  {
    header: 'Hasil',
    accessorKey: 'has_findings',
    cell: ({ row }) =>
      row.original.has_findings ? (
        <span className="text-orange-600 font-semibold">Ada Temuan</span>
      ) : (
        <span className="text-green-600">Sesuai</span>
      ),
  },
  {
    header: 'Diinspeksi Oleh',
    accessorKey: 'inspector.name',
    cell: ({ row }) => row.original.inspector?.name ?? '-',
  },
  {
    header: 'Divalidasi Oleh',
    accessorKey: 'validator.name',
    cell: ({ row }) => {
      const validatorName = row.original.validator?.name ?? '-';
      const validatedDate = row.original.validated_at
        ? format(new Date(row.original.validated_at), 'dd MMM yyyy')
        : null;

      return (
        <div className="flex flex-col">
          <span>{validatorName}</span>
          {validatedDate && <span className="text-sm text-gray-500">{validatedDate}</span>}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const inspection = row.original;

      const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus data inspeksi ini?')) {
          router.delete(route('inspection.first-aid.destroy', inspection.id));
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Buka menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={route('inspection.first-aid.show', inspection.id)}>Lihat Detail</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
