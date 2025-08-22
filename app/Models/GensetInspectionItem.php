<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class GensetInspectionItem extends Model
{
    use HasFactory;

    protected $table = 'genset_inspection_items';
    protected $guarded = ['id'];

    public $timestamps = true;

    // Relasi ke header inspeksi
    public function inspection()
    {
        return $this->belongsTo(GensetInspection::class, 'inspection_id');
    }

    // Relasi ke standar pekerjaan genset
    public function workStandard()
    {
        return $this->belongsTo(\App\Models\Master\MasterGensetWorkStandard::class, 'work_standard_id');
    }
}
