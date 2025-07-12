<?php

namespace App\Http\Controllers\Master;

use App\Exports\AcExport;
use App\Http\Controllers\Controller;
use App\Imports\AcImport;
use App\Models\Master\MasterAc;
use App\Models\Master\MasterEntity;
use App\Models\Master\MasterPlant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class MasterAcController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $masterAc = MasterAc::latest()->with(['entity', 'plants'])->get();

        return Inertia::render('master/ac/page', compact('masterAc'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $entityList = MasterEntity::latest()->get(['id', 'name', 'entity_code']);
        $plantList = MasterPlant::latest()->get(['id', 'name', 'entity_code', 'plant_code']);

        return Inertia::render('master/ac/create', compact('entityList', 'plantList'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'entity_code' => 'required|string|max:255',
            'plant_code' => 'required|string|max:255',
            'room' => 'required|string|max:255',
            'inventory_code' => 'required|string|max:255',
            'merk' => 'required|string|max:255',
        ]);

        MasterAc::create($request->all());

        activity()->log('User created a new master AC');

        return redirect()->route('ac.index')
            ->with('success', 'Master AC created successfully.');
    }

    public function show() {}

    public function edit(MasterAc $masterAc, $id)
    {
        $masterAc = $masterAc->findOrFail($id);
        $entityList = MasterEntity::latest()->get(['id', 'name', 'entity_code']);
        $plantList = MasterPlant::latest()->get(['id', 'name', 'entity_code', 'plant_code']);

        return Inertia::render('master/ac/edit', compact('masterAc', 'entityList', 'plantList'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MasterAc $masterAc, $id)
    {
        $request->validate([
            'entity_code' => 'required|string|max:255',
            'plant_code' => 'required|string|max:255',
            'room' => 'required|string|max:255',
            'inventory_code' => 'required|string|max:255',
            'merk' => 'required|string|max:255',
        ]);

        $masterAc = $masterAc->findOrFail($id);
        $masterAc->update($request->all());

        activity()->log('User updated master AC');

        return redirect()->route('ac.index')
            ->with('success', 'Master AC updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterAc $masterAc, $id)
    {
        $masterAc = $masterAc->findOrFail($id);
        $masterAc->delete();

        activity()->log('User deleted master AC');

        return redirect()->route('ac.index')
            ->with('success', 'Master AC deleted successfully.');
    }

    /**
     * Show import page.
     */
    public function import()
    {
        return Inertia::render('master/ac/import');
    }

    /**
     * Handle the Excel import.
     */
    public function action_import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls',
        ]);

        Excel::import(new AcImport, $request->file('file'));

        activity()->log('User imported master AC');

        return redirect()->route('ac.index')
            ->with('success', 'Master AC imported successfully.');
    }

    /**
     * Export data to Excel.
     */
    public function export()
    {
        activity()->log('User exported master AC');

        return Excel::download(new AcExport, 'master_ac.xlsx');
    }
}
