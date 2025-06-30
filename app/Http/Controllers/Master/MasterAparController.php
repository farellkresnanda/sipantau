<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterApar;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterAparController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $masterApar = MasterApar::latest()->get();
        return Inertia::render('master/apar/page', compact('masterApar'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('master/apar/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'kode_entitas' => 'required|string|max:255',
            'entitas' => 'required|string|max:255',
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
    public function edit(MasterApar $masterInspeksiApar, $id)
    {
        $masterApar = $masterInspeksiApar->findOrFail($id);
        return Inertia::render('master/apar/edit', compact('masterApar'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MasterApar $masterInspeksiApar)
    {
        $request->validate([
            'kode_entitas' => 'required|string|max:255',
            'entitas' => 'required|string|max:255',
            'no_apar' => 'required|string|max:255',
            'kode_ruang' => 'required|string|max:255',
            'lokasi' => 'required|string|max:255',
            'jenis' => 'required|string|max:255',
            'apar' => 'required|string|max:255',
            'kode_inventaris' => 'required|string|max:255',
        ]);

        $masterInspeksiApar = $masterInspeksiApar->findOrFail($request->id);
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
}
