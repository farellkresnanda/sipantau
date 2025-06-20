import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'K3 Info',
        href: '/reports/k3info',
    },
    {
        title: 'Edit K3 Info',
        href: '#',
    },
];

const formSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters').max(100, 'Title must not exceed 100 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    image_path: z.instanceof(File).or(z.string().min(1, 'Image is required')),
});

interface K3InfoProps {
    k3Info: {
        id: number;
        title: string;
        description: string;
        image_path: string;
    };
}

export default function EditK3Info({ k3Info }: K3InfoProps) {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: k3Info.title,
            description: k3Info.description,
            image_path: k3Info.image_path,
        },
    });

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            Object.entries(errors).forEach(([key, message]) => {
                form.setError(key as keyof typeof formSchema._type, {
                    type: 'manual',
                    message,
                });
            });
        }
    }, [errors, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('title', values.title);
        formData.append('description', values.description);
        if (values.image_path instanceof File) {
            formData.append('image_path', values.image_path);
        }

        router.post(route('k3info.update', k3Info.id), formData, {
            preserveState: true,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit K3 Info" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <SectionHeader title="Edit K3 Info" subtitle="Update the information below to modify the K3 info." />
                </div>

                <Card className="w-full">
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter title" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Enter description" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="image_path"
                                        render={({ field: { value, onChange, ...field } }) => (
                                            <FormItem>
                                                <FormLabel>Image</FormLabel>
                                                <FormControl>
                                                    <div className="space-y-4">
                                                        {typeof value === 'string' && (
                                                            <img src={`/storage/${value}`} alt="Current" className="h-auto w-48 rounded-lg" />
                                                        )}
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    onChange(file);
                                                                }
                                                            }}
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? 'Updating...' : 'Update K3 Info'}
                                    </Button>
                                    <Link href={route('k3info.index')} className="text-muted-foreground text-sm hover:underline">
                                        Cancel
                                    </Link>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
