<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class MasterGenset extends Model
{
    protected $table = 'master_genset';

    protected $fillable = [
        'jenis_mesin',
        'merk',
        'model',
        'negara_thn_pembuatan',
        'pabrik_pembuat',
        'no_seri',
        'kapasitas',
    ];

    // Jika tidak menggunakan timestamps (created_at & updated_at), bisa diset false
    // public $timestamps = false;
}
