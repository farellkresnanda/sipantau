<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class MasterEntity extends Model
{
    protected $guarded = [];

    /**
     * Relasi ke MasterBuilding berdasarkan entity_code
     */
    public function plants()
    {
        return $this->hasMany(MasterPlant::class, 'entity_code', 'entity_code');
    }
}
