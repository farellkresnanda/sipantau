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
  equipment_name: string;
  reference: string | null;
};

// Definisi kolom tabel
export const columns: ColumnDef<UjiRiksaPeralatan>[] = [
  {
    id: 'index',
    header: 'No',
    enableSorting: false,
    cell: ({ table, row }) => {
      // Gunakan stage data sebenarnya, bukan row.index default
      const sortedRows = table.getRowModel().rows;
      const index = sortedRows.findIndex(r => r.id === row.id);
      return index + 1;
    },
  },
  {
    accessorKey: 'equipment_name',
    header: 'Nama Peralatan',
  },
  {
    accessorKey: 'reference',
    header: 'Referensi',
    cell: ({ row }) => {
      const reference = row.original.reference;
      return reference && reference.trim() !== ''
        ? reference
        : <span className="text-gray-400 italic">Tidak ada reference</span>;
    },
  },
  {
    id: 'actions',
    header: '#',
    enableSorting: false,
    cell: ({ row }) => {
      const peralatan = row.original;

      const handleDelete = () => {
        if (confirm('Are you sure you want to delete this Master Uji Riksa Peralatan?')) {
          router.delete(route('test-equipment-report.destroy', peralatan.id));
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
            <DropdownMenuItem onClick={() => router.visit(route('test-equipment-report.edit', peralatan.id))}>
              Edit
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
