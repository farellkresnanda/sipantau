'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { router } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { showToast } from '@/components/ui/toast';

// ✅ Tipe data Genset lengkap
export type MasterGenset = {
  id: number;
  entity_code: string;
  plant_code: string;
  machine_type: string;
  merk: string;
  model: string;
  country_year_of_manufacture: string;
  manufacturer: string;
  serial_number: string;
  capacity: string;
  entity?: {
    name: string;
  };
  plant?: {
    name: string;
  };
};

export const columns: ColumnDef<MasterGenset>[] = [
  {
    id: 'index',
    header: 'No',
    cell: ({ row }) => row.index + 1,
  },
  {
    header: 'Entitas',
    accessorFn: (row) => row.entity?.name ?? row.entity_code,
  },
  {
    header: 'Plant',
    accessorFn: (row) => row.plant?.name ?? row.plant_code,
  },
  {
    accessorKey: 'machine_type',
    header: 'Jenis Mesin',
  },
  {
    accessorKey: 'merk',
    header: 'Merk',
  },
  {
    accessorKey: 'model',
    header: 'Model',
  },
  {
    accessorKey: 'country_year_of_manufacture',
    header: 'Negara/Thn Pembuatan',
  },
  {
    accessorKey: 'manufacturer',
    header: 'Pabrik Pembuat',
  },
  {
    accessorKey: 'serial_number',
    header: 'No Seri',
  },
  {
    accessorKey: 'capacity',
    header: 'Kapasitas',
  },
  {
    id: 'actions',
    header: '#',
    cell: ({ row }) => {
      const genset = row.original;

      const handleDelete = () => {
        const confirmDelete = confirm(
          `Yakin ingin menghapus Genset dengan serial "${genset.serial_number}"?`
        );
        if (confirmDelete) {
          router.delete(route('genset.destroy', genset.id), {
            onSuccess: () => {
              showToast({ type: 'success', message: 'Data Genset berhasil dihapus.' });
            },
            onError: () => {
              showToast({ type: 'error', message: 'Gagal menghapus data Genset.' });
            },
          });
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Action</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.visit(route('genset.edit', genset.id))}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
