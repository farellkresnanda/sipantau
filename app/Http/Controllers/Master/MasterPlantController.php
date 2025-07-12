<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterEntity;
use App\Models\Master\MasterPlant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterPlantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $plantList = MasterPlant::with('joinEntity')->latest()->get();

        return inertia('master/plant/page', compact('plantList'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $entityList = MasterEntity::latest()->get();

        return inertia('master/plant/create', compact('entityList'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'plant_code' => 'required|unique:master_plant,plant_code',
            'entity_code' => 'required',
            'name' => 'required',
        ]);

        MasterPlant::create($request->all());

        activity()->log('User created a new master Plant');

        return redirect()->route('plant.index')
            ->with('success', 'Master plant created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $plant = MasterPlant::findOrFail($id);
        $entityList = MasterEntity::latest()->get();

        return Inertia::render('master/plant/edit', [
            'plant' => $plant,
            'entityList' => $entityList,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MasterPlant $masterPlant)
    {
        $request->validate([
            'plant_code' => 'required|string|max:255|unique:master_plant,plant_code,'.$request->id,
            'entity_code' => 'required|string|max:255',
            'name' => 'required|string|max:255',
        ]);

        $masterPlant = $masterPlant->findOrFail($request->id);
        $masterPlant->update([
            'plant_code' => $request->plant_code,
            'entity_code' => $request->entity_code,
            'name' => $request->name,
        ]);

        activity()->log('User updated a master plant');

        return redirect()->route('plant.index')->with('success', 'Master plant updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterPlant $masterPlant, $id)
    {
        $masterPlant = $masterPlant->findOrFail($id);
        $masterPlant->delete();

        return redirect()->route('plant.index')->with('success', 'Data Plant berhasil dihapus.');
    }
}
