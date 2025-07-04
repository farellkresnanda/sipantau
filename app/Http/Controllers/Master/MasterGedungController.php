<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterGedung;    // Import model MasterGedung
use App\Models\Master\MasterPlant;     // Import model MasterPlant
use App\Models\Master\MasterEntitas;   // Import model MasterEntitas
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterGedungController extends Controller
{
    /**
     * Menampilkan daftar data Master Gedung
     */
    public function index()
    {
        $data = MasterGedung::query()
            ->with([
                'entitasData:kode_entitas,nama', // Memuat relasi entitas
                'plantData:kode_plant,nama',     // Memuat relasi plant
            ])
            ->latest() // Mengurutkan data terbaru
            ->get()
            ->map(function ($gedung) {
                // Memformat data agar sesuai dengan kebutuhan frontend (columns.tsx)
                return [
                    'id' => $gedung->id,
                    'kode_entitas' => $gedung->kode_entitas,
                    'kode_plant' => $gedung->kode_plant,
                    'nama_lokasi' => $gedung->nama_lokasi,
                    // Mengambil nama dari relasi, dengan fallback '-' jika relasi null
                    'entitas_nama' => $gedung->entitasData ? $gedung->entitasData->nama : '-',
                    'plant_nama' => $gedung->plantData ? $gedung->plantData->nama : '-',
                ];
            });

        // dd($data); // Anda bisa mengaktifkan ini untuk melihat data yang dikirim ke frontend

        return Inertia::render('master/gedung/page', [
            'masterGedung' => $data,
        ]);
    }

    /**
     * Menampilkan form input data Master Gedung
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

        return Inertia::render('master/gedung/create', [
            'plants' => $plants,
        ]);
    }

    /**
     * Simpan data Master Gedung yang baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_entitas' => 'required|string|max:10',
            'kode_plant'   => 'required|string|max:10',
            'nama_lokasi'  => 'required|string|max:255',
        ]);

        MasterGedung::create($validated);

        return redirect()->route('gedung.index')->with('success', 'Data Gedung berhasil ditambahkan.');
    }

    /**
     * Tampilkan halaman edit data Master Gedung
     */
    public function edit(MasterGedung $gedung)
    {
        $gedung->load([
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

        return Inertia::render('master/gedung/edit', [
            'masterGedung' => $gedung,
            'plants' => $plants,
        ]);
    }

    /**
     * Perbarui data Master Gedung
     */
    public function update(Request $request, MasterGedung $gedung)
    {
        $validated = $request->validate([
            'kode_entitas' => 'required|string|max:10',
            'kode_plant'   => 'required|string|max:10',
            'nama_lokasi'  => 'required|string|max:255',
        ]);

        $gedung->update($validated);

        return redirect()->route('gedung.index')->with('success', 'Data Gedung berhasil diperbarui.');
    }

    /**
     * Hapus data Master Gedung
     */
    public function destroy(MasterGedung $gedung)
    {
        $gedung->delete();

        return redirect()->route('gedung.index')->with('success', 'Data Gedung berhasil dihapus.');
    }
}
