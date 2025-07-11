<?php

namespace App\Imports;

use App\Models\Master\MasterAc;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class AparImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        return new MasterAc([
            'kode_entitas'     => $row['kode_entitas'],
            'kode_plant'       => $row['kode_plant'],
            'ruang'            => $row['ruang'],
            'kode_inventaris'  => $row['kode_inventaris'],
            'merk'             => $row['merk'],
        ]);
    }
}
