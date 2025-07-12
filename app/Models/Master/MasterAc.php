<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class MasterAc extends Model
{
    protected $guarded = [];

    public function entity()
    {
        return $this->hasMany(MasterEntity::class, 'entity_code', 'entity_code');
    }

    public function plants()
    {
        return $this->hasMany(MasterPlant::class, 'plant_code', 'plant_code');
    }
}
