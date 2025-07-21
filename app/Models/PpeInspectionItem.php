<?php

namespace App\Models;

use App\Models\Master\MasterApd;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PpeInspectionItem extends Model
{
    use SoftDeletes;

    protected $guarded = [];
    public function inspection()
    {
        return $this->belongsTo(PpeInspection::class);
    }

    public function ppeCheckItem()
    {
        return $this->belongsTo(MasterApd::class, 'ppe_check_item_id', 'id');
    }
}
