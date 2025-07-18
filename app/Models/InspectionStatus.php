<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class InspectionStatus extends Model {
    protected $table = 'inspection_statuses';
    protected $fillable = ['name'];
}