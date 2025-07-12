<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MasterNonconformityType extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function nonconformitySubType(): HasMany
    {
        return $this->hasMany(MasterNonconformitySubType::class, 'nonconformity_type_id');
    }
}
