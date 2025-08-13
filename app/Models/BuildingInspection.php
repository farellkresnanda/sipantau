<?php

namespace App\Models;

use App\Models\Master\MasterBuilding;
use App\Models\Master\MasterEntity;
use App\Models\Master\MasterPlant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BuildingInspection extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    public function items()
    {
        return $this->hasMany(BuildingInspectionItem::class, 'building_inspection_id');
    }

    public function building()
    {
        return $this->belongsTo(MasterBuilding::class, 'building_id', 'id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    public function entity()
    {
        return $this->belongsTo(MasterEntity::class, 'entity_code', 'entity_code');
    }

    public function plant()
    {
        return $this->belongsTo(MasterPlant::class, 'plant_code', 'plant_code');
    }

    public function approvalStatus()
    {
        return $this->belongsTo(ApprovalStatus::class, 'approval_status_code', 'code');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by', 'id');
    }
}
