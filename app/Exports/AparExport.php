<?php

namespace App\Exports;

use App\Models\Master\MasterApar;
;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class AparExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        // Data yang diekspor
        return MasterApar::select(
            'kode_entitas',
            'kode_plant',     
            'no_apar',        
            'kode_ruang',     
            'lokasi',        
            'jenis',        
            'apar',        
            'kode_inventaris')->get();
    }

    public function headings(): array
    {
        // Ubah nama heading sesuai kebutuhan
        return [
            'kode_entitas',
            'kode_plant',     
            'no_apar',        
            'kode_ruang',     
            'lokasi',        
            'jenis',        
            'type',        
            'kode_inventaris'
        ];
    }
}
