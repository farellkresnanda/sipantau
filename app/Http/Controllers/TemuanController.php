<?php

namespace App\Http\Controllers;

use App\Models\Temuan;
use App\Models\Master\MasterJenisKetidaksesuaian;
use App\Models\TemuanApprovalRiwayat;
use App\Models\TemuanApprovalTahapan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TemuanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $temuans = Temuan::latest()->with(['jenisKetidaksesuaian', 'temuanStatus'])->get();
        return Inertia::render('temuan/page', compact('temuans'));
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

        return Inertia::render('temuan/create', compact('jenisKetidaksesuaian'));
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

        DB::transaction(function () use ($request) {
            $data = $request->except(['foto_temuan_sebelum']);

            if ($request->hasFile('foto_temuan_sebelum')) {
                $data['foto_temuan_sebelum'] = $request->file('foto_temuan_sebelum')->store('temuan-images', 'public');
            }

            // Generate CAR number (you may want to extract this logic into a service later)
            $carNumber = 'KFHO/' . sprintf('%03d', Temuan::count() + 1) . '/' . now()->format('d/m/Y');

            // Create the temuan
            $temuan = Temuan::create(array_merge($data, [
                'kode_temuan_status' => 'SOP', // Status Open
                'created_by' => auth()->id(),
                'nomor_car_auto' => $carNumber
            ]));

            // Get all approval stages, ordered
            $tahapan = TemuanApprovalTahapan::orderBy('urutan')->get();

            foreach ($tahapan as $row) {
                TemuanApprovalRiwayat::create([
                    'temuan_id' => $temuan->id,
                    'tahap' => $row->tahap,
                    'status_approval' => 'PENDING',
                    'verified_by' => null,
                    'verified_at' => null,
                    'catatan' => null,
                ]);
            }
        });

        return redirect()->route('temuan.index')->with('success', 'Temuan created successfully and approval flow initialized.');
    }


    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $temuan = Temuan::with(['jenisKetidaksesuaian','jenisKetidaksesuaianSub', 'temuanApprovalRiwayat', 'temuanStatus', 'createdBy'])->findOrFail($id);
        return Inertia::render('temuan/show', compact('temuan'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Temuan $temuan)
    {
        return Inertia::render('temuan/edit', compact('temuan'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Temuan $temuan)
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
            if ($temuan->foto_temuan_sebelum) {
                \Storage::disk('public')->delete($temuan->foto_temuan_sebelum);
            }
            $data['foto_temuan_sebelum'] = $request->file('foto_temuan_sebelum')->store('temuan-images', 'public');
        }

        if ($request->hasFile('foto_temuan_sesudah')) {
            if ($temuan->foto_temuan_sesudah) {
                \Storage::disk('public')->delete($temuan->foto_temuan_sesudah);
            }
            $data['foto_temuan_sesudah'] = $request->file('foto_temuan_sesudah')->store('temuan-images', 'public');
        }

        $temuan->update($data);

        return redirect()->route('temuan.index')->with('success', 'Temuan updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Temuan $temuan)
    {
        if ($temuan->foto_temuan_sebelum) {
            \Storage::disk('public')->delete($temuan->foto_temuan_sebelum);
        }
        if ($temuan->foto_temuan_sesudah) {
            \Storage::disk('public')->delete($temuan->foto_temuan_sesudah);
        }

        $temuan->delete();

        return redirect()->route('temuan.index')->with('success', 'Temuan deleted successfully.');
    }
}
