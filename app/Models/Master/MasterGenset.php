<?php

// App\Models\Master\MasterGenset.php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class MasterGenset extends Model
{
    protected $guarded = [];

    public function entity()
    {
        return $this->belongsTo(MasterEntity::class, 'entity_code', 'entity_code');
    }

    public function plant()
    {
        return $this->belongsTo(MasterPlant::class, 'plant_code', 'plant_code');
    }
}
