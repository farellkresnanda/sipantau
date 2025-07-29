<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FindingApprovalHistory extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    public function finding()
    {
        return $this->belongsTo(Finding::class, 'finding_id');
    }

    public function findingApprovalStage()
    {
        return $this->belongsTo(FindingApprovalStage::class, 'finding_approval_stage_id');
    }

    public function findingApprovalAssignment()
    {
        return $this->hasMany(FindingApprovalAssignment::class);
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
