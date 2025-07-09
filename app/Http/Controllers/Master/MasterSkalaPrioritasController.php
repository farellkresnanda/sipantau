<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterSkalaPrioritas;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterSkalaPrioritasController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $skalaPrioritas = MasterSkalaPrioritas::latest()->get();
        return inertia('master/skala-prioritas/page', compact('skalaPrioritas'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('master/skala-prioritas/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'skala' => 'required|numeric|min:0|max:100',
        ]);
        MasterSkalaPrioritas::create([
            'nama' => $request->nama,
            'skala' => $request->skala,
        ]);

        activity()->log('User created a new master skala prioritas');

        return redirect()->route('skala-prioritas.index')->with('success', 'Master skala prioritas created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(MasterSkalaPrioritas $masterSkalaPrioritas)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MasterSkalaPrioritas $masterSkalaPrioritas, $id)
    {
        $masterSkalaPrioritas = MasterSkalaPrioritas::findOrFail($id);

        return Inertia::render('master/skala-prioritas/edit', [
            'masterSkalaPrioritas' => $masterSkalaPrioritas,
        ]);
    }


       /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MasterSkalaPrioritas $skala_priorita)
    {
// dd($skala_priorita)
;        // dd($request->all());
        $request->validate([
            'nama' => 'required|string|max:255',
            'skala' => 'required|numeric|min:0|max:100',
        ]);

        $skala_priorita->update([
            'nama' => $request->nama,
            'skala' => $request->skala,
        ]);

        activity()->log('User updated a master skala prioritas');

        return redirect()->route('skala-prioritas.index')->with('success', 'Master skala prioritas updated successfully.');
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterSkalaPrioritas $masterSkalaPrioritas, $id)
    {
        $masterSkalaPrioritas = MasterSkalaPrioritas::findOrFail($id);
        $masterSkalaPrioritas->delete();
        activity()->log('User deleted a master skala prioritas');
        return redirect()->route('skala-prioritas.index')->with('success', 'Master skala prioritas deleted successfully.');
    }
}
