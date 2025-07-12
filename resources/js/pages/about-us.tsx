import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'About Us',
        href: '/about-us',
    },
];

export default function AboutUs() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="About Us" />

            <div className="w-full p-5">
                <h1 className="mb-6 text-2xl font-bold">About Us</h1>

                <div className="space-y-6">
                    <p className="text-sm">
                        iSafety KF (Integrated Safety System of Kimia Farma) adalah platform digital yang dirancang untuk mendukung budaya Keselamatan
                        dan Kesehatan Kerja (K3) di seluruh lingkungan kerja PT Kimia Farma Tbk.
                    </p>

                    <div>
                        <p className="mb-4 text-sm">Melalui sistem yang terintegrasi dan user-friendly, iSafety KF memungkinkan karyawan untuk:</p>
                        <ul className="ml-4 list-none space-y-2 text-sm">
                            <li className="flex items-center">
                                <span className="mr-2">✅</span>
                                <p className="text-sm">Melaporkan finding K3 secara real-time</p>
                            </li>
                            <li className="flex items-center">
                                <span className="mr-2">✅</span>
                                Mengakses inspeksi, izin kerja, dan dokumen keselamatan
                            </li>
                            <li className="flex items-center">
                                <span className="mr-2">✅</span>
                                Memantau target dan capaian K3
                            </li>
                            <li className="flex items-center">
                                <span className="mr-2">✅</span>
                                Mendorong kolaborasi lintas unit demi lingkungan kerja yang lebih aman
                            </li>
                        </ul>
                    </div>

                    <p className="text-sm">
                        Dengan semangat transformasi digital BUMN dan komitmen terhadap zero accident, iSafety KF hadir sebagai solusi modern yang
                        menjaga keselamatan sekaligus mendukung produktivitas kerja.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
