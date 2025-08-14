<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class JsaDocument extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    // Auto-generate UUID on create
    protected static function booted(): void
    {
        static::creating(function (self $model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    // Relationships
    public function participants()
    {
        return $this->hasMany(JsaParticipant::class, 'jsa_document_id');
    }

    public function hazardItems()
    {
        return $this->hasMany(JsaHazardItem::class, 'jsa_document_id')->orderBy('item_order');
    }

    public function statusLogs()
    {
        return $this->hasMany(JsaStatusLog::class, 'jsa_document_id')->latest('changed_at');
    }
}
