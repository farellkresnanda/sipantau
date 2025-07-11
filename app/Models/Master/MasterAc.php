<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class MasterAc extends Model
{
    protected $table = 'master_ac';

    protected $guarded = [];

    public function entitas()
    {
        return $this->hasMany(MasterEntitas::class, 'kode_entitas', 'kode_entitas');
    }

    public function plants()
    {
        return $this->hasMany(MasterPlant::class, 'kode_plant', 'kode_plant');
    }
}   
