<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class MasterP3kItem extends Model
{
    protected $table = 'master_p3k_items';

    protected $fillable = [
        'item_name',
        'standard_quantity',
    ];
}
