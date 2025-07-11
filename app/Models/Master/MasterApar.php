<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class MasterApar extends Model
{
    protected $table = 'master_apar';

    protected $guarded = [];

     public function entitas()
    {
        return $this->hasMany(MasterEntitas::class, 'kode_entitas', 'kode_entitas');
    }

    /**
     * Relasi ke MasterPlant berdasarkan plant_kode
     */
    public function plants()
    {
        return $this->hasMany(MasterPlant::class, 'kode_plant', 'kode_plant');
    }
}
