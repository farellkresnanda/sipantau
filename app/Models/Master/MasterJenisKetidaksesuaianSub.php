<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MasterJenisKetidaksesuaianSub extends Model
{
    use HasFactory;

    protected $table = 'master_jenis_ketidaksesuaian_sub';

    protected $fillable = ['nama', 'jenis_ketidaksesuaian_id'];

    public function jenis()
    {
        return $this->belongsTo(MasterJenisKetidaksesuaian::class, 'jenis_ketidaksesuaian_id');
    }
}
