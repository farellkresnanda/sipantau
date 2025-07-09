<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class MasterLaporanUjiRiksaPeralatan extends Model
{
    protected $table = 'master_laporan_uji_riksa_peralatan';

    protected $fillable = [
        'nama_peralatan',
        'referensi',
    ];

    public $timestamps = true;
}
