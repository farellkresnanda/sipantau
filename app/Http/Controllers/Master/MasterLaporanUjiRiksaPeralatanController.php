<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterLaporanUjiRiksaPeralatan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterLaporanUjiRiksaPeralatanController extends Controller
{
    public function index()
    {
        $data = MasterLaporanUjiRiksaPeralatan::latest()->get();

        return Inertia::render('master/laporan-uji-riksa-peralatan/page', [
            'data' => $data,
        ]);
    }

    public function create()
    {
        return Inertia::render('master/laporan-uji-riksa-peralatan/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_peralatan' => 'required|string|max:255',
            'referensi' => 'nullable|string|max:255',
        ]);

        MasterLaporanUjiRiksaPeralatan::create([
            'nama_peralatan' => $request->nama_peralatan,
            'referensi' => $request->referensi,
        ]);

        return redirect()
            ->route('laporan-uji-riksa-peralatan.index')
            ->with('success', 'Berhasil menambahkan data');
    }

    public function edit($id)
    {
        $peralatan = MasterLaporanUjiRiksaPeralatan::findOrFail($id);

        return Inertia::render('master/laporan-uji-riksa-peralatan/edit', [
            'peralatan' => $peralatan,
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama_peralatan' => 'required|string|max:255',
            'referensi' => 'nullable|string|max:255',
        ]);

        $peralatan = MasterLaporanUjiRiksaPeralatan::findOrFail($id);
        $peralatan->update([
            'nama_peralatan' => $request->nama_peralatan,
            'referensi' => $request->referensi,
        ]);

        return redirect()
            ->route('laporan-uji-riksa-peralatan.index')
            ->with('success', 'Berhasil memperbarui data');
    }

    public function destroy($id)
    {
        $peralatan = MasterLaporanUjiRiksaPeralatan::findOrFail($id);
        $peralatan->delete();

        return redirect()
            ->route('laporan-uji-riksa-peralatan.index')
            ->with('success', 'Berhasil menghapus data');
    }
}
