<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class K3ProgramItem extends Model
{
    protected $table = 'k3_program_items';
    protected $guarded = ['id'];

    protected $casts = [
        'plan_flags'   => 'array',
        'actual_flags' => 'array',
    ];

    protected $appends = ['plan_percent', 'actual_percent'];

    // Relations
    public function section()
    {
        return $this->belongsTo(K3ProgramSection::class, 'section_id');
    }

    /* --------- Flags decoder (tetap) --------- */
    public function getPlanFlagsAttribute($value): array
    {
        $flags = $this->decodeFlexible($value, $this->attributes['plan_json'] ?? null);
        return $this->normalizeFlags($flags);
    }

    public function getActualFlagsAttribute($value): array
    {
        $flags = $this->decodeFlexible($value, $this->attributes['actual_json'] ?? null);
        return $this->normalizeFlags($flags);
    }

    private function decodeFlexible($flagsCol, $jsonCol): array
    {
        if (is_array($flagsCol)) return array_values($flagsCol);
        if (is_string($flagsCol) && $flagsCol !== '') {
            $arr = json_decode($flagsCol, true);
            if (is_array($arr)) return array_values($arr);
        }

        $obj = null;
        if (is_array($jsonCol)) {
            $obj = $jsonCol;
        } elseif (is_string($jsonCol) && $jsonCol !== '') {
            $first = json_decode($jsonCol, true);
            if (is_array($first)) $obj = $first;
            elseif (is_string($first)) {
                $second = json_decode($first, true);
                if (is_array($second)) $obj = $second;
            }
        }

        if (is_array($obj) && isset($obj['flags']) && is_array($obj['flags'])) {
            return array_values($obj['flags']);
        }
        return [];
    }

    private function normalizeFlags(?array $flags): array
    {
        $flags = $flags ?? [];
        $out   = [];
        for ($i = 0; $i < 12; $i++) {
            $v = $flags[$i] ?? false;
            $b = filter_var($v, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            $out[$i] = $b ?? in_array($v, [1,'1','true','TRUE'], true);
        }
        return $out;
    }

    private function countTrue(array $flags): int
    {
        $c = 0; foreach ($flags as $b) $c += $b ? 1 : 0; return $c;
    }

    /* --------- Persentase (PATEN) ---------
       - plan_percent:
           monthly → planTrue/12
           once    → min(planTrue,1)/1
           custom  → min(planTrue,target_units)/target_units
       - actual_percent:
           monthly → actualTrue / max(1, planTrue)
           once    → min(actualTrue,1)/1
           custom  → min(actualTrue,target_units)/target_units
    --------------------------------------- */

    public function getPlanPercentAttribute(): float
    {
        $plan = $this->countTrue($this->plan_flags);

        switch ($this->unit_type) {
            case 'once':
                $den = 1;                  $num = $plan > 0 ? 1 : 0;         break;
            case 'custom':
                $den = max(1, (int) ($this->target_units ?? 0));
                $num = min($plan, $den);                                     break;
            default: // monthly
                $den = 12;               $num = min($plan, 12);              break;
        }
        return $den > 0 ? round(($num / $den) * 100, 2) : 0.0;
    }

    public function getActualPercentAttribute(): float
    {
        $plan   = $this->countTrue($this->plan_flags);
        $actual = $this->countTrue($this->actual_flags);

        switch ($this->unit_type) {
            case 'once':
                $den = 1;                  $num = $actual > 0 ? 1 : 0;       break;
            case 'custom':
                $den = max(1, (int) ($this->target_units ?? 0));
                $num = min($actual, $den);                                   break;
            default: // monthly → RELATIF KE PLAN
                $den = max(1, $plan);     $num = min($actual, $den);         break;
        }
        return $den > 0 ? round(($num / $den) * 100, 2) : 0.0;
    }
}
