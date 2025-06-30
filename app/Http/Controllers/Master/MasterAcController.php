<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterAc;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterAcController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $acList = MasterAc::latest()->get();
        return Inertia::render('master/ac/page', compact('acList'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('master/ac/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'kode_entitas' => 'required|string|max:255',
            'entitas' => 'required|string|max:255',
            'ruang' => 'required|string|max:255',
            'kode_inventaris' => 'required|string|max:255',
            'merk' => 'required|string|max:255',
        ]);

        MasterAc::create($request->all());

        activity()->log('User created a new master ac');

        return redirect()->route('ac.index')
            ->with('success', 'Master ac created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MasterAc $masterAc, $id)
    {
        $masterAc = $masterAc->findOrFail($id);
        return Inertia::render('master/ac/edit', compact('masterAc'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MasterAc $masterAc, $id)
    {
        $request->validate([
            'kode_entitas' => 'required|string|max:255',
            'entitas' => 'required|string|max:255',
            'ruang' => 'required|string|max:255',
            'kode_inventaris' => 'required|string|max:255',
            'merk' => 'required|string|max:255',
        ]);

        $masterAc = $masterAc->findOrFail($id);
        $masterAc->update($request->all());

        activity()->log('User updated a master ac');

        return redirect()->route('ac.index')
            ->with('success', 'Master ac updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterAc $masterAc, $id)
    {
        $masterAc = $masterAc->findOrFail($id);
        $masterAc->delete();

        activity()->log('User deleted a master ac');

        return redirect()->route('ac.index')
            ->with('success', 'Master ac deleted successfully.');
    }
}
