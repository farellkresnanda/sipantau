import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import SectionHeader from "@/components/section-header";
import {Card, CardContent} from "@/components/ui/card";
import {Label} from "@/components/ui/label";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Users',
        href: '/users',
    },
    {
        title: 'Lihat Detail User',
        href: '#',
    },
];

export default function ShowUser({ user }: { user: any }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail User" />
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <SectionHeader title="Detail User" subtitle="Berikut adalah detail informasi pengguna." />
                </div>

                <Card className="w-full">
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Nama Pegawai</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.name}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">NPP</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.npp}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">NPP SAP</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.npp_sap}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Email</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.email}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Kode Jabatan</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.position_code}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Nama Jabatan</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.position_name}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Level Jabatan</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.position_level}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Nama Level Jabatan</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.position_level_name}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Kode Grup Entitas</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.entity_group_code}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Kode Entitas</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.entity_code}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Nama Entitas</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.entity_name}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Nama Alias Entitas</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.entity_alias_name}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Kode Direktorat</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.directorate_code}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Nama Direktorat</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.directorate_name}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Kode Divisi</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.division_code}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Nama Divisi</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.division_name}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Kode Unit</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.unit_code}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Nama Unit</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.unit_name}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Kode Sub Unit</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.sub_unit_code}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Nama Sub Unit</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.sub_unit_name}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Kode Departemen</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.department_code}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Nama Departemen</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.department_name}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Kode Manager Cabang</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.plant_code}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Nama Manager Cabang</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{user.plant_name}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Dibuat Pada</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">
                                    {new Date(user.created_at).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-1 text-sm">Diperbarui Pada</Label>
                                <p className="mt-1 text-sm whitespace-pre-wrap">
                                    {new Date(user.updated_at).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
