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
            'entity_code' => $row[0],
            'plant_code' => $row[1],
            'no_p3k' => $row[2],
            'room_code' => $row[3],
            'location' => $row[4],
            'type' => $row[5],
            'inventory_code' => $row[6],
        ]);
    }
}
