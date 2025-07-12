<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterBuilding;    // Import model MasterBuilding
use App\Models\Master\MasterPlant;     // Import model MasterPlant
// Import model MasterEntity
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterBuildingController extends Controller
{
    /**
     * Menampilkan daftar data Master Gedung
     */
    public function index()
    {
        $data = MasterBuilding::query()
            ->with([
                'entityData:entity_code,name', // Memuat relasi entity
                'plantData:plant_code,name',     // Memuat relasi plant
            ])
            ->latest()
            ->get()
            ->map(function ($building) {
                return [
                    'id' => $building->id,
                    'entity_code' => $building->entity_code,
                    'plant_code' => $building->plant_code,
                    'location_name' => $building->location_name,
                    'entity_name' => $building->entityData ? $building->entityData->name : '-',
                    'plant_name' => $building->plantData ? $building->plantData->name : '-',
                ];
            });

        return Inertia::render('master/building/page', [
            'masterBuilding' => $data,
        ]);
    }

    /**
     * Menampilkan form input data Master Gedung
     */
    public function create()
    {
        $plants = MasterPlant::select(
            'master_plant.id',
            'master_plant.name as name_plant',
            'master_plant.entity_code',
            'master_plant.plant_code',
            'master_entities.name as entity_name'
        )
            ->leftJoin('master_entities', 'master_plant.entity_code', '=', 'master_entities.entity_code')
            ->orderBy('master_entities.name')
            ->get();

        return Inertia::render('master/building/create', [
            'plants' => $plants,
        ]);
    }

    /**
     * Simpan data Master Gedung yang baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'entity_code' => 'required|string|max:10',
            'plant_code' => 'required|string|max:10',
            'location_name' => 'required|string|max:255',
        ]);

        MasterBuilding::create($validated);

        return redirect()->route('building.index')->with('success', 'Data Gedung berhasil ditambahkan.');
    }

    /**
     * Tampilkan halaman edit data Master Gedung
     */
    public function edit(MasterBuilding $building)
    {
        $building->load([
            'entityData:entity_code,name',
            'plantData:plant_code,name',
        ]);

        $plants = MasterPlant::select(
            'master_plant.id',
            'master_plant.name as name_plant',
            'master_plant.entity_code',
            'master_plant.plant_code',
            'master_entities.name as entity_name'
        )
            ->leftJoin('master_entities', 'master_plant.entity_code', '=', 'master_entities.entity_code')
            ->orderBy('master_entities.name')
            ->get();

        return Inertia::render('master/building/edit', [
            'masterBuilding' => $building,
            'plants' => $plants,
        ]);
    }

    /**
     * Perbarui data Master Gedung
     */
    public function update(Request $request, MasterBuilding $building)
    {
        $validated = $request->validate([
            'entity_code' => 'required|string|max:10',
            'plant_code' => 'required|string|max:10',
            'location_name' => 'required|string|max:255',
        ]);

        $building->update($validated);

        return redirect()->route('building.index')->with('success', 'Data Gedung berhasil diperbarui.');
    }

    /**
     * Hapus data Master Gedung
     */
    public function destroy(MasterBuilding $building)
    {
        $building->delete();

        return redirect()->route('building.index')->with('success', 'Data Gedung berhasil dihapus.');
    }
}
