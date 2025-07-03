<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterP3k;
use App\Models\Master\MasterPlant;
use App\Models\Master\MasterEntitas;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterP3kController extends Controller
{
    /**
     * Menampilkan daftar data Master P3K
     */
    public function index()
    {
        $data = MasterP3k::query()
            // Perbarui nama relasi di sini
            ->with([
                'entitasData:kode_entitas,nama', // <-- GUNAKAN NAMA FUNGSI RELASI BARU
                'plantData:kode_plant,nama',     // <-- GUNAKAN NAMA FUNGSI RELASI BARU
            ])
            ->latest()
            ->get()
            ->map(function ($p3k) {
                return [
                    'id' => $p3k->id,
                    'kode_entitas' => $p3k->kode_entitas,
                    'kode_plant' => $p3k->kode_plant,
                    'no_p3k' => $p3k->no_p3k,
                    'kode_ruang' => $p3k->kode_ruang,
                    'lokasi' => $p3k->lokasi,
                    'jenis' => $p3k->jenis,
                    'kode_inventaris' => $p3k->kode_inventaris,
                    // Akses relasi dengan nama fungsi relasi yang baru
                    'entitas' => $p3k->entitasData ? ['nama' => $p3k->entitasData->nama] : null, // <-- GUNAKAN NAMA FUNGSI RELASI BARU
                    'plant_nama' => $p3k->plantData ? $p3k->plantData->nama : null, // <-- GUNAKAN NAMA FUNGSI RELASI BARU
                ];
            });

        return Inertia::render('master/p3k/page', [
            'masterP3k' => $data,
        ]);
    }

    /**
     * Menampilkan form input data Master P3K
     */
    public function create()
    {
        $plants = MasterPlant::select(
                'master_plant.id',
                'master_plant.nama as nama_plant',
                'master_plant.kode_entitas',
                'master_plant.kode_plant',
                'master_entitas.nama as entitas_nama'
            )
            ->leftJoin('master_entitas', 'master_plant.kode_entitas', '=', 'master_entitas.kode_entitas')
            ->orderBy('master_entitas.nama')
            ->get();

        return Inertia::render('master/p3k/create', [
            'plants' => $plants,
        ]);
    }

    /**
     * Simpan data Master P3K yang baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_entitas'      => 'required|string|max:10',
            'kode_plant'        => 'required|string|max:10',
            'no_p3k'            => 'required|string|max:50',
            'kode_ruang'        => 'required|string|max:100',
            'lokasi'            => 'required|string|max:255',
            'jenis'             => 'required|string|max:10',
            'kode_inventaris'   => 'required|string|max:100',
        ]);

        MasterP3k::create($validated);

        return redirect()->route('p3k.index')->with('success', 'Data P3K berhasil ditambahkan.');
    }

    
    public function edit(MasterP3k $p3k)
    {
        // Perbarui nama relasi 
        $p3k->load([
            'entitasData:kode_entitas,nama', 
            'plantData:kode_plant,nama'      
        ]);

        $plants = MasterPlant::select(
                'master_plant.id',
                'master_plant.nama as nama_plant',
                'master_plant.kode_entitas',
                'master_plant.kode_plant',
                'master_entitas.nama as entitas_nama'
            )
            ->leftJoin('master_entitas', 'master_plant.kode_entitas', '=', 'master_entitas.kode_entitas')
            ->orderBy('master_entitas.nama')
            ->get();

        return Inertia::render('master/p3k/edit', [
            'masterP3k' => $p3k,
            'plants' => $plants,
        ]);
    }

    /**
     * Perbarui data Master P3K
     */
    public function update(Request $request, MasterP3k $p3k)
    {
        $validated = $request->validate([
            'kode_entitas'      => 'required|string|max:10',
            'kode_plant'        => 'required|string|max:10',
            'no_p3k'            => 'required|string|max:50',
            'kode_ruang'        => 'required|string|max:100',
            'lokasi'            => 'required|string|max:255',
            'jenis'             => 'required|string|max:10',
            'kode_inventaris'   => 'required|string|max:100',
        ]);

        $p3k->update($validated);

        return redirect()->route('p3k.index')->with('success', 'Data P3K berhasil diperbarui.');
    }

    /**
     * Hapus data Master P3K
     */
    public function destroy(MasterP3k $p3k)
    {
        $p3k->delete();

        return redirect()->route('p3k.index')->with('success', 'Data P3K berhasil dihapus.');
    }
}