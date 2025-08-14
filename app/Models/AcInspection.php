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

    /**
     * Atribut yang bisa diisi secara massal.
     */
    protected $fillable = [
        'uuid',
        'inspection_date',
        'car_auto_number',
        'entity_code',
        'plant_code',
        'location_id',
        'approval_status_code',
        'created_by',
        'approved_by',
        'note_validator',
        'approved_at',
    ];

    /**
     * Tipe data casting untuk atribut.
     */
    protected $casts = [
        'inspection_date' => 'datetime',
        'approved_at' => 'datetime',
    ];

    /**
     * Boot method untuk model.
     */
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
        return $this->belongsTo(\App\Models\Master\MasterEntity::class, 'entity_code', 'entity_code');
    }

    public function plant()
    {
        return $this->belongsTo(\App\Models\Master\MasterPlant::class, 'plant_code', 'plant_code');
    }

    public function location()
    {
        return $this->belongsTo(\App\Models\Master\MasterAc::class, 'location_id');
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
        return $this->hasMany(AcInspectionItem::class, 'inspection_id');
    }
}
