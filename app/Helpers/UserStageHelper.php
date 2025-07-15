<?php

namespace App\Helpers;

use App\Models\Finding;
use App\Models\FindingApprovalStage;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class UserStageHelper
{
    /**
     * Ambil data user yang berhak untuk stage tertentu pada finding
     *
     * @param  FindingApprovalStage  $stage
     * @param  Finding  $finding
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getUsersForStage(FindingApprovalStage $stage, Finding $finding)
    {
        $users = User::whereHas('roles', function ($q) use ($stage) {
            $q->where('name', $stage->authorized_role);
        })
            ->when($stage->authorized_role === 'Technician', function ($q) use ($finding) {
                $plantCode = in_array($finding->plant_code, ['1000', '1001']) ? '1000' : $finding->plant_code;
                return $q->where('entity_code', $finding->entity_code)
                    ->where(function ($query) use ($plantCode) {
                        if ($plantCode === '1000') {
                            $query->whereIn('plant_code', ['1000', '1001']);
                        } else {
                            $query->where('plant_code', $plantCode);
                        }
                    });
            })
            ->when($stage->authorized_role === 'Admin', function ($q) use ($finding) {
                $plantCode = in_array($finding->plant_code, ['1000', '1001']) ? '1000' : $finding->plant_code;
                return $q->where('entity_code', $finding->entity_code)
                    ->where(function ($query) use ($plantCode) {
                        if ($plantCode === '1000') {
                            $query->whereIn('plant_code', ['1000', '1001']);
                        } else {
                            $query->where('plant_code', $plantCode);
                        }
                    });
            })
            ->when($stage->authorized_role === 'Validator', function ($q) use ($finding) {
                $plantCode = in_array($finding->plant_code, ['1000', '1001']) ? '1000' : $finding->plant_code;
                return $q->where('entity_code', $finding->entity_code)
                    ->where(function ($query) use ($plantCode) {
                        if ($plantCode === '1000') {
                            $query->whereIn('plant_code', ['1000', '1001']);
                        } else {
                            $query->where('plant_code', $plantCode);
                        }
                    });
            })
            // SuperAdmin: tidak difilter, ambil semua user dengan role SuperAdmin
            ->get();
        return $users;
    }
}
