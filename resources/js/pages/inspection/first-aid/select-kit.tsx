'use client';

import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    const s = search.toLowerCase();
    return (
      kit.location.toLowerCase().includes(s) ||
      kit.entity_data?.name?.toLowerCase().includes(s) ||
      kit.plant_data?.name?.toLowerCase().includes(s)
    );
  });

  return (
    <AppLayout>
      <Head title="Pilih Kit P3K" />
      <div className="p-4 space-y-6">
        <SectionHeader
          title="Pilih Kotak P3K"
          subtitle="Cari berdasarkan lokasi, entitas, atau plant untuk memulai inspeksi."
        />

        <div className="max-w-md">
          <Input
            placeholder="Cari lokasi, entitas, atau plant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredKits.map((kit) => (
            <Card key={kit.id} className="text-sm hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <h3 className="font-semibold text-base text-primary">
                    {kit.location}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    Inventaris: <span className="font-medium">{kit.inventory_code}</span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Entitas: <span className="font-medium">{kit.entity_data?.name ?? kit.entity_code}</span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Plant: <span className="font-medium">{kit.plant_data?.name ?? kit.plant_code}</span>
                  </p>
                </div>
                <Button asChild className="w-full text-xs py-2 mt-2">
                  <Link href={route('inspection.first-aid.create', kit.id)}>
                    Mulai Inspeksi
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredKits.length === 0 && (
          <div className="text-center text-muted-foreground text-sm">
            Tidak ada kit yang cocok dengan pencarian.
          </div>
        )}
      </div>
    </AppLayout>
  );
}
