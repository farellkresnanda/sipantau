<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class MasterEntitas extends Model
{
    protected $table = 'master_entitas';

    protected $guarded = [];

    // App\Models\Master\MasterEntitas.php

public function plants()
{
    return $this->hasMany(MasterPlant::class, 'kode_entitas', 'kode_entitas');
}

}
