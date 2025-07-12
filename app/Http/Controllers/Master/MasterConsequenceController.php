<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterConsequence;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterConsequenceController extends Controller
{
    /**
     * Tampilkan daftar consequence
     */
    public function index()
    {
        $data = MasterConsequence::latest()->get();

        return Inertia::render('master/consequence/page', ['data' => $data]);
    }

    /**
     * Tampilkan form untuk membuat consequence baru
     */
    public function create()
    {
        return Inertia::render('master/consequence/create');
    }

    /**
     * Simpan data consequence baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'consequence' => 'required|string|max:10',
        ]);

        MasterConsequence::create($validated);

        return redirect()->route('consequence.index')->with('success', 'Data berhasil disimpan.');
    }

    /**
     * Tampilkan form untuk mengedit consequence
     */
    public function edit($id)
    {
        $data = MasterConsequence::findOrFail($id);

        return Inertia::render('master/consequence/edit', ['data' => $data]);
    }

    /**
     * Perbarui data consequence
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'consequence' => 'required|string|max:10',
        ]);

        MasterConsequence::findOrFail($id)->update($validated);

        return redirect()->route('consequence.index')->with('success', 'Data berhasil diperbarui.');
    }

    /**
     * Hapus data consequence
     */
    public function destroy($id)
    {
        $item = MasterConsequence::findOrFail($id);
        $item->delete();

        return redirect()->route('consequence.index')->with('success', 'Data berhasil dihapus.');
    }
}
