<?php

namespace App\Helpers;
class ConditionHelper
{
    /**
     * Kondisi baik dan tidak baik untuk inspeksi.
     *
     * @return string
     */
    public static function formatCondition($value) {
        return match ($value) {
            'baik' => 'Baik',
            'tidak_baik' => 'Tidak Baik',
            default => $value ?? ''
        };
    }
}
