<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterBuildingWorkStandard;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterBuildingWorkStandardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $masterBuildingWorkStandards = MasterBuildingWorkStandard::latest()->get();

        return Inertia::render('master/building-work-standard/page', compact('masterBuildingWorkStandards'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('master/building-work-standard/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'period' => 'required|string|max:255',
        ]);

        MasterBuildingWorkStandard::create($request->all());

        activity()->log('User created a new master standar kerja building');

        return redirect()->route('building-work-standard.index')
            ->with('success', 'Master standar kerja building created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MasterBuildingWorkStandard $masterBuildingWorkStandard, $id)
    {
        $masterBuildingWorkStandard = $masterBuildingWorkStandard->findOrFail($id);

        return Inertia::render('master/building-work-standard/edit', compact('masterBuildingWorkStandard'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MasterBuildingWorkStandard $masterBuildingWorkStandard, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'period' => 'required|string|max:255',
        ]);

        $masterBuildingWorkStandard = $masterBuildingWorkStandard->findOrFail($id);
        $masterBuildingWorkStandard->update($request->all());

        activity()->log('User updated a master standar kerja building');

        return redirect()->route('building-work-standard.index')
            ->with('success', 'Master standar kerja building updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterBuildingWorkStandard $masterBuildingWorkStandard, $id)
    {
        $masterBuildingWorkStandard = $masterBuildingWorkStandard->findOrFail($id);
        $masterBuildingWorkStandard->delete();

        activity()->log('User deleted a master standar kerja building');

        return redirect()->route('building-work-standard.index')
            ->with('success', 'Master standar kerja building deleted successfully.');
    }
}
