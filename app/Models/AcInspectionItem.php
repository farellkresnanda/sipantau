<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcInspectionItem extends Model
{
    use HasFactory;

    protected $table = 'ac_inspection_items';

    protected $fillable = [
        'ac_inspection_id',
        'master_ac_unit_id',    // Foreign key ke tabel master AC Anda
        'maintenance_status',   // String untuk status perawatan
        'condition_status',     // String untuk kondisi
        'notes',
    ];

    protected $casts = [
        'created_at' => 'timestamp', // Sesuai dengan tipe TIMESTAMP di DB
        'updated_at' => 'timestamp', // Sesuai dengan tipe TIMESTAMP di DB
    ];

    // --- Relationships ---

    /**
     * Get the AC Inspection header that owns the item.
     */
    public function acInspection()
    {
        return $this->belongsTo(AcInspection::class, 'ac_inspection_id');
    }

    /**
     * Get the master AC unit details associated with this item.
     * Penting: Pastikan Anda sudah membuat model Master\MasterAcUnit.php
     * dan menambahkan kolom 'id' ke tabel master AC Anda di database.
     */
    public function masterAcUnit()
    {
        // Ganti 'Master\MasterAcUnit::class' jika namespace atau nama model Anda berbeda
        // Ini mengacu pada model yang merepresentasikan tabel master AC Anda yang sudah ada
        return $this->belongsTo(Master\MasterAcUnit::class, 'master_ac_unit_id');
    }
}