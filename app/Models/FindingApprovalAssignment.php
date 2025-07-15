<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FindingApprovalAssignment extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    public function findingApprovalHistory()
    {
        return $this->belongsTo(FindingApprovalHistory::class, 'finding_approval_history_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
