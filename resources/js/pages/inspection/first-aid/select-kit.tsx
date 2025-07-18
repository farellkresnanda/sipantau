'use client';

import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';

type Kit = {
  id: number;
  location: string;
  inventory_code: string;
  entity_code: string;
  plant_code: string;
  entity_data: { name: string };
  plant_data: { name: string };
};

export default function SelectKitPage() {
  const { kits } = usePage().props as unknown as { kits: Kit[] };

  const [search, setSearch] = useState('');

  const filteredKits = kits.filter((kit) => {
    const term = search.toLowerCase();
    return (
      kit.entity_data?.name.toLowerCase().includes(term) ||
      kit.plant_data?.name.toLowerCase().includes(term) ||
      kit.location.toLowerCase().includes(term)
    );
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Inspeksi P3K', href: route('inspection.first-aid.index') },
    { title: 'Pilih Kit', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Pilih Kit P3K" />
      <div className="p-4 space-y-6">
        <SectionHeader
          title="Pilih Kotak P3K"
          subtitle="Cari berdasarkan entitas, plant, atau lokasi untuk memulai inspeksi."
        />

        {/* Universal Search */}
        <div>
          <input
            type="text"
            placeholder="Cari berdasarkan entitas, plant, atau lokasi..."
            className="w-full p-2 border border-gray-300 rounded-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* List of Kits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredKits.length > 0 ? (
            filteredKits.map((kit) => (
              <Card key={kit.id}>
                <CardContent className="p-4 space-y-2">
                  <div>
                    <strong>Lokasi:</strong> {kit.location}
                  </div>
                  <div>
                    <strong>Kode Inventaris:</strong> {kit.inventory_code}
                  </div>
                  <div>
                    <strong>Entitas:</strong> {kit.entity_data?.name} ({kit.entity_code})
                  </div>
                  <div>
                    <strong>Plant:</strong> {kit.plant_data?.name} ({kit.plant_code})
                  </div>
                  <div className="pt-2">
                    <Button asChild className="w-full">
                      <Link href={route('inspection.first-aid.create', kit.id)}>
                        Mulai Inspeksi
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">
              Tidak ada kit ditemukan.
            </p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
