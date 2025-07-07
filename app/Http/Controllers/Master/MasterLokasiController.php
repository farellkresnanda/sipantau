<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterEntitas;
use App\Models\Master\MasterLokasi;
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
        $lokasiList = MasterLokasi::latest()->with(['entitas', 'plants'])->get();

        return Inertia::render('master/lokasi/page', compact('lokasiList'));
    }
    /**
     * Show the form for creating a new resource.
     */

    public function create()
    {
        $entitasList = MasterEntitas::latest()->get(['id', 'nama', 'kode_entitas']);
        $plantList = MasterPlant::latest()->get(['id', 'nama', 'kode_entitas', 'kode_plant']);
        return Inertia::render('master/lokasi/create', compact('entitasList', 'plantList'));
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'entitas_kode' => 'required|exists:master_entitas,kode_entitas',
            'plant_kode' => 'required|exists:master_plant,kode_plant',
        ]);

        MasterLokasi::create($request->all());

        activity()->log('User created a new master lokasi');

        return redirect()->route('lokasi.index')
            ->with('success', 'Master lokasi created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(MasterLokasi $masterLokasi)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $lokasi = MasterLokasi::findOrFail($id);
        $entitasList = MasterEntitas::latest()->get(['id', 'nama', 'kode_entitas']);
        $plantList = MasterPlant::latest()->get(['id', 'nama', 'kode_entitas', 'kode_plant']);

        return Inertia::render('master/lokasi/edit', compact('lokasi', 'entitasList', 'plantList'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'entitas_kode' => 'required|exists:master_entitas,kode_entitas',
            'plant_kode' => 'required|exists:master_plant,kode_plant',
        ]);

        $lokasi = MasterLokasi::findOrFail($id);
        $lokasi->update($request->only('nama', 'entitas_kode', 'plant_kode'));

        activity()->log('User updated a master lokasi');

        return redirect()->route('lokasi.index')->with('success', 'Master lokasi updated successfully.');
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterLokasi $masterLokasi, $id)
    {
        $masterLokasi = $masterLokasi->findOrFail($id);
        $masterLokasi->delete();

        activity()->log('User deleted a master lokasi');

        return redirect()->route('lokasi.index')
            ->with('success', 'Master lokasi deleted successfully.');
    }
}
