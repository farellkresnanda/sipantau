import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip} from "recharts"
import { DollarSign, Users, CreditCard, Activity } from "lucide-react"
import AppLayout from "@/layouts/app-layout";
import { Head, usePage } from '@inertiajs/react';
import {BreadcrumbItem} from "@/types";
import { useEffect } from 'react';
import { showToast } from '@/components/ui/toast';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/home',
    },
];

const data = [
    { name: "Jan", total: 1800 },
    { name: "Feb", total: 2000 },
    { name: "Mar", total: 3000 },
    { name: "Apr", total: 3200 },
    { name: "May", total: 5800 },
    { name: "Jun", total: 2900 },
    { name: "Jul", total: 3100 },
    { name: "Aug", total: 5600 },
    { name: "Sep", total: 4900 },
    { name: "Oct", total: 1200 },
    { name: "Nov", total: 2700 },
    { name: "Dec", total: 1700 },
]

const finding = [
    {
        name: 'Fajar Rizky',
        email: 'fajar.rizky@kimiafarma.co.id',
        finding: 'Kebocoran Gas',
        created_at: '2024-01-20 09:30:00',
    },
    {
        name: 'Siti Aminah',
        email: 'siti.aminah@kimiafarma.co.id',
        finding: 'Alat Safety Rusak',
        created_at: '2024-01-19 14:15:00',
    },
    {
        name: 'Budi Santoso',
        email: 'budi.santoso@kimiafarma.co.id',
        finding: 'Pencahayaan Kurang',
        created_at: '2024-01-18 11:45:00',
    },
    {
        name: 'Dewi Putri',
        email: 'dewi.putri@kimiafarma.co.id',
        finding: 'Lantai Licin',
        created_at: '2024-01-17 16:20:00',
    },
    {
        name: 'Ahmad Rahman',
        email: 'ahmad.rahman@kimiafarma.co.id',
        finding: 'APD Tidak Lengkap',
        created_at: '2024-01-16 10:00:00',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home" />
            <div className="flex flex-col gap-4 p-4">
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Temuan</CardTitle>
                            <DollarSign className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">349</div>
                            <p className="text-muted-foreground text-xs">+20.1% s.d YTD</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Inspeksi</CardTitle>
                            <Users className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+255</div>
                            <p className="text-muted-foreground text-xs">+34% s.d YTD</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total User</CardTitle>
                            <CreditCard className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+345</div>
                            <p className="text-muted-foreground text-xs">+19% s.d YTD</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Aktif User</CardTitle>
                            <Activity className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+102</div>
                            <p className="text-muted-foreground text-xs">+39 s.d bulan terakhir</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Overview Temuan</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data}>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                                    <YAxis stroke="#888888" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '5px', height:'50px', fontSize: '11px' }}
                                        labelStyle={{ color: '#9ca3af' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="total" fill="oklch(0.795 0.184 86.047)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Temuan Terbaru</CardTitle>
                            <p className="text-muted-foreground text-sm">Temuan terbaru yang dilaporkan oleh user</p>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            {finding.map((item, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/micah/svg?seed=${item.name}`} />
                                        <AvatarFallback>{item.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-1 items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <p className="text-sm leading-none font-medium">{item.name}</p>
                                            <p className="text-muted-foreground text-sm">{item.finding}</p>
                                        </div>
                                        <div className="text-muted-foreground ml-auto text-right text-sm whitespace-nowrap">
                                            {new Date(item.created_at)
                                                .toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                })
                                                .split('/')
                                                .join('-')}
                                            <div className="text-xs">
                                                {new Date(item.created_at).toLocaleTimeString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}{' '}
                                                WIB
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
