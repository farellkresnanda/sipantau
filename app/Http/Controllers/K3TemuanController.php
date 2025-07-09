<?php

namespace App\Http\Controllers;

use App\Models\K3Temuan;
use App\Models\Master\MasterJenisKetidakSesuaian;
use Illuminate\Http\Request;
use Inertia\Inertia;

class K3TemuanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $k3temuans = K3Temuan::latest()->with(['jenisKetidaksesuaian', 'statusApproval', 'statusTemuan'])->get();
        return Inertia::render('k3temuan/page', compact('k3temuans'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $jenisKetidaksesuaian = MasterJenisKetidaksesuaian::select(
            'master_jenis_ketidaksesuaian.id',
            'master_jenis_ketidaksesuaian.nama as nama_ketidaksesuaian',
            'master_jenis_ketidaksesuaian_sub.id as sub_id',
            'master_jenis_ketidaksesuaian_sub.nama as sub_nama'
        )
            ->leftJoin('master_jenis_ketidaksesuaian_sub', 'master_jenis_ketidaksesuaian.id', '=', 'master_jenis_ketidaksesuaian_sub.jenis_ketidaksesuaian_id')
            ->orderBy('master_jenis_ketidaksesuaian.nama')
            ->get();

        return Inertia::render('k3temuan/create', compact('jenisKetidaksesuaian'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'jenis_ketidaksesuaian_id' => 'required|exists:master_jenis_ketidaksesuaian,id',
            'deskripsi_temuan' => 'required|string',
            'foto_temuan_sebelum' => 'required|image|mimes:jpg,jpeg,png|max:2048',
            'detail_lokasi_temuan' => 'required|string',
            'akar_masalah' => 'required|string'
        ]);

        $data = $request->except(['foto_temuan_sebelum']);

        if ($request->hasFile('foto_temuan_sebelum')) {
            $data['foto_temuan_sebelum'] = $request->file('foto_temuan_sebelum')->store('temuan-images', 'public');
        }

        K3Temuan::create(array_merge($data, [
            'kode_status_temuan' => 'SOP', // Open
            'kode_status_approval' => 'MVT', // Menunggu Verifikasi Tindakan
            'created_by' => auth()->id(),
            'nomor_car_auto' => 'KFHO/' . sprintf('%03d', K3Temuan::count() + 1) . '/' . now()->format('d/m/Y')
        ]));

        return redirect()->route('k3temuan.index')->with('success', 'Temuan created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $k3temuan = K3Temuan::with(['jenisKetidaksesuaian.jenisKetidaksesuaianSub', 'statusApproval', 'statusTemuan', 'CreatedBy'])->findOrFail($id);
        return Inertia::render('k3temuan/show', compact('k3temuan'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(K3Temuan $k3temuan)
    {
        return Inertia::render('k3temuan/edit', compact('k3temuan'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, K3Temuan $k3temuan)
    {
        $request->validate([
            'status_temuan' => 'required|string',
            'status_approval' => 'required|string',
            'nomor_car_auto' => 'required|string',
            'tanggal' => 'required|date',
            'jenis_ketidaksesuaian_id' => 'required|exists:jenis_ketidaksesuaians,id',
            'deskripsi_temuan' => 'required|string',
            'foto_temuan_sebelum' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'detail_lokasi_temuan' => 'required|string',
            'akar_masalah' => 'required|string',
            'nomor_car_manual' => 'required|string',
            'rencana_perbaikan' => 'required|string',
            'batas_waktu_perbaikan' => 'required|date',
            'tindakan_perbaikan' => 'required|string',
            'verifikasi_perbaikan' => 'required|string',
            'tanggal_verifikasi' => 'required|date',
            'catatan' => 'nullable|string',
            'foto_temuan_sesudah' => 'nullable|image|mimes:jpg,jpeg,png|max:2048'
        ]);

        $data = $request->except(['foto_temuan_sebelum', 'foto_temuan_sesudah']);

        if ($request->hasFile('foto_temuan_sebelum')) {
            if ($k3temuan->foto_temuan_sebelum) {
                \Storage::disk('public')->delete($k3temuan->foto_temuan_sebelum);
            }
            $data['foto_temuan_sebelum'] = $request->file('foto_temuan_sebelum')->store('temuan-images', 'public');
        }

        if ($request->hasFile('foto_temuan_sesudah')) {
            if ($k3temuan->foto_temuan_sesudah) {
                \Storage::disk('public')->delete($k3temuan->foto_temuan_sesudah);
            }
            $data['foto_temuan_sesudah'] = $request->file('foto_temuan_sesudah')->store('temuan-images', 'public');
        }

        $k3temuan->update($data);

        return redirect()->route('k3temuan.index')->with('success', 'Temuan updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(K3Temuan $k3temuan)
    {
        if ($k3temuan->foto_temuan_sebelum) {
            \Storage::disk('public')->delete($k3temuan->foto_temuan_sebelum);
        }
        if ($k3temuan->foto_temuan_sesudah) {
            \Storage::disk('public')->delete($k3temuan->foto_temuan_sesudah);
        }

        $k3temuan->delete();

        return redirect()->route('k3temuan.index')->with('success', 'Temuan deleted successfully.');
    }
}
