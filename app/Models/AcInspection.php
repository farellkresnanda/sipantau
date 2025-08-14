<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

// Menggunakan 'use' untuk merapikan kode dan dependensi
use App\Models\Master\MasterEntity;
use App\Models\Master\MasterPlant;
use App\Models\Master\MasterAc;
use App\Models\ApprovalStatus;
use App\Models\User;
use App\Models\AcInspectionItem;

class AcInspection extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Nama tabel yang terhubung dengan model ini.
     *
     * @var string
     */
    protected $table = 'ac_inspections';
    
    /**
     * Atribut yang dikecualikan dari mass assignment.
     * Menggunakan array kosong berarti semua atribut boleh diisi.
     *
     * @var array
     */
    protected $guarded = [];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'inspection_date' => 'datetime',
        'approved_at' => 'datetime',
    ];

    /**
     * Boot method untuk model.
     * Secara otomatis membuat UUID saat record baru dibuat.
     */
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (!$model->uuid) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Mengatur agar Route-Model Binding menggunakan 'uuid' bukan 'id'.
     */
    public function getRouteKeyName()
    {
        return 'uuid';
    }

    // --- Relationships ---
    
    public function entity()
    {
        return $this->belongsTo(MasterEntity::class, 'entity_code', 'entity_code');
    }

    public function plant()
    {
        return $this->belongsTo(MasterPlant::class, 'plant_code', 'plant_code');
    }

    public function location()
    {
        return $this->belongsTo(MasterAc::class, 'location_id');
    }
    
    /**
     * Relasi ke ApprovalStatus.
     * Ini adalah kunci agar status dapat ditampilkan dengan benar.
     */
    public function approvalStatus()
    {
        return $this->belongsTo(ApprovalStatus::class, 'approval_status_code', 'code')
                    ->withDefault([
                        'name' => 'Status Tidak Ditemukan',
                        'badge_class' => 'secondary'
                    ]);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
    
    public function items()
    {
        return $this->hasMany(AcInspectionItem::class, 'inspection_id');
    }
}
