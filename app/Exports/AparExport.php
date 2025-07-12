<?php

namespace App\Exports;

use App\Models\Master\MasterApar;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Events\AfterSheet;

class AparExport implements FromCollection, ShouldAutoSize, WithEvents, WithHeadings
{
    public function collection()
    {
        return MasterApar::select(
            'entity_code',
            'plant_code',
            'apar_no',
            'room_code',
            'location',
            'type',
            'apar',
            'inventory_code'
        )->get();
    }

    public function headings(): array
    {
        return [
            'Kode Entitas',
            'Kode Plant',
            'Nomor APAR/APAB',
            'Kode Ruang',
            'Lokasi',
            'Jenis',
            'Type',
            'Kode Inventaris',
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                $rowCount = $sheet->getHighestRow();
                $columnCount = $sheet->getHighestColumn();

                // Range data
                $cellRange = "A1:{$columnCount}{$rowCount}";

                // Terapkan border
                $sheet->getStyle($cellRange)->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                            'color' => ['argb' => '000000'],
                        ],
                    ],
                ]);

                // Terapkan rata tengah ke semua sel
                $sheet->getStyle($cellRange)->getAlignment()->setHorizontal('center');
                $sheet->getStyle($cellRange)->getAlignment()->setVertical('center');

                // Style khusus untuk heading (baris pertama)
                $sheet->getStyle('A1:'.$columnCount.'1')->applyFromArray([
                    'fill' => [
                        'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                        'startColor' => ['argb' => 'D9D9D9'], // abu-abu terang
                    ],
                    'font' => [
                        'bold' => true,
                        'color' => ['argb' => '000000'],
                    ],
                ]);
            },
        ];
    }
}
