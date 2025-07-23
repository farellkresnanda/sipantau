<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

    class FirstAidInspectionCondition extends Model {
    
    protected $table = 'first_aid_inspection_conditions';

    protected $fillable = ['name'];
}
