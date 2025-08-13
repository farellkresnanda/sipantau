<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class MasterP3k extends Model
{
    protected $guarded = [];
    protected $table = 'master_p3ks';


    public function entity() //
    {
        return $this->belongsTo(MasterEntity::class, 'entity_code', 'entity_code');
    }

    /**
     * Get the plant associated with the P3K master.
     * Mengubah name relasi untuk menghindari konflik dengan kolom tabel 'plant'.
     */
    public function plant() //
    {
        return $this->belongsTo(MasterPlant::class, 'plant_code', 'plant_code');
    }
}
