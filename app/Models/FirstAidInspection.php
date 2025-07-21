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
        'car_auto_number',
        'inspection_date',
        'project_name',
        'approval_status_code',
    ];

    // Auto generate UUID on create
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->uuid = (string) Str::uuid();
        });
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
