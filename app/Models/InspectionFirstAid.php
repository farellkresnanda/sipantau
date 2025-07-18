<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InspectionFirstAid extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'inspection_first_aids';

    protected $fillable = [
        'entity_code',
        'plant_code',
        'location',
        'inventory_code',
        'inspector_id',
        'inspection_date',
        'inspection_status_id',
        'has_findings',
        'validator_id',
        'validated_at',
        'notes',
    ];

    public function details()
    {
        return $this->hasMany(InspectionDetail::class, 'inspection_id');
    }

    public function status()
    {
        return $this->belongsTo(InspectionStatus::class, 'inspection_status_id');
    }

    public function inspector()
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    public function validator()
    {
        return $this->belongsTo(User::class, 'validator_id');
    }

    public function entity()
    {
        return $this->belongsTo(MasterEntity::class, 'entity_code', 'code');
    }

    public function plant()
    {
        return $this->belongsTo(MasterPlant::class, 'plant_code', 'code');
    }
}
