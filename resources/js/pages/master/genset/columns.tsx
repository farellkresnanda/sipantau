'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { router } from '@inertiajs/react';

type MasterGenset = {
  id: number;
  jenis_mesin: string;
  merk: string;
  model: string;
  negara_thn_pembuatan: string;
  pabrik_pembuat: string;
  no_seri: string;
  kapasitas: string;
};

export const columns: ColumnDef<MasterGenset>[] = [
  {
    id: 'index',
    header: 'No',
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: 'jenis_mesin',
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
    accessorKey: 'negara_thn_pembuatan',
    header: 'Negara/Thn Pembuatan',
  },
  {
    accessorKey: 'pabrik_pembuat',
    header: 'Pabrik Pembuat',
  },
  {
    accessorKey: 'no_seri',
    header: 'No Seri',
  },
  {
    accessorKey: 'kapasitas',
    header: 'Kapasitas',
  },
  {
    id: 'actions',
    header: '#',
    cell: ({ row }) => {
      const genset = row.original;

      const handleDelete = () => {
        if (confirm('Are you sure you want to delete this Master Genset?')) {
          router.delete(route('genset.destroy', genset.id));
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
