'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { router } from '@inertiajs/react';

// Tipe data
export type UjiRiksaPeralatan = {
  id: number;
  nama_peralatan: string;
  referensi: string | null;
};

// Definisi kolom tabel
export const columns: ColumnDef<UjiRiksaPeralatan>[] = [
  {
    id: 'index',
    header: 'No',
    enableSorting: false,
    cell: ({ table, row }) => {
      // Gunakan urutan data sebenarnya, bukan row.index default
      const sortedRows = table.getRowModel().rows;
      const index = sortedRows.findIndex(r => r.id === row.id);
      return index + 1;
    },
  },
  {
    accessorKey: 'nama_peralatan',
    header: 'Nama Peralatan',
  },
  {
    accessorKey: 'referensi',
    header: 'Referensi',
    cell: ({ row }) => {
      const referensi = row.original.referensi;
      return referensi && referensi.trim() !== ''
        ? referensi
        : <span className="text-gray-400 italic">Tidak ada referensi</span>;
    },
  },
  {
    id: 'actions',
    header: '#',
    enableSorting: false,
    cell: ({ row }) => {
      const peralatan = row.original;

      const handleDelete = () => {
        if (confirm('Yakin ingin menghapus data ini?')) {
          router.delete(route('laporan-uji-riksa-peralatan.destroy', peralatan.id));
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.visit(route('laporan-uji-riksa-peralatan.edit', peralatan.id))}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
