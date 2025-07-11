<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class MasterAc extends Model
{
    protected $table = 'master_ac';

    protected $guarded = [];

    /**
     * Relasi ke entitas (master_entitas)
     */
    public function entitasData()
    {
        return $this->belongsTo(MasterEntitas::class, 'kode_entitas', 'kode_entitas');
    }

    /**
     * Relasi ke plant (master_plant)
     */
    public function plantData()
    {
        return $this->belongsTo(MasterPlant::class, 'kode_plant', 'kode_plant');
    }
}
