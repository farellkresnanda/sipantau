<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterLaporanUjiRiksaFasilitas;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterLaporanUjiRiksaFasilitasController extends Controller
{
    public function index()
    {
        $data = MasterLaporanUjiRiksaFasilitas::latest()->get();

        return Inertia::render('master/laporan-uji-riksa-fasilitas/page', [
            'data' => $data,
        ]);
    }

    public function create()
    {
        return Inertia::render('master/laporan-uji-riksa-fasilitas/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_fasilitas' => 'required|string|max:255',
            'referensi' => 'required|string|max:255',
        ]);

        MasterLaporanUjiRiksaFasilitas::create($request->only('nama_fasilitas', 'referensi'));

        return redirect()
            ->route('laporan-uji-riksa-fasilitas.index')
            ->with('success', 'Berhasil menambahkan data');
    }

    public function edit($id)
    {
        $fasilitas = MasterLaporanUjiRiksaFasilitas::findOrFail($id);

        return Inertia::render('master/laporan-uji-riksa-fasilitas/edit', [
            'fasilitas' => $fasilitas,
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama_fasilitas' => 'required|string|max:255',
            'referensi' => 'required|string|max:255',
        ]);

        $fasilitas = MasterLaporanUjiRiksaFasilitas::findOrFail($id);
        $fasilitas->update($request->only('nama_fasilitas', 'referensi'));

        return redirect()
            ->route('laporan-uji-riksa-fasilitas.index')
            ->with('success', 'Berhasil memperbarui data');
    }

    public function destroy($id)
    {
        $fasilitas = MasterLaporanUjiRiksaFasilitas::findOrFail($id);
        $fasilitas->delete();

        return redirect()
            ->route('laporan-uji-riksa-fasilitas.index')
            ->with('success', 'Berhasil menghapus data');
    }
}
