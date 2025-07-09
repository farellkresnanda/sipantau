<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterJenisKetidaksesuaian;
use App\Models\Master\MasterJenisKetidaksesuaianSub;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterJenisKetidaksesuaianController extends Controller
{
    public function index()
    {
        $data = MasterJenisKetidaksesuaian::with('subJenis')->latest()->get();

        return Inertia::render('master/jenis-ketidaksesuaian/page', [
            'data' => $data,
        ]);
    }

    public function create()
    {
        return Inertia::render('master/jenis-ketidaksesuaian/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'sub_jenis' => 'nullable|array',
            'sub_jenis.*.nama' => 'nullable|string|max:255',
        ]);

        $jenis = MasterJenisKetidaksesuaian::create([
            'nama' => $validated['nama'],
        ]);

        if (!empty($validated['sub_jenis'])) {
            // Filter hanya sub_jenis yang memiliki nama
            $filteredSubJenis = array_filter($validated['sub_jenis'], fn ($item) => !empty($item['nama']));

            if (!empty($filteredSubJenis)) {
                $jenis->subJenis()->createMany($filteredSubJenis);
            }
        }

        return redirect()->route('jenis-ketidaksesuaian.index')->with('success', 'Berhasil menambahkan data');
    }

    public function edit(string $id)
    {
        $data = MasterJenisKetidaksesuaian::with('subJenis')->findOrFail($id);

        return Inertia::render('master/jenis-ketidaksesuaian/edit', [
            'data' => $data,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'sub_jenis' => 'nullable|array',
            'sub_jenis.*.id' => 'nullable|integer|exists:master_jenis_ketidaksesuaian_sub,id',
            'sub_jenis.*.nama' => 'nullable|string|max:255',
        ]);

        $jenis = MasterJenisKetidaksesuaian::findOrFail($id);
        $jenis->update(['nama' => $validated['nama']]);

        // Ambil semua ID sub yang dikirim agar yang tidak dikirim bisa dihapus
        $incomingIds = collect($validated['sub_jenis'])->pluck('id')->filter()->all();

        // Hapus sub_jenis yang tidak ada di inputan
        MasterJenisKetidaksesuaianSub::where('master_jenis_ketidaksesuaian_id', $id)
            ->whereNotIn('id', $incomingIds)
            ->delete();

        // Proses sub_jenis
        foreach ($validated['sub_jenis'] ?? [] as $sub) {
            if (!empty($sub['id'])) {
                // Update sub_jenis yang sudah ada
                MasterJenisKetidaksesuaianSub::where('id', $sub['id'])->update([
                    'nama' => $sub['nama'],
                ]);
            } elseif (!empty($sub['nama'])) {
                // Tambah sub_jenis baru
                MasterJenisKetidaksesuaianSub::create([
                    'master_jenis_ketidaksesuaian_id' => $id,
                    'nama' => $sub['nama'],
                ]);
            }
        }

        return redirect()->route('jenis-ketidaksesuaian.index')->with('success', 'Berhasil update data');
    }

    public function destroy(string $id)
    {
        $jenis = MasterJenisKetidaksesuaian::findOrFail($id);
        $jenis->subJenis()->delete();
        $jenis->delete();

        return redirect()->back()->with('success', 'Berhasil menghapus data');
    }
}
