<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Master\MasterEntity;
use App\Models\Master\MasterPlant;
use Illuminate\Database\Eloquent\SoftDeletes;

class ModuleManager extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'module_id',
        'module_name',
        'role_name',
        'user_id',
        'entity_code',
        'plant_code',
        'is_active',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function modules()
    {
        return $this->hasMany(Module::class, 'id', 'module_id');
    }

    public function entity()
    {
        return $this->belongsTo(MasterEntity::class, 'entity_code', 'entity_code');
    }

    public function plant()
    {
        return $this->belongsTo(MasterPlant::class, 'plant_code', 'plant_code');
    }
}
