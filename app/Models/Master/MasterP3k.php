<?php

namespace App\Models\Master;

use App\Models\Master\MasterEntitas;
use App\Models\Master\MasterPlant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MasterP3k extends Model
{
    // use HasFactory;

    protected $table = 'master_p3k';

    protected $guarded = [];

    /**
     * Get the entity associated with the P3K master.
     * Mengubah nama relasi untuk menghindari konflik dengan kolom tabel 'entitas'.
     */
    public function entitasData() // <-- NAMA FUNGSI RELASI BARU
    {
        return $this->belongsTo(MasterEntitas::class, 'kode_entitas', 'kode_entitas');
    }

    /**
     * Get the plant associated with the P3K master.
     * Mengubah nama relasi untuk menghindari konflik dengan kolom tabel 'plant'.
     */
    public function plantData() // <-- NAMA FUNGSI RELASI BARU
    {
        return $this->belongsTo(MasterPlant::class, 'kode_plant', 'kode_plant');
    }
}