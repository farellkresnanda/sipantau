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

export type MasterP3k = {
    id: number;
    // kode_entitas: string; // Tidak perlu ditampilkan, tapi mungkin masih perlu di tipe jika digunakan internal
    kode_plant: string; // Tetap ada di tipe untuk fallback atau internal logic
    no_p3k: string;
    kode_ruang: string;
    lokasi: string;
    jenis: string;
    kode_inventaris: string;
    entitas: {
        nama: string; // Pastikan ini adalah nama entitas yang ingin ditampilkan
    } | null;
    plant_nama: string | null; // Kolom untuk nama plant, pastikan dari backend
};

export const columns: ColumnDef<MasterP3k>[] = [
    {
        id: 'index',
        header: 'No',
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'entitas.nama', // Langsung akses nested property
        header: 'Nama Entitas',
        cell: ({ row }) => {
            const entitasNama = row.original.entitas?.nama; // Gunakan optional chaining untuk keamanan
            return entitasNama ? entitasNama : '-'; // Tampilkan nama entitas atau '-' jika null
        },
    },
    {
        accessorKey: 'plant_nama',
        header: 'Plant',
        cell: ({ row }) => {
            const plantNama = row.original.plant_nama;
            return plantNama ? plantNama : row.original.kode_plant;
          
        },
    },
    {
        accessorKey: 'no_p3k',
        header: 'No P3K',
    },
    {
        accessorKey: 'kode_ruang',
        header: 'Kode Ruang',
    },
    {
        accessorKey: 'lokasi',
        header: 'Lokasi',
        cell: ({ row }) => (
            <div className="whitespace-pre-wrap">{row.original.lokasi}</div>
        ),
    },
    {
        accessorKey: 'jenis',
        header: 'Jenis',
    },
    {
        accessorKey: 'kode_inventaris',
        header: 'Kode Inventaris',
    },
    {
        id: 'actions',
        header: '#',
        cell: ({ row }) => {
            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                    router.delete(route('p3k.destroy', row.original.id));
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
                            <Link href={route('p3k.edit', row.original.id)}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete}>Hapus</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];