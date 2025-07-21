<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FirstAidKit extends Model
{
    protected $table = 'first_aid_kits';

    protected $fillable = ['master_kit_id', 'location'];
}
