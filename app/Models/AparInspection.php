<?php

namespace App\Models;

use App\Models\Master\MasterApar;
use App\Models\Master\MasterEntity;
use App\Models\Master\MasterPlant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AparInspection extends Model
{
    use SoftDeletes;
    protected $table = 'apar_inspections';

    protected $guarded = [];

    public function items()
    {
        return $this->hasMany(AparInspectionItem::class, 'apar_inspection_id');
    }
    public function apar()
    {
        return $this->hasOne(MasterApar::class, 'id', 'apar_id');
    }

    public function plant()
    {
        return $this->belongsTo(MasterPlant::class, 'plant_code', 'plant_code');
    }

    public function entity()
    {
        return $this->belongsTo(MasterEntity::class, 'entity_code', 'entity_code');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
