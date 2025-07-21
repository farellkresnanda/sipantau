'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarDays, CheckCircle, Info, MapPin, MoreVertical, XCircle } from 'lucide-react';

export type InspectionFirstAidData = {
  id: number;
  uuid: string;
  approval_status: {
    id: number;
    name: string;
  } | null;
  entity: {
    name: string;
  } | null;
  plant: {
    name: string;
  } | null;
  car_auto_number: string;
  inspection_date: string;
  project_name: string;
  job_description: string;
  location: {
    name: string;
  } | null;
  created_by: {
    name: string;
  } | null;
  created_at: string;
};

export const columns: ColumnDef<InspectionFirstAidData>[] = [
  {
    accessorKey: 'index',
    header: 'No',
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: 'approval_status',
    header: 'Status Inspeksi',
    cell: ({ row }) => {
      const status = row.original.approval_status;
      const statusId = status?.id;
      const statusName = status?.name || '-';

      let icon = null;
      let color = '';

      switch (statusId) {
        case 1:
          icon = <Info className="h-4 w-4" />;
          color = 'bg-blue-100 text-blue-700';
          break;
        case 2:
          icon = <CheckCircle className="h-4 w-4" />;
          color = 'bg-green-100 text-green-700';
          break;
        case 3:
          icon = <XCircle className="h-4 w-4" />;
          color = 'bg-red-100 text-red-700';
          break;
        default:
          color = 'bg-gray-100 text-gray-700';
      }

      return (
        <Link href={`/inspection/first-aid/${row.original.uuid}`} className="inline-flex items-center gap-2 hover:underline">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${color}`}>
            {icon}
            {statusName}
          </span>
        </Link>
      );
    },
  },
  {
    accessorKey: 'entity',
    header: 'Entitas & Plant',
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <div>{row.original.entity?.name ?? '-'}</div>
        <div className="text-sm text-gray-500">{row.original.plant?.name ?? '-'}</div>
      </div>
    ),
  },
  {
    accessorKey: 'car_auto_number',
    header: 'Nomor CAR & Tanggal',
    cell: ({ row }) => {
      const carNumber = row.original.car_auto_number;
      const date = row.original.inspection_date;
      return (
        <div className="flex flex-col">
          <span>{carNumber}</span>
          <span className="flex items-center gap-1 text-sm text-gray-500">
            <CalendarDays className="h-3 w-3" />
            {date}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'job_description',
    header: 'Pekerjaan & Proyek',
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <Info className="h-3 w-3" />
          <div className="max-w-[200px] truncate">{row.original.job_description}</div>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-3 w-3" />
          <div className="max-w-[200px] truncate">{row.original.project_name}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'location',
    header: 'Lokasi',
    cell: ({ row }) => row.original.location?.name ?? '-',
  },
  {
    accessorKey: 'created_by',
    header: 'Dibuat Oleh',
    cell: ({ row }) => row.original.created_by?.name ?? '-',
  },
  {
    accessorKey: 'created_at',
    header: 'Tanggal Dibuat',
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value?.replace('T', ' ').split('.')[0];
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
          router.delete(`/inspection/first-aid/${row.original.id}`);
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
              <Link href={`/inspection/first-aid/${row.original.uuid}/edit`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="w-full text-left text-red-600 hover:text-red-700">
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
