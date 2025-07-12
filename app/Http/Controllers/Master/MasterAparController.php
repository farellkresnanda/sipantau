<?php

namespace App\Http\Controllers\Master;

use App\Exports\AparExport;
use App\Http\Controllers\Controller;
use App\Imports\AparImport;
use App\Models\Master\MasterApar;
use App\Models\Master\MasterEntity;
use App\Models\Master\MasterPlant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class MasterAparController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $masterApar = MasterApar::latest()->with(['entity', 'plants'])->get();

        return Inertia::render('master/apar/page', compact('masterApar'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $entityList = MasterEntity::latest()->get(['id', 'name', 'entity_code']);
        $plantList = MasterPlant::latest()->get(['id', 'name', 'entity_code', 'plant_code']);

        return Inertia::render('master/apar/create', compact('entityList', 'plantList'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'entity_code' => 'required|string|max:255',
            'plant_code' => 'required|string|max:255',
            'apar_no' => 'required|string|max:255',
            'room_code' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'apar' => 'required|string|max:255',
            'inventory_code' => 'required|string|max:255',
        ]);

        MasterApar::create($request->all());

        activity()->log('User created a new master apar');

        return redirect()->route('apar.index')
            ->with('success', 'Master  apar created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function show() {}

    public function edit(MasterApar $masterInspeksiApar, $id)
    {

        $masterApar = $masterInspeksiApar->findOrFail($id);
        $entityList = MasterEntity::latest()->get(['id', 'name', 'entity_code']);
        $plantList = MasterPlant::latest()->get(['id', 'name', 'entity_code', 'plant_code']);

        return Inertia::render('master/apar/edit', compact('masterApar', 'entityList', 'plantList'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MasterApar $masterInspeksiApar, $id)
    {

        $request->validate([
            'entity_code' => 'required|string|max:255',
            'plant_code' => 'required|string|max:255',
            'apar_no' => 'required|string|max:255',
            'room_code' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'apar' => 'required|string|max:255',
            'inventory_code' => 'required|string|max:255',
        ]);

        $masterInspeksiApar = $masterInspeksiApar->findOrFail($id);
        $masterInspeksiApar->update($request->all());

        activity()->log('User updated a master apar');

        return redirect()->route('apar.index')
            ->with('success', 'Master  apar updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterApar $masterInspeksiApar, $id)
    {
        $masterInspeksiApar = $masterInspeksiApar->findOrFail($id);
        $masterInspeksiApar->delete();

        activity()->log('User deleted a master apar');

        return redirect()->route('apar.index')
            ->with('success', 'Master  apar deleted successfully.');
    }

    public function import()
    {
        // dd('OKE')  ;
        return Inertia::render('master/apar/import');
    }

    public function action_import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls',
        ]);

        Excel::import(new AparImport, $request->file('file'));

        activity()->log('User import master APAR');

        return redirect()->route('apar.index')
            ->with('success', 'Master APAR imported successfully.');
    }

    public function export()
    {
        return Excel::download(new AparExport, 'master_data.xlsx');
    }
}
