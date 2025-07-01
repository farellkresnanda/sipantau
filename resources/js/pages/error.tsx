import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { AlertTriangle, Ban, Home, ServerCrash } from 'lucide-react';

type ErrorProps = {
    status: number;
    message?: string;
};

export default function Error({ status, message }: ErrorProps) {
    const getErrorInfo = (status: number) => {
        switch (status) {
            case 404:
                return {
                    title: 'Halaman Tidak Ditemukan',
                    description: 'Maaf, halaman yang Anda cari tidak tersedia. Silakan periksa kembali URL yang dimasukkan.',
                    icon: <Ban className="h-10 w-10 text-red-500" />,
                };
            case 403:
                return {
                    title: 'Akses Ditolak',
                    description: 'Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator.',
                    icon: <AlertTriangle className="h-10 w-10 text-yellow-500" />,
                };
            default:
                return {
                    title: 'Terjadi Kesalahan',
                    description: 'Terjadi kesalahan tak terduga pada sistem. Silakan coba beberapa saat lagi.',
                    icon: <ServerCrash className="h-10 w-10 text-gray-500" />,
                };
        }
    };

    const { title, description, icon } = getErrorInfo(status);

    return (
        <div className="bg-muted flex min-h-screen items-center justify-center p-4">
            <Head title={`${status} - ${title}`} />

            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="flex flex-col items-center gap-2 text-center">
                    {icon}
                    <CardTitle className={cn('text-2xl font-bold')}>
                        {status} - {title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-muted-foreground">{description || message}</p>
                    <Button asChild>
                        <a href="/">
                            <Home className="inline-block h-4 w-4" /> Kembali ke Home
                        </a>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
