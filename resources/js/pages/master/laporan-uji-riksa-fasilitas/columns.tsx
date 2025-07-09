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

// Tipe data untuk Uji Riksa Fasilitas
type UjiRiksaFasilitas = {
  id: number;
  nama_fasilitas: string;
  referensi: string;
};

export const columns: ColumnDef<UjiRiksaFasilitas>[] = [
  {
    id: 'index',
    header: 'No',
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: 'nama_fasilitas',
    header: 'Nama Fasilitas',
  },
  {
    accessorKey: 'referensi',
    header: 'Referensi',
  },
  {
    id: 'actions',
    header: '#',
    cell: ({ row }) => {
      const fasilitas = row.original;

      const handleDelete = () => {
        const confirmed = window.confirm('Are you sure you want to delete this Master Laporan Uji Riksa Fasilitas?');
        if (confirmed) {
          router.delete(route('laporan-uji-riksa-fasilitas.destroy', fasilitas.id));
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
            <DropdownMenuItem onClick={() => router.visit(route('laporan-uji-riksa-fasilitas.edit', fasilitas.id))}>
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
