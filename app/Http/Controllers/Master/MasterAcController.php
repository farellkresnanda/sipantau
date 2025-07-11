<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterAc;
use App\Models\Master\MasterPlant;
use App\Exports\MasterAcExport;
use App\Imports\MasterAcImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterAcController extends Controller
{
    /**
     * Tampilkan daftar data Master AC.
     */
    public function index()
    {
        $data = MasterAc::with([
                'entitasData:kode_entitas,nama',
                'plantData:kode_plant,nama',
            ])
            ->latest()
            ->get()
            ->map(function ($ac) {
                return [
                    'id' => $ac->id,
                    'kode_entitas' => $ac->kode_entitas,
                    'kode_plant' => $ac->kode_plant,
                    'ruang' => $ac->ruang,
                    'kode_inventaris' => $ac->kode_inventaris,
                    'merk' => $ac->merk,
                    'entitas' => $ac->entitasData ? ['nama' => $ac->entitasData->nama] : null,
                    'plant_nama' => $ac->plantData ? $ac->plantData->nama : null,
                ];
            });

        return Inertia::render('master/ac/page', [
            'acList' => $data,
        ]);
    }

    /**
     * Tampilkan form tambah data Master AC.
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

        return Inertia::render('master/ac/create', [
            'plants' => $plants,
        ]);
    }

    /**
     * Simpan data Master AC baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_entitas' => 'required|string|max:10',
            'kode_plant' => 'required|string|max:10',
            'ruang' => 'required|string|max:100',
            'kode_inventaris' => 'required|string|max:100',
            'merk' => 'required|string|max:100',
        ]);

        MasterAc::create($validated);
        activity()->log('User created a new Master AC');

        return redirect()->route('ac.index')->with('success', 'Data Master AC berhasil ditambahkan.');
    }

    /**
     * Tampilkan form edit data Master AC.
     */
    public function edit($id)
    {
        $ac = MasterAc::with([
                'entitasData:kode_entitas,nama',
                'plantData:kode_plant,nama',
            ])
            ->findOrFail($id);

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

        return Inertia::render('master/ac/edit', [
            'masterAc' => $ac,
            'plants' => $plants,
        ]);
    }

    /**
     * Perbarui data Master AC.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'kode_entitas' => 'required|string|max:10',
            'kode_plant' => 'required|string|max:10',
            'ruang' => 'required|string|max:100',
            'kode_inventaris' => 'required|string|max:100',
            'merk' => 'required|string|max:100',
        ]);

        $ac = MasterAc::findOrFail($id);
        $ac->update($validated);

        activity()->log('User updated Master AC');

        return redirect()->route('ac.index')->with('success', 'Data Master AC berhasil diperbarui.');
    }

    /**
     * Hapus data Master AC.
     */
    public function destroy($id)
    {
        $ac = MasterAc::findOrFail($id);
        $ac->delete();

        activity()->log('User deleted Master AC');

        return redirect()->route('ac.index')->with('success', 'Data Master AC berhasil dihapus.');
    }

    /**
     * Export data ke file Excel.
     */
    public function export()
    {
        activity()->log('User exported Master AC to Excel');
        return Excel::download(new MasterAcExport, 'master_ac.xlsx');
    }

    /**
     * Import data dari file Excel.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        try {
            Excel::import(new MasterAcImport, $request->file('file'));
            activity()->log('User imported Master AC from Excel');
            return redirect()->route('ac.index')->with('success', 'Data Master AC berhasil diimpor.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal impor: ' . $e->getMessage());
        }
    }
}
