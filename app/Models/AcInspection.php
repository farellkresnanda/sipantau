<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class AcInspection extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'ac_inspections';

    protected $fillable = [
        'uuid',
        'inspection_date',
        'car_auto_number', // Menggunakan car_auto_number
        'notes',
        'entity_id',
        'plant_id',
        'location_id',
        'approval_status_code',
        'created_by',
        'approved_by',
        'note_validator',
        'approved_at',
    ];

    protected $casts = [
        'inspection_date' => 'datetime',
        'approved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
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

    // --- Relationships ---

    public function entity()
    {
        return $this->belongsTo(Master\MasterEntity::class, 'entity_id');
    }

    public function plant()
    {
        return $this->belongsTo(Master\MasterPlant::class, 'plant_id');
    }

    public function location()
    {
        return $this->belongsTo(Master\MasterP3k::class, 'location_id');
    }

    public function approvalStatus()
    {
        return $this->belongsTo(ApprovalStatus::class, 'approval_status_code', 'code');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function items()
    {
        return $this->hasMany(AcInspectionItem::class, 'ac_inspection_id');
    }
}