<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InspectionCondition extends Model
{
    protected $table = 'inspection_first_aid_conditions';

    protected $fillable = ['name'];
}
