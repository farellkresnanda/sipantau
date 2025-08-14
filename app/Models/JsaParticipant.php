<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JsaParticipant extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    public function document()
    {
        return $this->belongsTo(JsaDocument::class, 'jsa_document_id');
    }
}
