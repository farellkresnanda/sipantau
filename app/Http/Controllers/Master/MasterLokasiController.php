<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterEntity;
use App\Models\Master\MasterLocation;
use App\Models\Master\MasterPlant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterLokasiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $locationList = MasterLocation::latest()->with(['entity', 'plants'])->get();

        return Inertia::render('master/location/page', compact('locationList'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $entityList = MasterEntity::latest()->get(['id', 'name', 'entity_code']);
        $plantList = MasterPlant::latest()->get(['id', 'name', 'entity_code', 'plant_code']);

        return Inertia::render('master/location/create', compact('entityList', 'plantList'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'entity_code' => 'required|exists:master_entities,entity_code',
            'plant_code' => 'required|exists:master_plants,plant_code',
        ]);

        MasterLocation::create($request->all());

        activity()->log('User created a new master location');

        return redirect()->route('location.index')
            ->with('success', 'Master location created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $location = MasterLocation::findOrFail($id);
        $entityList = MasterEntity::latest()->get(['id', 'name', 'entity_code']);
        $plantList = MasterPlant::latest()->get(['id', 'name', 'entity_code', 'plant_code']);

        return Inertia::render('master/location/edit', compact('location', 'entityList', 'plantList'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'entity_code' => 'required|exists:master_entities,entity_code',
            'plant_code' => 'required|exists:master_plants,plant_code',
        ]);

        $location = MasterLocation::findOrFail($id);
        $location->update($request->only('name', 'entity_code', 'plant_code'));

        activity()->log('User updated a master location');

        return redirect()->route('location.index')->with('success', 'Master location updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterLocation $masterLokasi, $id)
    {
        $masterLokasi = $masterLokasi->findOrFail($id);
        $masterLokasi->delete();

        activity()->log('User deleted a master location');

        return redirect()->route('location.index')
            ->with('success', 'Master location deleted successfully.');
    }
}
