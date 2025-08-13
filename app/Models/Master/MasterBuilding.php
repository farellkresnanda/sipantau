<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class MasterBuilding extends Model
{
    protected $guarded = [];

    /**
     * Relasi ke entity (MasterEntity)
     */
    public function entity()
    {
        return $this->belongsTo(MasterEntity::class, 'entity_code', 'entity_code');
    }

    /**
     * Relasi ke plant (MasterPlant)
     */
    public function plant()
    {
        return $this->belongsTo(MasterPlant::class, 'plant_code', 'plant_code');
    }
}
