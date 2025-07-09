<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MasterJenisKetidakSesuaian extends Model
{
    protected $table = 'master_jenis_ketidaksesuaian';

    protected $guarded = [];

    public function jenisKetidaksesuaianSub(): HasMany
    {
        return $this->hasMany(MasterJenisKetidaksesuaianSub::class, 'jenis_ketidaksesuaian_id');
    }

}
