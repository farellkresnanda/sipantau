<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class GensetInspection extends Model
{
    use HasFactory;

    protected $table = 'genset_inspections';
    protected $guarded = ['id'];

    public $timestamps = true;

    // Relasi ke Master Genset
    public function genset()
    {
        return $this->belongsTo(\App\Models\Master\MasterGenset::class, 'genset_id');
    }

    // Relasi ke detail inspeksi
    public function items()
    {
        return $this->hasMany(GensetInspectionItem::class, 'inspection_id');
    }

    // Relasi ke entity (jika ada modelnya)
    public function entity()
    {
        return $this->belongsTo(\App\Models\Master\MasterEntity::class, 'entity_code', 'entity_code');
    }

    // Relasi ke plant (jika ada modelnya)
    public function plant()
    {
        return $this->belongsTo(\App\Models\Master\MasterPlant::class, 'plant_code', 'plant_code');
    }

    // User yang membuat inspeksi
    public function createdBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    // User yang memverifikasi inspeksi
    public function approvedBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'approved_by');
    }
}
