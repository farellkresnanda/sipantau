<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasterNonconformitySubType extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'nonconformity_type_id'];

    public function nonconformityType()
    {
        return $this->belongsTo(MasterNonconformityType::class, 'nonconformity_type_id');
    }
}
