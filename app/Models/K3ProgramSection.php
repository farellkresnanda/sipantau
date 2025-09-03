<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class K3ProgramSection extends Model
{
    protected $table = 'k3_program_sections';
    protected $guarded = ['id'];

    protected $casts = [
        'target_pct' => 'integer',
    ];

    // Relasi
    public function program()
    {
        return $this->belongsTo(K3Program::class, 'program_id');
    }

    public function items()
    {
        return $this->hasMany(\App\Models\K3ProgramItem::class, 'section_id')
            ->orderBy('order_no')
            ->select([
                'id', 'section_id', 'title', 'pic',
                'unit_type', 'target_units', 'monthly_denominator_mode',
                'plan_flags', 'actual_flags', 'order_no'
            ]);
    }


    // ========= Agregat per section =========

    // Rata-rata plan_percent (paten 12-bulan, mengikuti accessor di Item)
    public function getPlanPercentAttribute(): float
    {
        $items = $this->items;
        if ($items->isEmpty()) return 0.0;

        return round($items->avg(fn ($i) => $i->plan_percent), 2);
    }

    // Rata-rata actual_percent
    public function getActualPercentAttribute(): float
    {
        $items = $this->items;
        if ($items->isEmpty()) return 0.0;

        return round($items->avg(fn ($i) => $i->actual_percent), 2);
    }
}
