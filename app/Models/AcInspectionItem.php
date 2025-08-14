<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcInspectionItem extends Model
{
    use HasFactory;

    protected $table = 'ac_inspection_items';

    /**
     * [REVISI] Menghapus foreign key dari $fillable karena di-handle oleh relasi.
     */
    protected $fillable = [
        'master_ac_unit_id',
        'maintenance_status',
        'condition_status',
        'notes',
    ];

    // --- Relationships ---

    /**
     * [REVISI] Menggunakan nama foreign key yang benar ('inspection_id').
     */
    public function inspectionHeader()
    {
        return $this->belongsTo(AcInspection::class, 'inspection_id');
    }

    /**
     * [REVISI] Menggunakan nama foreign key yang benar ('master_ac_unit_id').
     */
    public function masterAc()
    {
        return $this->belongsTo(\App\Models\Master\MasterAc::class, 'master_ac_unit_id');
    }
}
