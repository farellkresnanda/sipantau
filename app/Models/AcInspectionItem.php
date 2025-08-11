<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcInspectionItem extends Model
{
    use HasFactory;

    protected $table = 'ac_inspection_items';

    /**
     * [FIX] Sesuaikan nama kolom agar cocok dengan database ('master_ac_unit_id').
     */
    protected $fillable = [
        'ac_inspection_id',
        'master_ac_unit_id',
        'maintenance_status',
        'condition_status',
        'notes',
    ];

    // --- Relationships ---

    public function inspectionHeader()
    {
        return $this->belongsTo(AcInspection::class, 'ac_inspection_id');
    }

    /**
     * [FIX] Sesuaikan foreign key agar cocok dengan database ('master_ac_unit_id').
     */
    public function masterAc()
    {
        return $this->belongsTo(\App\Models\Master\MasterAc::class, 'master_ac_unit_id');
    }
}