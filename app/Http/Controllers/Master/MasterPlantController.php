<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterEntitas;
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
        $plantList = MasterPlant::with('joinEntitas')->latest()->get();
        return inertia('master/plant/page', compact('plantList'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $entitasList=MasterEntitas::latest()->get();
        return inertia('master/plant/create', compact('entitasList'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'kode_plant' => 'required|unique:master_plant,kode_plant',
            'nama' => 'required',
            'kode_entitas' => 'required',
        ]);

        MasterPlant::create($request->all());


        activity()->log('User created a new master Plant');

        return redirect()->route('plant.index')
            ->with('success', 'Master plant created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(MasterPlant $masterPlant)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
{
    $plant = MasterPlant::findOrFail($id);
    $entitasList = MasterEntitas::latest()->get();

    return Inertia::render('master/plant/edit', [
        'plant' => $plant,
        'entitasList' => $entitasList,
    ]);
}


    /**
     * Update the specified resource in storage.
     */
   public function update(Request $request, MasterPlant $masterPlant)
{
    $request->validate([
        'kode_plant' => 'required|string|max:255|unique:master_plant,kode_plant,' . $request->id,
        'nama' => 'required|string|max:255',
        'kode_entitas' => 'required|string|max:255',
    ]);

    $masterPlant = $masterPlant->findOrFail($request->id);
    $masterPlant->update([
        'kode_plant' => $request->kode_plant,
        'nama' => $request->nama,
        'kode_entitas' => $request->kode_entitas,
    ]);

    activity()->log('User updated a master plant');

    return redirect()->route('plant.index')->with('success', 'Master plant updated successfully.');
}



    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterPlant $masterPlant,$id)
    {
         $masterPlant = $masterPlant->findOrFail($id);
        $masterPlant->delete();

        return redirect()->route('plant.index')->with('success', 'Data Plant berhasil dihapus.');
    }
}
