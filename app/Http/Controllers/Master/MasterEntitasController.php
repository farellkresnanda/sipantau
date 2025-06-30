<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterEntitas;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterEntitasController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $entitas = MasterEntitas::latest()->get();
        return Inertia::render('master/entitas/page', compact('entitas'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('master/entitas/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'kode_entitas' => 'required|string|max:255',
            'kode_group' => 'required|string|max:255',
            'nama' => 'required|string|max:255',
            'nama_alias' => 'required|string|max:255',
        ]);

        MasterEntitas::create([
            'kode_entitas' => $request->kode_entitas,
            'kode_group' => $request->kode_group,
            'nama' => $request->nama,
            'nama_alias' => $request->nama_alias,
        ]);

        activity()->log('User created a new master entitas');

        return redirect()->route('entitas.index')->with('success', 'Master entitas created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MasterEntitas $masterEntitas, $id)
    {
        $masterEntitas = MasterEntitas::findOrFail($id);
        return Inertia::render('master/entitas/edit', compact('masterEntitas'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MasterEntitas $masterEntitas)
    {
        $request->validate([
            'kode_entitas' => 'required|string|max:255',
            'kode_group' => 'required|string|max:255',
            'nama' => 'required|string|max:255',
            'nama_alias' => 'required|string|max:255',
        ]);

        $masterEntitas = $masterEntitas->findOrFail($request->id);
        $masterEntitas->update([
            'kode_entitas' => $request->kode_entitas,
            'kode_group' => $request->kode_group,
            'nama' => $request->nama,
            'nama_alias' => $request->nama_alias,
        ]);

        activity()->log('User updated a master entitas');

        return redirect()->route('entitas.index')->with('success', 'Master entitas updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterEntitas $masterEntitas, $id)
    {
        $masterEntitas = MasterEntitas::findOrFail($id);
        $masterEntitas->delete();

        activity()->log('User deleted a master entitas');

        return redirect()->route('entitas.index')->with('success', 'Master entitas deleted successfully.');
    }
}
