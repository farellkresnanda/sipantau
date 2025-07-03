<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class MasterK3l extends Model
{
    protected $table = 'master_k3l';

    protected $guarded = [];


    // relasi: satu master_k3l punya banyak deskripsi
    public function deskripsi()
    {
        return $this->hasMany(MasterK3lDeskripsi::class, 'master_k3l_id');
    }
}
