<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterStandarKerjaGedung;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterStandarKerjaGedungController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $standarKerjaGedung = MasterStandarKerjaGedung::latest()->get();
        return Inertia::render('master/standar-kerja-gedung/page', compact('standarKerjaGedung'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('master/standar-kerja-gedung/create');
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

        MasterStandarKerjaGedung::create($request->all());

        activity()->log('User created a new master standar kerja gedung');

        return redirect()->route('standar-kerja-gedung.index')
            ->with('success', 'Master standar kerja gedung created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MasterStandarKerjaGedung $standarKerjaGedung)
    {
        return Inertia::render('master/standar-kerja-gedung/edit', compact('standarKerjaGedung'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MasterStandarKerjaGedung $standarKerjaGedung, $id)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'keterangan' => 'required|string',
            'periode' => 'required|string|max:255',
        ]);

        $standarKerjaGedung = $standarKerjaGedung->findOrFail($id);
        $standarKerjaGedung->update($request->all());

        activity()->log('User updated a master standar kerja gedung');

        return redirect()->route('standar-kerja-gedung.index')
            ->with('success', 'Master standar kerja gedung updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterStandarKerjaGedung $standarKerjaGedung)
    {
        $standarKerjaGedung->delete();

        activity()->log('User deleted a master standar kerja gedung');

        return redirect()->route('standar-kerja-gedung.index')
            ->with('success', 'Master standar kerja gedung deleted successfully.');
    }
}
