'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';


export type MasterGedung = {
    id: number;
    kode_entitas: string; 
    kode_plant: string;   
    nama_lokasi: string;
    entitas_nama: string; 
    plant_nama: string;   
};

export const columns: ColumnDef<MasterGedung>[] = [
    {
        id: 'index',
        header: 'No',
        cell: ({ row }) => row.index + 1, 
    },
    {
        accessorKey: 'entitas_nama', 
        header: 'Nama Entitas',
        cell: ({ row }) => {
            
            return row.original.entitas_nama || '-';
        },
    },
    {
        accessorKey: 'plant_nama', 
        header: 'Nama Plant',
        cell: ({ row }) => {
            
            return row.original.plant_nama || '-';
        },
    },
    {
        accessorKey: 'nama_lokasi', 
        header: 'Nama Lokasi',
        cell: ({ row }) => (
           
            <div className="whitespace-pre-wrap">{row.original.nama_lokasi}</div>
        ),
    },
    {
        id: 'actions',
        header: '#', // Kolom untuk aksi (Edit, Hapus)
        cell: ({ row }) => {
            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus data gedung ini?')) {
                    // Menggunakan route helper untuk menghapus data
                    router.delete(route('gedung.destroy', row.original.id));
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
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            {/* Menggunakan route helper untuk navigasi ke halaman edit */}
                            <Link href={route('gedung.edit', row.original.id)}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete}>Hapus</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
