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
    // entity_code: string; // Tidak perlu ditampilkan, tapi mungkin masih perlu di tipe jika digunakan internal
    plant_code: string; // Tetap ada di tipe untuk fallback atau internal logic
    no_p3k: string;
    room_code: string;
    location: string;
    type: string;
    inventory_code: string;
    entity: {
        name: string; // Pastikan ini adalah name entity yang ingin ditampilkan
    } | null;
    plant_name: string | null; // Kolom untuk name plant, pastikan dari backend
};

export const columns: ColumnDef<MasterP3k>[] = [
    {
        id: 'index',
        header: 'No',
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'entity.name', // Langsung akses nested property
        header: 'Nama Entitas',
        cell: ({ row }) => {
            const entityNama = row.original.entity?.name; // Gunakan optional chaining untuk keamanan
            return entityNama ? entityNama : '-'; // Tampilkan name entity atau '-' jika null
        },
    },
    {
        accessorKey: 'plant_name',
        header: 'Plant',
        cell: ({ row }) => {
            const plantNama = row.original.plant_name;
            return plantNama ? plantNama : row.original.plant_code;

        },
    },
    {
        accessorKey: 'no_p3k',
        header: 'No P3K',
    },
    {
        accessorKey: 'room_code',
        header: 'Kode Ruang',
    },
    {
        accessorKey: 'location',
        header: 'Lokasi',
        cell: ({ row }) => (
            <div className="whitespace-pre-wrap">{row.original.location}</div>
        ),
    },
    {
        accessorKey: 'type',
        header: 'Jenis',
    },
    {
        accessorKey: 'inventory_code',
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
                        <DropdownMenuItem onClick={handleDelete} className="w-full text-left text-red-600 hover:text-red-700">Hapus</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
