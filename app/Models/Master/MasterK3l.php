<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class MasterK3l extends Model
{
    protected $guarded = [];

    // relasi: satu master_k3l punya banyak description
    public function description()
    {
        return $this->hasMany(MasterK3lDescription::class, 'master_k3l_id');
    }
}
