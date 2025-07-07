<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class MasterPlant extends Model
{
    protected $table = 'master_plant';

    protected $guarded = [];


    public function joinEntitas()
    {
        return $this->hasOne(MasterEntitas::class, 'kode_entitas', 'kode_entitas');
    }
}
