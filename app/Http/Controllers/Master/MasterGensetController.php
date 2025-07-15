<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterEntity;
use App\Models\Master\MasterGenset;
use App\Models\Master\MasterPlant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterGensetController extends Controller
{
    public function index()
    {
        $gensets = MasterGenset::with(['entity', 'plant'])
            ->latest()
            ->get();

        return Inertia::render('master/genset/page', [
            'gensets' => $gensets,
        ]);
    }

    public function create()
    {
        $entityList = MasterEntity::select('id', 'name', 'entity_code')->get();
        $plantList = MasterPlant::select('id', 'name', 'plant_code', 'entity_code')->get();

        return Inertia::render('master/genset/create', [
            'entityList' => $entityList,
            'plantList' => $plantList,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'entity_code' => 'required|string|max:255',
            'plant_code' => 'required|string|max:255',
            'machine_type' => 'required|string|max:100',
            'merk' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'country_year_of_manufacture' => 'required|string|max:100',
            'manufacturer' => 'required|string|max:150',
            'serial_number' => 'required|string|max:100',
            'capacity' => 'required|string|max:50',
        ]);

        MasterGenset::create($request->all());

        return redirect()->route('genset.index')
            ->with('success', 'Data Genset berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $genset = MasterGenset::findOrFail($id);
        $entities = MasterEntity::select('id', 'name', 'entity_code')->get();
        $plants = MasterPlant::select('id', 'name', 'plant_code', 'entity_code')->get();

        return Inertia::render('master/genset/edit', [
            'genset' => $genset,
            'entities' => $entities,
            'plants' => $plants,
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'entity_code' => 'required|string|max:255',
            'plant_code' => 'required|string|max:255',
            'machine_type' => 'required|string|max:100',
            'merk' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'country_year_of_manufacture' => 'required|string|max:100',
            'manufacturer' => 'required|string|max:150',
            'serial_number' => 'required|string|max:100',
            'capacity' => 'required|string|max:50',
        ]);

        $genset = MasterGenset::findOrFail($id);
        $genset->update($request->all());

        return redirect()->route('genset.index')
            ->with('success', 'Data Genset berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $genset = MasterGenset::findOrFail($id);
        $genset->delete();

        return redirect()->route('genset.index')
            ->with('success', 'Data Genset berhasil dihapus.');
    }
}
