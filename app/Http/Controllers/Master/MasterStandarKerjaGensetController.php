<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterStandarKerjaGenset;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterStandarKerjaGensetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $standarKerjaGenset = MasterStandarKerjaGenset::latest()->get();
        return Inertia::render('master/standar-kerja-genset/page', compact('standarKerjaGenset'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('master/standar-kerja-genset/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'item_pekerjaan' => 'required|string|max:255',
            'periode' => 'required|string|max:255',
        ]);

        MasterStandarKerjaGenset::create($request->all());

        activity()->log('User created a new master standar kerja genset');

        return redirect()->route('standar-kerja-genset.index')
            ->with('success', 'Master standar kerja genset created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MasterStandarKerjaGenset $standarKerjaGenset)
    {
        return Inertia::render('master/standar-kerja-genset/edit', compact('standarKerjaGenset'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MasterStandarKerjaGenset $standarKerjaGenset, $id)
    {
        $request->validate([
            'item_pekerjaan' => 'required|string|max:255',
            'periode' => 'required|string|max:255',
        ]);

        $standarKerjaGenset = $standarKerjaGenset->findOrFail($id);
        $standarKerjaGenset->update($request->all());

        activity()->log('User updated a master standar kerja genset');

        return redirect()->route('standar-kerja-genset.index')
            ->with('success', 'Master standar kerja genset updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterStandarKerjaGenset $standarKerjaGenset)
    {
        $standarKerjaGenset->delete();

        activity()->log('User deleted a master standar kerja genset');

        return redirect()->route('standar-kerja-genset.index')
            ->with('success', 'Master standar kerja genset deleted successfully.');
    }
}
