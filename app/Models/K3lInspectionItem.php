<?php

namespace App\Models;

use App\Models\Master\MasterK3l;
use App\Models\Master\MasterK3lDescription;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class K3lInspectionItem extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    public function inspection()
    {
        return $this->belongsTo(K3lInspection::class, 'k3l_inspection_id');
    }

    public function description()
    {
        return $this->belongsTo(MasterK3lDescription::class, 'master_k3l_description_id');
    }

    public function masterK3lDescription()
    {
        return $this->belongsTo(MasterK3lDescription::class, 'master_k3l_description_id');
    }

    public function masterK3l()
    {
        return $this->belongsTo(MasterK3l::class, 'master_k3l_id');
    }


}
