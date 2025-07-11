import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/' },
  { title: 'Master AC', href: '/master/ac' },
  { title: 'Import Master AC', href: '/master/ac/import' },
];

const formSchema = z.object({
  file: z.instanceof(File, { message: 'File is required' }),
});

export default function ImportMasterAc() {
  const { errors } = usePage().props as {
    errors: Record<string, string>;
  };

  const form = useForm<z.TypeOf<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([key, message]) => {
        form.setError(key as keyof typeof formSchema._type, {
          type: 'manual',
          message: message,
        });
      });
    }
  }, [errors, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData();
    formData.append('file', values.file);

    router.post(route('ac.action_import'), formData, {
      forceFormData: true,
      onSuccess: () => {
        form.reset();
      },
      onError: (errors) => {
        Object.entries(errors).forEach(([key, message]) => {
          form.setError(key as keyof typeof formSchema._type, {
            type: 'manual',
            message: message as string,
          });
        });
      },
    });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Import Master AC" />
      <div className="space-y-6 p-4">
        <SectionHeader
          title="Import Data Master AC"
          subtitle="Unggah file Excel (.xlsx, .csv) berisi data AC untuk diimport ke sistem."
        />
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                encType="multipart/form-data"
              >
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload File Excel</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".xlsx,.csv"
                          onChange={(e) => field.onChange(e.target.files?.[0])}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Uploading...' : 'Upload'}
                  </Button>
                  <Link href={route('ac.index')} className="text-muted-foreground text-sm hover:underline">
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
