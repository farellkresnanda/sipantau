<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterStandarKerja;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterStandarKerjaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $standarKerja = MasterStandarKerja::latest()->get();
        return Inertia::render('master/standar-kerja/page', compact('standarKerja'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('master/standar-kerja/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'keterangan' => 'required|string',
            'periode' => 'required|string|max:255',
        ]);

        MasterStandarKerja::create($request->all());

        activity()->log('User created a new master standar kerja');

        return redirect()->route('standar-kerja.index')
            ->with('success', 'Master standar kerja created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MasterStandarKerja $masterStandarPekerjaan, $id)
    {
        $masterStandarPekerjaan = $masterStandarPekerjaan->findOrFail($id);
        return Inertia::render('master/standar-kerja/edit', compact('masterStandarPekerjaan'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MasterStandarKerja $masterStandarPekerjaan, $id)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'keterangan' => 'required|string',
            'periode' => 'required|string|max:255',
        ]);

        $masterStandarPekerjaan = $masterStandarPekerjaan->findOrFail($id);
        $masterStandarPekerjaan->update($request->all());

        activity()->log('User updated a master standar kerja');

        return redirect()->route('standar-kerja.index')
            ->with('success', 'Master standar kerja updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterStandarKerja $masterStandarPekerjaan, $id)
    {
        $masterStandarPekerjaan = $masterStandarPekerjaan->findOrFail($id);
        $masterStandarPekerjaan->delete();

        activity()->log('User deleted a master standar kerja');

        return redirect()->route('standar-kerja.index')
            ->with('success', 'Master standar kerja deleted successfully.');
    }
}
