import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    role: role;
    user: User;
    login_as: login_as
}

export interface FlashProps {
    success?: string;
    error?: string;
    message?: string;
}

export interface PageProps extends Record<string, unknown> {
    auth: Auth;
    errors: Record<string, string>;
    flash: FlashProps;
    ziggy?: Config & { location: string };
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    roles?: string[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    permissions: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
