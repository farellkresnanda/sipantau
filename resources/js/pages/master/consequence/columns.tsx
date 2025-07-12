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


type MasterKonsekuensi = {
  id: number;
  name: string;
  consequence: string;
};

export const columns: ColumnDef<MasterKonsekuensi>[] = [
  {
    id: 'index',
    header: 'No',
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: 'name',
    header: 'Nama Konsekuensi',
  },
  {
    accessorKey: 'consequence',
    header: 'Konsekuensi',
  },
  {
    id: 'actions',
    header: '#',
    cell: ({ row }) => {
      const consequence = row.original;

      const handleDelete = () => {
        const confirmed = window.confirm('Are you sure you want to delete this Master Konsekuensi?');
        if (confirmed) {
          router.delete(route('consequence.destroy', consequence.id));
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
            <DropdownMenuItem onClick={() => router.visit(route('consequence.edit', consequence.id))}>
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
