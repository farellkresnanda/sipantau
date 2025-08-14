'use client';

import { ColumnDef } from '@tanstack/react-table';
import { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { MoreVertical, Info, CheckCircle, XCircle, User, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { id as indonesiaLocale } from 'date-fns/locale';

// Menambahkan tipe spesifik untuk User dengan roles
type UserWithRoles = {
    id: number;
    name: string;
    email: string;
    roles: { name: string }[];
};

interface PagePropsWithUser extends PageProps {
    auth: PageProps['auth'] & {
        user: UserWithRoles;
    };
}

// Tipe data untuk setiap baris, pastikan cocok dengan data dari Controller
export type AcInspectionRow = {
    id: number;
    uuid: string;
    car_auto_number: string;
    inspection_date: string;
    created_at: string;
    approval_status_code: string;
    entity: { name: string } | null;
    plant: { name: string } | null;
    location: { inventory_code: string; room: string; } | null;
    // [REVISI FINAL] Disederhanakan agar cocok dengan contoh FirstAid
    createdBy: {
        name: string;
    } | null;
    approvalStatus: { id: number; code: string; name: string; } | null;
};

// Asumsi 'route' adalah fungsi global yang tersedia di aplikasi Anda.
declare function route(name: string, params?: any): string;

// [FINAL] Mengekspor konstanta 'columns' dengan urutan dan nama properti yang benar
export const columns: ColumnDef<AcInspectionRow>[] = [
    {
        header: 'No',
        cell: ({ row }) => row.index + 1,
    },
    {
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.approvalStatus;
            const statusCode = status?.code ?? row.original.approval_status_code;
            const statusName = status?.name || 'Draft';
            let icon = null;
            let color = 'bg-gray-100 text-gray-700';
            switch (statusCode) {
                case 'SOP': icon = <Info className="h-4 w-4" />; color = 'bg-blue-100 text-blue-700'; break;
                case 'SAP': icon = <CheckCircle className="h-4 w-4" />; color = 'bg-green-100 text-green-700'; break;
                case 'SRE': icon = <XCircle className="h-4 w-4" />; color = 'bg-red-100 text-red-700'; break;
            }
                        return (
                <a href={route('inspection.ac.show', row.original.uuid)} className="hover:underline">
                    {/* [REVISI] Menambahkan kelas untuk efek outline saat hover */}
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium transition-all hover:ring-1 hover:ring-offset-1 ${color}`}>
                        {icon} {statusName}
                    </span>
                </a>
            );
        },
    },
    {
        header: 'Entitas & Plant',
        cell: ({ row }) => (
            <div>
                <div>{row.original.entity?.name ?? '-'}</div>
                <div className="text-sm text-muted-foreground">{row.original.plant?.name ?? '-'}</div>
            </div>
        ),
    },
    {
        header: 'Nomor & Tanggal',
        cell: ({ row }) => (
            <div>
                <div className="font-medium">{row.original.car_auto_number}</div>
                <div className="text-sm text-muted-foreground">
                    {format(new Date(row.original.inspection_date), 'dd MMM yyyy', { locale: indonesiaLocale })}
                </div>
            </div>
        ),
    },
    {
        header: 'Lokasi AC & Inventaris',
        cell: ({ row }) => (
            <div>
                <div>{row.original.location?.room ?? '-'}</div>
                <div className="text-sm text-muted-foreground">{row.original.location?.inventory_code ?? '-'}</div>
            </div>
        ),
    },
    {
        // [REVISI FINAL] Disederhanakan agar cocok dengan contoh FirstAid
        header: 'Dibuat Oleh',
        accessorFn: (row) => row.createdBy?.name ?? '-',
    },
    {
        header: 'Tanggal Dibuat',
        accessorKey: 'created_at',
        cell: ({ row }) => format(new Date(row.original.created_at), 'dd/MM/yyyy, HH:mm'),
    },
    {
        id: 'actions',
        cell: function ActionsCell({ row }) {
            const inspection = row.original;
            const { auth } = usePage<PagePropsWithUser>().props;
            const [isOpen, setIsOpen] = useState(false);
            const dropdownRef = useRef<HTMLDivElement>(null);

            const canModify = auth.user.roles.some(role => role.name === 'SuperAdmin');

            useEffect(() => {
                function handleClickOutside(event: MouseEvent) {
                    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                        setIsOpen(false);
                    }
                }
                document.addEventListener("mousedown", handleClickOutside);
                return () => {
                    document.removeEventListener("mousedown", handleClickOutside);
                };
            }, [dropdownRef]);

            return (
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center justify-center w-8 h-8 p-0 transition-colors bg-transparent border-none rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                        <MoreVertical className="w-4 h-4" />
                        <span className="sr-only">Buka menu</span>
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 z-10 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className="py-1" role="menu" aria-orientation="vertical">
                                <div className="px-3 py-2 text-sm font-semibold text-gray-800 border-b">Aksi</div>
                                <a
                                    href={route('inspection.ac.show', inspection.uuid)}
                                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    role="menuitem"
                                >
                                    Lihat Detail
                                </a>
                                {canModify && (
                                    <a
                                        href={route('inspection.ac.edit', inspection.uuid)}
                                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        role="menuitem"
                                    >
                                        Edit
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            );
        },
    },
];
