<?php

namespace App\Models;

use App\Models\Master\MasterJenisKetidakSesuaian;
use App\Models\Master\MasterStatusApproval;
use App\Models\Master\MasterStatusTemuan;
use Illuminate\Database\Eloquent\Model;

class K3Temuan extends Model
{
    protected $table = 'k3_temuan';

    protected $guarded = [];

    public function jenisKetidaksesuaian()
    {
        return $this->belongsTo(MasterJenisKetidaksesuaian::class, 'jenis_ketidaksesuaian_id');
    }

    public function statusApproval()
    {
        return $this->belongsTo(MasterStatusApproval::class, 'kode_status_approval', 'kode');
    }

    public function statusTemuan()
    {
        return $this->belongsTo(MasterStatusTemuan::class, 'kode_status_temuan', 'kode');
    }



    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

}
