<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterApd;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterApdController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $masterApd = MasterApd::latest()->get();
        return Inertia::render('master/apd/page', compact('masterApd'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('master/apd/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_apd' => 'required|string|max:255',
            'kriteria_inspeksi' => 'required|string',
        ]);

        MasterApd::create($request->all());

        activity()->log('User created a new master APD');

        return redirect()->route('apd.index')
            ->with('success', 'Master APD created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MasterApd $masterInspeksiApd, $id)
    {
        $masterApd = $masterInspeksiApd->findOrFail($id);
        return Inertia::render('master/apd/edit', compact('masterApd'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MasterApd $masterInspeksiApd)
    {
        $request->validate([
            'nama_apd' => 'required|string|max:255',
            'kriteria_inspeksi' => 'required|string',
        ]);

        $masterInspeksiApd = $masterInspeksiApd->findOrFail($request->id);
        $masterInspeksiApd->update($request->all());

        activity()->log('User updated a master APD');

        return redirect()->route('apd.index')
            ->with('success', 'Master APD updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterApd $masterInspeksiApd, $id)
    {
        $masterInspeksiApd = $masterInspeksiApd->findOrFail($id);
        $masterInspeksiApd->delete();

        activity()->log('User deleted a master APD');

        return redirect()->route('apd.index')
            ->with('success', 'Master APD deleted successfully.');
    }
}
