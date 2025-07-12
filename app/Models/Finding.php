<?php

namespace App\Models;

use App\Models\Master\MasterNonconformitySubType;
use App\Models\Master\MasterNonconformityType;
use Illuminate\Database\Eloquent\Model;

class Finding extends Model
{

    protected $guarded = [];

    public function nonconformityType()
    {
        return $this->belongsTo(MasterNonconformityType::class, 'nonconformity_type_id');
    }

    public function nonconformitySubType()
    {
        return $this->belongsTo(MasterNonconformitySubType::class, 'nonconformity_subtype_id');
    }

    public function findingStatus()
    {
        return $this->belongsTo(FindingStatus::class, 'finding_status_code', 'code');
    }

    public function findingApprovalHistories()
    {
        return $this->hasMany(FindingApprovalHistory::class, 'finding_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
