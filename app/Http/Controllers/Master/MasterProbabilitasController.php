<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterProbabilitas;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterProbabilitasController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $probabilitas = MasterProbabilitas::latest()->get();
        return inertia('master/probabilitas/page', compact('probabilitas'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('master/probabilitas/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'probabilitas' => 'required|numeric|min:0|max:100',
        ]);
        MasterProbabilitas::create([
            'nama' => $request->nama,
            'probabilitas' => $request->probabilitas,
        ]);

        activity()->log('User created a new master probabilitas');

        return redirect()->route('probabilitas.index')->with('success', 'Master probabilitas created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(MasterProbabilitas $masterProbabilitas)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MasterProbabilitas $masterProbabilitas, $id)
    {
        $masterProbabilitas = MasterProbabilitas::findOrFail($id);

        return Inertia::render('master/probabilitas/edit', [
            'masterProbabilitas' => $masterProbabilitas,
        ]);
    }



    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MasterProbabilitas $masterProbabilitas)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'probabilitas' => 'required|numeric|min:0|max:100',
        ]);

        $masterProbabilitas->update([
            'nama' => $request->nama,
            'probabilitas' => $request->probabilitas,
        ]);

        activity()->log('User updated a master probabilitas');

        return redirect()->route('probabilitas.index')->with('success', 'Master probabilitas updated successfully.');
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterProbabilitas $masterProbabilitas, $id)
    {
        $masterProbabilitas = MasterProbabilitas::findOrFail($id);
        $masterProbabilitas->delete();
        activity()->log('User deleted a master probabilitas');
        return redirect()->route('probabilitas.index')->with('success', 'Master probabilitas deleted successfully.');
    }
}
