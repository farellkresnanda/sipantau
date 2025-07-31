<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AparInspectionItem extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    /**
     * Relasi ke apar_inspections (induk pemeriksaan)
     */
    public function aparInspection()
    {
        return $this->belongsTo(AparInspection::class, 'apar_inspection_id');
    }

    /**
     * Relasi ke master_apar_check_items (e.g. Segel, Hose, dsb)
     */
    public function checkItem()
    {
        return $this->belongsTo(\App\Models\Master\MasterAparCheckItem::class, 'apar_check_item_id');
    }
}
