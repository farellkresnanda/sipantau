<?php

namespace App\Models;

use App\Models\Master\MasterEntity;
use App\Models\Master\MasterLocation;
use App\Models\Master\MasterPlant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PpeInspection extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    public function location()
    {
        return $this->belongsTo(MasterLocation::class);
    }

    public function items()
    {
        return $this->hasMany(PpeInspectionItem::class);
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
}
