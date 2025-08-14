<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BuildingInspectionItem extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    public function inspection()
    {
        return $this->belongsTo(BuildingInspection::class, 'building_inspection_id');
    }
}
