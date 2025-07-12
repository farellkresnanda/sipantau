<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class MasterPlant extends Model
{
    protected $table = 'master_plant';

    protected $guarded = [];

    public function joinEntity()
    {
        return $this->hasOne(MasterEntity::class, 'entity_code', 'entity_code');
    }
}
