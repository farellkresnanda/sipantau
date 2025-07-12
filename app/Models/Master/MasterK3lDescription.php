<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class MasterK3lDescription extends Model
{
    protected $guarded = [];

    // relasi belongsTo
    public function masterK3l()
    {
        return $this->belongsTo(MasterK3l::class, 'master_k3l_id');
    }
}
