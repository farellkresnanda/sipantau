import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { showToast } from '@/components/ui/toast';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { flash } = usePage().props as {
        flash?: { success?: string; error?: string; message?: string };
    };

    useEffect(() => {
        if (flash?.success) {
            showToast({ type: 'success', message: flash.success });
        }
        if (flash?.error) {
            showToast({ type: 'error', message: flash.error });
        }
        if (flash?.message) {
            showToast({ message: flash.message });
        }
    }, [flash]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
    );
};
