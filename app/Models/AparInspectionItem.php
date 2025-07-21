<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AparInspectionItem extends Model
{
    // use SoftDeletes;
    protected $guarded = [];

    public function aparInspection()
    {
        return $this->belongsTo(AparInspection::class);
    }

    public function masterAparCheckItem()
    {
        return $this->belongsTo(Master\MasterAparCheckItem::class, 'apar_check_item_id');
    }
}
