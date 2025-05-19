<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function page()
    {
        $activityLogs = ActivityLog::with('user')->latest()->get();
        return inertia('settings/activity-log', [
            'activityLogs' => $activityLogs,
        ]);
    }
}
