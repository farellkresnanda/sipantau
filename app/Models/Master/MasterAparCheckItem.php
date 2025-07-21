<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MasterAparCheckItem extends Model
{
    use SoftDeletes;
    protected $guarded = [];
}
