<?php

namespace App\Exports;

use App\Models\Master\MasterAc;
;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class AparExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        // Data yang diekspor
        return MasterAc::select(
            'kode_entitas',
            'kode_plant',     
            'ruang',        
            'kode_inventaris',     
            'merk')->get();
    }

    public function headings(): array
    {
        // Ubah nama heading sesuai kebutuhan
        return [
            'kode_entitas',
            'kode_plant',     
            'ruang',        
            'kode_inventaris',     
            'merk'
        ];
    }
}
