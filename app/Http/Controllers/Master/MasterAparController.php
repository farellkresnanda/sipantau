<?php

namespace App\Http\Controllers\Master;

use App\Exports\AparExport;
use App\Http\Controllers\Controller;
use App\Imports\AparImport;
use App\Models\Master\MasterApar;
use App\Models\Master\MasterEntitas;
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
        $masterApar = MasterApar::latest()->with(['entitas','plants'])->get();
        return Inertia::render('master/apar/page', compact('masterApar'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
                $entitasList = MasterEntitas::latest()->get(['id', 'nama', 'kode_entitas']);
        $plantList = MasterPlant::latest()->get(['id', 'nama', 'kode_entitas', 'kode_plant']);
        return Inertia::render('master/apar/create',compact('entitasList', 'plantList'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'kode_entitas' => 'required|string|max:255',
            'kode_plant' => 'required|string|max:255',
            'no_apar' => 'required|string|max:255',
            'kode_ruang' => 'required|string|max:255',
            'lokasi' => 'required|string|max:255',
            'jenis' => 'required|string|max:255',
            'apar' => 'required|string|max:255',
            'kode_inventaris' => 'required|string|max:255',
        ]);

        MasterApar::create($request->all());

        activity()->log('User created a new master apar');

        return redirect()->route('apar.index')
            ->with('success', 'Master  apar created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */

     public function show()
    {
    }
    public function edit(MasterApar $masterInspeksiApar, $id)
    {

        $masterApar = $masterInspeksiApar->findOrFail($id);
        $entitasList = MasterEntitas::latest()->get(['id', 'nama', 'kode_entitas']);
        $plantList = MasterPlant::latest()->get(['id', 'nama', 'kode_entitas', 'kode_plant']);
        return Inertia::render('master/apar/edit', compact('masterApar', 'entitasList', 'plantList'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MasterApar $masterInspeksiApar,$id)
    {

        $request->validate([
            'kode_entitas' => 'required|string|max:255',
            'kode_plant' => 'required|string|max:255',
            'no_apar' => 'required|string|max:255',
            'kode_ruang' => 'required|string|max:255',
            'lokasi' => 'required|string|max:255',
            'jenis' => 'required|string|max:255',
            'apar' => 'required|string|max:255',
            'kode_inventaris' => 'required|string|max:255',
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
        'file' => 'required|file|mimes:xlsx,xls'
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
