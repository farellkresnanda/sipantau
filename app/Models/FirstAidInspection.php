<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class FirstAidInspection extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'first_aid_inspections';

    protected $fillable = [
        'uuid',
        'entity_code',
        'plant_code',
        'location_id',
        'car_auto_number',
        'inspection_date',
        'project_name',
        'approval_status_code',
        'created_by',
        'approved_by',
        'note_validator',
        'approved_at',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->uuid) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    // === RELATIONSHIPS ===

    public function entity()
    {
        return $this->belongsTo(\App\Models\Master\MasterEntity::class, 'entity_code', 'entity_code');
    }

    public function plant()
    {
        return $this->belongsTo(\App\Models\Master\MasterPlant::class, 'plant_code', 'plant_code');
    }

    public function location()
    {
        return $this->belongsTo(\App\Models\Master\MasterP3k::class, 'location_id');
    }

    public function approvalStatus()
    {
        return $this->belongsTo(\App\Models\ApprovalStatus::class, 'approval_status_code', 'code');
    }

    public function createdBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'approved_by');
    }

    public function items()
    {
        return $this->hasMany(\App\Models\FirstAidInspectionItem::class, 'inspection_id');
    }

    public function details()
    {
        return $this->hasMany(\App\Models\FirstAidInspectionAidDetail::class, 'inspection_id');
    }

}