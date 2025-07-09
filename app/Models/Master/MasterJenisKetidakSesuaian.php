<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MasterJenisKetidaksesuaian extends Model
{
    use HasFactory;

    protected $table = 'master_jenis_ketidaksesuaian';

    protected $fillable = ['nama'];

    public function subJenis()
    {
        return $this->hasMany(MasterJenisKetidaksesuaianSub::class, 'jenis_ketidaksesuaian_id');
    }
}
