import SectionHeader from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import AppLayout from "@/layouts/app-layout";
import type { BreadcrumbItem } from "@/types";
import { Head, Link, usePage } from "@inertiajs/react";
import { columns, type K3ProgramRow } from "./columns";
import { CheckCircle2, CircleAlert, CircleDashed, Plus } from "lucide-react";

type Paginator<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  next_page_url: string | null;
  prev_page_url: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Home", href: "/" },
  { title: "Program Kerja K3", href: "/analysis/k3-program" },
];

export default function PageK3Program() {
  const { props } = usePage<{ programs: Paginator<K3ProgramRow>; canCreate: boolean }>();
  const { programs, canCreate } = props;

  const isEmpty = !programs?.data?.length;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Program Kerja K3" />
      <div className="p-4 space-y-4">
        {/* Header + tombol create */}
        <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader
            title="Program Kerja K3"
            subtitle="Admin mengisi target & capaian → Validator approve/reject → role lain hanya melihat."
          />
          {canCreate && (
            <Button asChild className="w-full sm:w-auto">
              <Link href="/analysis/k3-program/create">
                <Plus className="mr-2 h-4 w-4" />
                Buat Program
              </Link>
            </Button>
          )}
        </div>

        {/* Info status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Status & Akses</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="space-y-1">
              <li className="flex items-center gap-2">
                <CircleDashed className="h-4 w-4" />
                <span>
                  <span className="font-medium text-foreground">SOP (Open)</span> – Admin dapat mengedit.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  <span className="font-medium text-foreground">SAP (Approved)</span> – terkunci & dapat dilihat semua.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CircleAlert className="h-4 w-4" />
                <span>
                  <span className="font-medium text-foreground">SRE (Rejected)</span> – terkunci; perbaiki lalu kirim ulang.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Tabel */}
        <div className="w-full">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="text-base font-medium text-foreground">Belum ada Program K3</div>
              <p className="max-w-md text-sm text-muted-foreground">
                Mulai dengan membuat sasaran/target tahunan, lalu lengkapi capaian per bulan agar dapat diverifikasi.
              </p>
              {canCreate && (
                <Button asChild>
                  <Link href="/analysis/k3-program/create">
                    <Plus className="mr-2 h-4 w-4" /> Buat Program
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={programs.data}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
