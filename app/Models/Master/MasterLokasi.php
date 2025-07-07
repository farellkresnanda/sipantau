<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class MasterLokasi extends Model
{
    protected $table = 'master_lokasi';


    protected $guarded = [];

    /**
     * Relasi ke MasterEntitas berdasarkan entitas_kode
     */
    public function entitas()
    {
        return $this->hasMany(MasterEntitas::class, 'kode_entitas', 'entitas_kode');
    }

    /**
     * Relasi ke MasterPlant berdasarkan plant_kode
     */
    public function plants()
    {
        return $this->hasMany(MasterPlant::class, 'kode_plant', 'plant_kode');
    }
}
