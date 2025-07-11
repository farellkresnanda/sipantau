<?php

namespace App\Models;

use App\Models\Master\MasterJenisKetidaksesuaian;
use App\Models\Master\MasterJenisKetidaksesuaianSub;
use Illuminate\Database\Eloquent\Model;

class Temuan extends Model
{
    protected $table = 'temuan';

    protected $guarded = [];

    public function jenisKetidaksesuaian()
    {
        return $this->belongsTo(MasterJenisKetidaksesuaian::class, 'jenis_ketidaksesuaian_id');
    }

    public function jenisKetidaksesuaianSub()
    {
        return $this->belongsTo(MasterJenisKetidaksesuaianSub::class, 'jenis_ketidaksesuaian_sub_id');
    }

    public function temuanStatus()
    {
        return $this->belongsTo(TemuanStatus::class, 'kode_temuan_status', 'kode');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

}
