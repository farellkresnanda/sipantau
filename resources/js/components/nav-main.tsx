import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface NavItemWithChildren extends NavItem {
    children?: NavItem[];
}

export function NavMain({ items = [], children }: { items: NavItemWithChildren[]; children?: React.ReactNode }) {
    const page = usePage();
    const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

    const toggleCollapse = (title: string) => {
        setOpenItems((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        {item.children ? (
                            <Collapsible.Root open={openItems[item.title]} onOpenChange={() => toggleCollapse(item.title)}>
                                <Collapsible.Trigger asChild>
                                    <SidebarMenuButton className="w-full justify-between" isActive={item.href === page.url}>
                                        <div className="flex items-center gap-2">
                                            {item.icon && <item.icon className="h-4 w-4" />}
                                            <span>{item.title}</span>
                                        </div>
                                        <ChevronDown className={`h-4 w-4 transition-transform ${openItems[item.title] ? 'rotate-180' : ''}`} />
                                    </SidebarMenuButton>
                                </Collapsible.Trigger>
                                <Collapsible.Content>
                                    <SidebarMenu className="ml-4">
                                        {item.children.map((child) => (
                                            <SidebarMenuItem key={child.title}>
                                                <SidebarMenuButton asChild isActive={child.href === page.url} tooltip={{ children: child.title }}>
                                                    <Link href={child.href} prefetch>
                                                        {child.icon && <child.icon className="h-4 w-4" />}
                                                        <span>{child.title}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </Collapsible.Content>
                            </Collapsible.Root>
                        ) : (
                            <SidebarMenuButton asChild isActive={item.href === page.url} tooltip={{ children: item.title }}>
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon className="h-4 w-4" />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        )}
                    </SidebarMenuItem>
                ))}
                {children}
            </SidebarMenu>
        </SidebarGroup>
    );
}
