<?php

namespace App\Imports;

use App\Models\Master\MasterP3k;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithStartRow;

class P3kImport implements ToModel, WithStartRow
{
    public function startRow(): int
    {
        return 2; // Melewati baris pertama (biasanya heading)
    }

    public function model(array $row)
    {
        return new MasterP3k([
            'kode_entitas'     => $row[0],
            'kode_plant'       => $row[1],
            'no_p3k'           => $row[2],
            'kode_ruang'       => $row[3],
            'lokasi'           => $row[4],
            'jenis'            => $row[5],
            'kode_inventaris'  => $row[6],
        ]);
    }
}
