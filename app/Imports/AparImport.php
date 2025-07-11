<?php

namespace App\Imports;

use App\Models\Master\MasterApar;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class AparImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        return new MasterApar([
            'kode_entitas'     => $row['kode_entitas'],
            'kode_plant'       => $row['kode_plant'],
            'no_apar'          => $row['no_apar'],
            'kode_ruang'       => $row['kode_ruang'],
            'lokasi'           => $row['lokasi'],
            'jenis'           => $row['jenis'],
            'apar'           => $row['type'],
            'kode_inventaris'  => $row['kode_inventaris'],
        ]);
    }
}
