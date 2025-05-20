// components/app-toast.tsx
import { toast } from 'sonner';

type AppToastProps = {
    type?: 'success' | 'error' | 'info';
    title?: string;
    message: string;
};

export function showToast({ type = 'info', title, message }: AppToastProps) {
    const base = {
        description: message,
        action: {
            label: 'Close',
            onClick: () => {},
        },
    };

    switch (type) {
        case 'success':
            toast.success(title ?? 'Success', base);
            break;
        case 'error':
            toast.error(title ?? 'Error', base);
            break;
        default:
            toast(title ?? 'Notification', base);
    }
}
