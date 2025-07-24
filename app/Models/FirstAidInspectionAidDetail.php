<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FirstAidInspectionAidDetail extends Model
{
    use HasFactory;

    protected $table = 'inspections_first_aid_details';

    protected $fillable = [
        'inspection_id',
        'item_id',
        'quantity_found',
        'condition_id',
    ];

    public function item()
    {
        return $this->belongsTo(InspectionItem::class, 'item_id');
    }

    public function condition()
    {
        return $this->belongsTo(InspectionCondition::class, 'condition_id');
    }
}
