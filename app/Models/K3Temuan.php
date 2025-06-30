<?php

namespace App\Models;

use App\Models\Master\MasterJenisKetidakSesuaian;
use Illuminate\Database\Eloquent\Model;

class K3Temuan extends Model
{
    protected $table = 'k3_temuan';

    protected $guarded = [];

    public function jenisKetidaksesuaian()
    {
        return $this->belongsTo(MasterJenisKetidaksesuaian::class, 'jenis_ketidaksesuaian_id');
    }
}
