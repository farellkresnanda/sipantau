<?php

namespace App\Imports;

use App\Models\Master\MasterAc;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithStartRow;

class AcImport implements ToModel, WithStartRow
{
    public function startRow(): int
    {
        return 2; // Melewati baris pertama (biasanya heading)
    }

    public function model(array $row)
    {
        // Jika jumlah kolom kurang dari 5 atau baris kosong, lewati
        if (count($row) < 5 || blank($row[0])) {
            return null;
        }

        return new MasterAc([
            'entity_code' => $row[0],
            'plant_code' => $row[1],
            'room' => $row[2],
            'inventory_code' => $row[3],
            'merk' => $row[4],
        ]);
    }
}
