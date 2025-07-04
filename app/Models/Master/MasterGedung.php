<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;
use App\Models\Master\MasterEntitas;
use App\Models\Master\MasterPlant;

class MasterGedung extends Model
{
    /**
     * Nama tabel terkait
     */
    protected $table = 'master_gedung';

    /**
     * Kolom-kolom yang dapat diisi (mass assignment)
     */
    protected $fillable = [
        'kode_entitas',
        'kode_plant',
        'nama_lokasi',
    ];

    /**
     * Relasi ke entitas (MasterEntitas)
     */
    public function entitasData()
    {
        return $this->belongsTo(MasterEntitas::class, 'kode_entitas', 'kode_entitas');
    }

    /**
     * Relasi ke plant (MasterPlant)
     */
    public function plantData()
    {
        return $this->belongsTo(MasterPlant::class, 'kode_plant', 'kode_plant');
    }
}
