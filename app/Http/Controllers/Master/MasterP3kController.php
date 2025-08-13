<?php

namespace App\Http\Controllers\Master;

use App\Exports\P3kExport;
use App\Http\Controllers\Controller;
use App\Imports\P3kImport;
use App\Models\Master\MasterP3k;
use App\Models\Master\MasterPlant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class MasterP3kController extends Controller
{
    /**
     * Menampilkan daftar data Master P3K
     */
    public function index()
    {
        $data = MasterP3k::query()
            // Perbarui name relasi di sini
            ->with([
                'entity:entity_code,name', // <-- GUNAKAN NAMA FUNGSI RELASI BARU
                'plant:plant_code,name',     // <-- GUNAKAN NAMA FUNGSI RELASI BARU
            ])
            ->latest()
            ->get()
            ->map(function ($p3k) {
                return [
                    'id' => $p3k->id,
                    'entity_code' => $p3k->entity_code,
                    'plant_code' => $p3k->plant_code,
                    'no_p3k' => $p3k->no_p3k,
                    'room_code' => $p3k->room_code,
                    'location' => $p3k->location,
                    'type' => $p3k->type,
                    'inventory_code' => $p3k->inventory_code,
                    // Akses relasi dengan name fungsi relasi yang baru
                    'entity' => $p3k->entity ? ['name' => $p3k->entity->name] : null, // <-- GUNAKAN NAMA FUNGSI RELASI BARU
                    'plant_name' => $p3k->plant ? $p3k->plant->name : null, // <-- GUNAKAN NAMA FUNGSI RELASI BARU
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
            'master_plants.id',
            'master_plants.name as name_plant',
            'master_plants.entity_code',
            'master_plants.plant_code',
            'master_entities.name as entity_name'
        )
            ->leftJoin('master_entities', 'master_plants.entity_code', '=', 'master_entities.entity_code')
            ->orderBy('master_entities.name')
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
            'entity_code' => 'required|string|max:10',
            'plant_code' => 'required|string|max:10',
            'no_p3k' => 'required|string|max:50',
            'room_code' => 'required|string|max:100',
            'location' => 'required|string|max:255',
            'type' => 'required|string|max:10',
            'inventory_code' => 'required|string|max:100',
        ]);

        MasterP3k::create($validated);

        return redirect()->route('p3k.index')->with('success', 'Data P3K berhasil ditambahkan.');
    }

    public function edit(MasterP3k $p3k)
    {
        // Perbarui name relasi
        $p3k->load([
            'entity:entity_code,name',
            'plant:plant_code,name',
        ]);

        $plants = MasterPlant::select(
            'master_plants.id',
            'master_plants.name as name_plant',
            'master_plants.entity_code',
            'master_plants.plant_code',
            'master_entities.name as entity_name'
        )
            ->leftJoin('master_entities', 'master_plants.entity_code', '=', 'master_entities.entity_code')
            ->orderBy('master_entities.name')
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
            'entity_code' => 'required|string|max:10',
            'plant_code' => 'required|string|max:10',
            'no_p3k' => 'required|string|max:50',
            'room_code' => 'required|string|max:100',
            'location' => 'required|string|max:255',
            'type' => 'required|string|max:10',
            'inventory_code' => 'required|string|max:100',
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

    public function import()
    {
        // dd('OKE')  ;
        return Inertia::render('master/p3k/import');
    }

    public function action_import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls',
        ]);

        Excel::import(new P3kImport, $request->file('file'));

        activity()->log('User import master P3K');

        return redirect()->route('p3k.index')
            ->with('success', 'Master P3K imported successfully.');
    }

    public function export()
    {
        return Excel::download(new P3kExport, 'master_data_p3k.xlsx');
    }
}
