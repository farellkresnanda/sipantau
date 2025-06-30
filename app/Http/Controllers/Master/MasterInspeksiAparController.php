<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterInspeksiApar;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterInspeksiAparController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $aparList = MasterInspeksiApar::latest()->get();
        return Inertia::render('master/inspeksi-apar/page', compact('aparList'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('master/inspeksi-apar/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'kode_entitas' => 'required|string|max:255',
            'entitas' => 'required|string|max:255',
            'no_ac' => 'required|string|max:255',
            'kode_ruang' => 'required|string|max:255',
            'ruang' => 'required|string|max:255',
            'kode_inventaris' => 'required|string|max:255',
            'merk' => 'required|string|max:255',
        ]);

        MasterInspeksiApar::create($request->all());

        activity()->log('User created a new master inspeksi apar');

        return redirect()->route('master-inspeksi-apar.index')
            ->with('success', 'Master inspeksi apar created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(MasterInspeksiApar $masterInspeksiApar)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MasterInspeksiApar $masterInspeksiApar, $id)
    {
        $masterInspeksiApar = MasterInspeksiApar::findOrFail($id);
        return Inertia::render('master/inspeksi-apar/edit', compact('masterInspeksiApar'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MasterInspeksiApar $masterInspeksiApar)
    {
        $request->validate([
            'kode_entitas' => 'required|string|max:255',
            'entitas' => 'required|string|max:255',
            'no_ac' => 'required|string|max:255',
            'kode_ruang' => 'required|string|max:255',
            'ruang' => 'required|string|max:255',
            'kode_inventaris' => 'required|string|max:255',
            'merk' => 'required|string|max:255',
        ]);

        $masterInspeksiApar->update($request->all());

        activity()->log('User updated a master inspeksi apar');

        return redirect()->route('master-inspeksi-apar.index')
            ->with('success', 'Master inspeksi apar updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterInspeksiApar $masterInspeksiApar, $id)
    {
        $masterInspeksiApar = MasterInspeksiApar::findOrFail($id);
        $masterInspeksiApar->delete();

        activity()->log('User deleted a master inspeksi apar');

        return redirect()->route('master-inspeksi-apar.index')
            ->with('success', 'Master inspeksi apar deleted successfully.');
    }
}
