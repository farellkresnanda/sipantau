<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterGenset;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterGensetController extends Controller
{
    /**
     * Menampilkan daftar Genset
     */
    public function index()
    {
        $gensets = MasterGenset::orderBy('id', 'desc')->get();

        // Ganti 'Page' => 'page' untuk cocokan file React page.tsx
        return Inertia::render('master/genset/page', [
            'gensets' => $gensets,
        ]);
    }

    /**
     * Menampilkan form create
     */
    public function create()
    {
        return Inertia::render('master/genset/create'); // harus lowercase 'create.tsx'
    }

    /**
     * Menyimpan data Genset baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'jenis_mesin'            => 'required|string|max:100',
            'merk'                   => 'required|string|max:100',
            'model'                  => 'required|string|max:100',
            'negara_thn_pembuatan'  => 'required|string|max:100',
            'pabrik_pembuat'        => 'required|string|max:150',
            'no_seri'                => 'required|string|max:100',
            'kapasitas'             => 'required|string|max:50',
        ]);

        MasterGenset::create($validated);

        return redirect()->route('genset.index')
            ->with('success', 'Data Genset berhasil ditambahkan.');
    }

    /**
     * Menampilkan form edit
     */
    public function edit(MasterGenset $genset)
    {
        return Inertia::render('master/genset/edit', [ // harus lowercase 'edit.tsx'
            'genset' => $genset,
        ]);
    }

    /**
     * Update data Genset
     */
    public function update(Request $request, MasterGenset $genset)
    {
        $validated = $request->validate([
            'jenis_mesin'            => 'required|string|max:100',
            'merk'                   => 'required|string|max:100',
            'model'                  => 'required|string|max:100',
            'negara_thn_pembuatan'  => 'required|string|max:100',
            'pabrik_pembuat'        => 'required|string|max:150',
            'no_seri'                => 'required|string|max:100',
            'kapasitas'             => 'required|string|max:50',
        ]);

        $genset->update($validated);

        return redirect()->route('genset.index')
            ->with('success', 'Data Genset berhasil diperbarui.');
    }

    /**
     * Hapus data Genset
     */
    public function destroy(MasterGenset $genset)
    {
        $genset->delete();

        return redirect()->route('genset.index')
            ->with('success', 'Data Genset berhasil dihapus.');
    }
}
