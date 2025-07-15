<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class MasterLocation extends Model
{
    protected $guarded = [];

    /**
     * Relasi ke MasterEntity berdasarkan entity_code
     */
    public function entity()
    {
        return $this->hasMany(MasterEntity::class, 'entity_code', 'entity_code');
    }

    /**
     * Relasi ke MasterPlant berdasarkan plant_code
     */
    public function plants()
    {
        return $this->hasMany(MasterPlant::class, 'plant_code', 'plant_code');
    }
}
