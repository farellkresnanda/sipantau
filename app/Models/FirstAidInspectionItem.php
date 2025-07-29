<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FirstAidInspectionItem extends Model
{
    use HasFactory;

    protected $table = 'first_aid_inspection_items';

    protected $fillable = [
        'inspection_id',
        'first_aid_check_item_id',
        'quantity_found',
        'condition_id',
        'note', // <-- DIUBAH DARI 'noted' MENJADI 'note'
        'expired_at',
    ];

    protected $casts = [
        'expired_at' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'note' => 'string',
    ];

    public function inspection() { return $this->belongsTo(FirstAidInspection::class, 'inspection_id'); }
    public function item() { return $this->belongsTo(\App\Models\Master\MasterP3kItem::class, 'first_aid_check_item_id'); }
    public function condition() { return $this->belongsTo(FirstAidInspectionCondition::class, 'condition_id'); }
}