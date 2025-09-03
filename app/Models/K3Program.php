<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class K3Program extends Model
{
    use SoftDeletes;

    protected $table = 'k3_programs';
    protected $guarded = ['id'];

    // ikutkan di JSON (boleh dicabut kalau tidak perlu)
    protected $appends = ['total_performance'];

    protected $casts = [
        'approved_at' => 'datetime',
        'created_at'  => 'datetime',
        'updated_at'  => 'datetime',
        'deleted_at'  => 'datetime',
    ];

    /** Pakai UUID di route binding */
    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    /** Auto-generate UUID saat create */
    protected static function booted(): void
    {
        static::creating(function (self $m) {
            if (empty($m->uuid)) {
                $m->uuid = (string) Str::uuid();
            }
        });
    }

    /* =======================
     * Relations (existing)
     * ======================= */

    public function progress()
    {
        return $this->hasMany(\App\Models\K3ProgramProgress::class, 'program_id');
    }

    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    public function validator()
    {
        return $this->belongsTo(\App\Models\User::class, 'approved_by');
    }

    public function entity()
    {
        return $this->belongsTo(\App\Models\Master\MasterEntity::class, 'entity_code', 'entity_code');
    }

    public function plant()
    {
        return $this->belongsTo(\App\Models\Master\MasterPlant::class, 'plant_code', 'plant_code');
    }

    /* =======================
     * Relations (section & item)
     * ======================= */

    public function sections()
    {
        return $this->hasMany(\App\Models\K3ProgramSection::class, 'program_id');
    }

    public function items()
    {
        // items.section_id → sections.id → sections.program_id → programs.id
        return $this->hasManyThrough(
            \App\Models\K3ProgramItem::class,
            \App\Models\K3ProgramSection::class,
            'program_id', // FK di sections → programs.id
            'section_id', // FK di items → sections.id
            'id',         // PK di programs
            'id'          // PK di sections
        );
    }

    /* =======================
     * Scopes
     * ======================= */

    public function scopeYear($q, int $year)
    {
        return $q->where('year', $year);
    }

    public function scopeForEntityPlant($q, string $entityCode, string $plantCode)
    {
        return $q->where('entity_code', $entityCode)
                 ->where('plant_code', $plantCode);
    }

    public function scopeWithBasics($q)
    {
        return $q->with(['entity:name,entity_code', 'plant:name,plant_code']);
    }

    /* =======================
     * Helpers
     * ======================= */

    /**
     * Ringkasan performa rata-rata (paten 12-bulan):
     * - monthly  → pembagi 12 SELALU
     * - once     → pembagi 1
     * - custom   → pembagi target_units (min 1)
     * Sumber data dari actual_flags / actual_json (fallback).
     */
    public function getTotalPerformanceAttribute(): float
    {
        // Ambil kolom yang MEMANG ada saja
        $items = $this->items()
            ->select(
                'k3_program_items.section_id',
                'k3_program_items.actual_flags',
                'k3_program_items.unit_type',
                'k3_program_items.monthly_denominator_mode',
                'k3_program_items.target_units'
            )
            ->get();

        if ($items->isEmpty()) return 0.0;

        $elapsed = now()->month;

        $avg = $items->avg(function ($i) use ($elapsed) {
            $flags = is_array($i->actual_flags)
                ? $i->actual_flags
                : (array) json_decode($i->actual_flags ?? '[]', true);

            $trueCount = collect($flags)->filter()->count();

            if ($i->unit_type === 'monthly') {
                $denom = ($i->monthly_denominator_mode === 'elapsed')
                    ? max(1, min(12, $elapsed))
                    : 12;
            } elseif ($i->unit_type === 'custom') {
                $denom = max(1, (int) ($i->target_units ?? 1));
            } else { // once
                $denom = 1;
            }

            $percent = $denom > 0 ? ($trueCount / $denom) * 100 : 0;
            return max(0, min(100, $percent));
        });

        return round((float) $avg, 2);
    }

    /* =======================
     * Internal utilities
     * ======================= */

    /**
     * Decode flags dari:
     * - actual_flags: JSON array / array PHP
     * - actual_json:  JSON {"flags":[...]} / string JSON kedalaman-2
     * Lalu normalisasi ke 12 boolean.
     */
    private function decodeFlagsFlexible($flagsCol, $jsonCol): array
    {
        // 1) coba actual_flags
        $flags = [];
        if (is_array($flagsCol)) {
            $flags = array_values($flagsCol);
        } elseif (is_string($flagsCol) && $flagsCol !== '') {
            $tmp = json_decode($flagsCol, true);
            if (is_array($tmp)) $flags = array_values($tmp);
        }

        // 2) fallback ke actual_json.flags
        if (empty($flags)) {
            $obj = null;
            if (is_array($jsonCol)) {
                $obj = $jsonCol;
            } elseif (is_string($jsonCol) && $jsonCol !== '') {
                $first = json_decode($jsonCol, true);
                if (is_array($first)) {
                    $obj = $first;
                } elseif (is_string($first)) {
                    $second = json_decode($first, true);
                    if (is_array($second)) $obj = $second;
                }
            }
            if (is_array($obj) && isset($obj['flags']) && is_array($obj['flags'])) {
                $flags = array_values($obj['flags']);
            }
        }

        // normalisasi 12 boolean
        $out = [];
        for ($i = 0; $i < 12; $i++) {
            $out[] = (bool) ($flags[$i] ?? false);
        }
        return $out;
    }
}
