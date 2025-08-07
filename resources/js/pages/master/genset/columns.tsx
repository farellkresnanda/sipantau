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
        id: 'entity',
        accessorFn: (row) => row.entity?.name ?? row.entity_code,
        enableGlobalFilter: true,
    },
    {
        header: 'Plant',
        id: 'plant',
        accessorFn: (row) => row.plant?.name ?? row.plant_code,
        enableGlobalFilter: true,
    },
    {
        header: 'Jenis Mesin',
        id: 'machine_type',
        accessorFn: (row) => row.machine_type,
        enableGlobalFilter: true,
    },
    {
        header: 'Merk',
        id: 'merk',
        accessorFn: (row) => row.merk,
        enableGlobalFilter: true,
    },
    {
        header: 'Model',
        id: 'model',
        accessorFn: (row) => row.model,
        enableGlobalFilter: true,
    },
    {
        header: 'Negara/Thn Pembuatan',
        id: 'country_year_of_manufacture',
        accessorFn: (row) => row.country_year_of_manufacture,
        enableGlobalFilter: true,
    },
    {
        header: 'Pabrik Pembuat',
        id: 'manufacturer',
        accessorFn: (row) => row.manufacturer,
        enableGlobalFilter: true,
    },
    {
        header: 'No Seri',
        id: 'serial_number',
        accessorFn: (row) => row.serial_number,
        enableGlobalFilter: true,
    },
    {
        header: 'Kapasitas',
        id: 'capacity',
        accessorFn: (row) => row.capacity,
        enableGlobalFilter: true,
    },
    {
        id: 'actions',
        header: '#',
        cell: ({ row }) => {
            const genset = row.original;

            const handleDelete = () => {
                const confirmDelete = confirm(`Yakin ingin menghapus Genset dengan serial "${genset.serial_number}"?`);
                if (confirmDelete) {
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.visit(route('genset.edit', genset.id))}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="w-full text-left text-red-600 hover:text-red-700">
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
