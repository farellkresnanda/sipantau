<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterKonsekuensi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterKonsekuensiController extends Controller
{
    public function index()
    {
        $data = MasterKonsekuensi::latest()->get();

        return Inertia::render('master/konsekuensi/page', ['data' => $data]);
    }

    /**
     * Tampilkan form untuk membuat konsekuensi baru
     */
    public function create()
    {
        return Inertia::render('master/konsekuensi/create');
    }

    /**
     * Simpan data konsekuensi baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'konsekuensi' => 'required|string|max:10',
        ]);

        MasterKonsekuensi::create($validated);

        return redirect()->route('konsekuensi.index')->with('success', 'Data berhasil disimpan.');
    }

    public function edit($id)
    {
        $data = MasterKonsekuensi::findOrFail($id);

        return Inertia::render('master/konsekuensi/edit', ['data' => $data]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'konsekuensi' => 'required|string|max:10',
        ]);

        MasterKonsekuensi::findOrFail($id)->update($validated);

        return redirect()->route('konsekuensi.index')->with('success', 'Data berhasil diperbarui.');
    }

    /**
     * Hapus data konsekuensi
     */
    public function destroy($id)
    {
        $item = MasterKonsekuensi::findOrFail($id);
        $item->delete();

        return redirect()->route('konsekuensi.index')->with('success', 'Data berhasil dihapus.');
    }
}
