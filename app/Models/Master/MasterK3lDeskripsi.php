<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class MasterK3lDeskripsi extends Model
{
    protected $table = 'master_k3l_deskripsi';

    protected $guarded = [];


    // relasi belongsTo
    public function masterK3l()
    {
        return $this->belongsTo(MasterK3l::class, 'master_k3l_id');
    }
}
