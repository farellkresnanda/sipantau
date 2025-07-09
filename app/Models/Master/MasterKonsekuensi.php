<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class MasterKonsekuensi extends Model
{
    protected $table = 'master_konsekuensi';

    protected $fillable = [
        'nama',
        'konsekuensi',
    ];
}