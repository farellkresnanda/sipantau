<?php

namespace App\Models;

use App\Models\Master\MasterEntity;
use App\Models\Master\MasterK3l;
use App\Models\Master\MasterK3lDescription;
use App\Models\Master\MasterLocation;
use App\Models\Master\MasterPlant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class K3lInspection extends Model
{
    use SoftDeletes;

    protected $guarded = [];
    protected $primaryKey = 'id';

    public function items()
    {
        return $this->hasMany(K3lInspectionItem::class, 'k3l_inspection_id', 'id');
    }

    public static function getK3lItems()
    {
        return MasterK3l::with('description')->get();
    }

    public function masterK3l()
    {
        return $this->belongsTo(MasterK3l::class, 'master_k3l_id');
    }

    public function masterK3lDescription()
    {
        return $this->belongsTo(MasterK3lDescription::class, 'master_k3l_description_id');
    }


    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function location()
    {
        return $this->belongsTo(MasterLocation::class, 'location_id');
    }

    public function approvalStatus()
    {
        return $this->belongsTo(ApprovalStatus::class, 'approval_status_code', 'code');
    }

    public function plant()
    {
        return $this->belongsTo(MasterPlant::class, 'plant_code', 'plant_code');
    }

    public function entity()
    {
        return $this->belongsTo(MasterEntity::class, 'entity_code', 'entity_code');
    }
}
