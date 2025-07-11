<?php

namespace App\Http\Controllers\Master;

use App\Exports\AcExport;
use App\Http\Controllers\Controller;
use App\Imports\AcImport;
use App\Models\Master\MasterAc;
use App\Models\Master\MasterEntitas;
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
        $masterAc = MasterAc::latest()->with(['entitas','plants'])->get();
        return Inertia::render('master/ac/page', compact('masterAc'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $entitasList = MasterEntitas::latest()->get(['id', 'nama', 'kode_entitas']);
        $plantList = MasterPlant::latest()->get(['id', 'nama', 'kode_entitas', 'kode_plant']);
        return Inertia::render('master/ac/create', compact('entitasList', 'plantList'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'kode_entitas' => 'required|string|max:255',
            'kode_plant' => 'required|string|max:255',
            'ruang' => 'required|string|max:255',
            'kode_inventaris' => 'required|string|max:255',
            'merk' => 'required|string|max:255',
        ]);

        MasterAc::create($request->all());

        activity()->log('User created a new master AC');

        return redirect()->route('ac.index')
            ->with('success', 'Master AC created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MasterAc $masterAc, $id)
    {
        $masterAc = $masterAc->findOrFail($id);
        $entitasList = MasterEntitas::latest()->get(['id', 'nama', 'kode_entitas']);
        $plantList = MasterPlant::latest()->get(['id', 'nama', 'kode_entitas', 'kode_plant']);
        return Inertia::render('master/ac/edit', compact('masterAc', 'entitasList', 'plantList'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MasterAc $masterAc, $id)
    {
        $request->validate([
            'kode_entitas' => 'required|string|max:255',
            'kode_plant' => 'required|string|max:255',
            'ruang' => 'required|string|max:255',
            'kode_inventaris' => 'required|string|max:255',
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
