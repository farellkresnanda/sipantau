<?php

namespace App\Imports;

use App\Models\Master\MasterApar;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithStartRow;

class AparImport implements ToModel, WithStartRow
{
    public function startRow(): int
    {
        return 2; // Mulai dari baris kedua, jadi baris pertama dilewati
    }

    public function model(array $row)
    {
        return new MasterApar([
            'entity_code' => $row[0],
            'plant_code' => $row[1],
            'apar_no' => $row[2],
            'room_code' => $row[3],
            'location' => $row[4],
            'type' => $row[5],
            'apar' => $row[6],
            'inventory_code' => $row[7],
        ]);
    }
}
