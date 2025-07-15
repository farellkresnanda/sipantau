<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class MasterConsequence extends Model
{
    protected $fillable = [
        'name',
        'consequence',
        'human_effect',
        'company_effect',
        'environment_effect',
    ];
}
