<?php

namespace App\Models;

use App\Models\Master\MasterApar;
use App\Models\Master\MasterEntity;
use App\Models\Master\MasterPlant;
use App\Models\Master\MasterAparCheckItem;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AparInspection extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    /**
     * Relasi ke item pemeriksaan (Segel, Hose, dll)
     */
    public function items()
    {
        return $this->hasMany(AparInspectionItem::class, 'apar_inspection_id');
    }

    /**
     * Relasi ke master APAR
     */
    public function apar()
    {
        return $this->belongsTo(MasterApar::class, 'apar_id');
    }

    /**
     * Relasi ke plant (lokasi fisik)
     */
    public function plant()
    {
        return $this->belongsTo(MasterPlant::class, 'plant_code', 'plant_code');
    }

    /**
     * Relasi ke entitas perusahaan
     */
    public function entity()
    {
        return $this->belongsTo(MasterEntity::class, 'entity_code', 'entity_code');
    }

    /**
     * Relasi ke user yang membuat inspeksi
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relasi ke item pemeriksaan APAR
     */
    public function approvalStatus()
    {
        return $this->belongsTo(ApprovalStatus::class, 'approval_status_code', 'code');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
