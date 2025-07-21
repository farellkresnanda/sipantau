<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class InspectionFirstAidCondition extends Model {
    
    protected $table = 'inspection_first_aid_conditions';
    protected $fillable = ['name'];
}