<?php

namespace App\Http\Controllers;

use App\Models\AparInspection;
use App\Models\AparInspectionItem;
use App\Models\Finding;
use App\Models\Master\MasterApar;
use App\Models\Master\MasterAparCheckItem;
use App\Models\Master\MasterEntity;
use App\Models\Master\MasterPlant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AparInspectionController extends Controller
{
    /**
     * Tampilkan semua inspeksi APAR.
     */
    public function index()
    {
        $aparInspections = AparInspection::with(['approvalStatus', 'plant', 'items.checkItem', 'entity', 'apar', 'createdBy'])
            ->latest()
            ->get();

        return inertia('inspection/apar/page', [
            'aparInspections' => $aparInspections,
        ]);
    }

    /**
     * Tampilkan form untuk membuat inspeksi baru.
     */
    public function create()
    {
        $apars = MasterApar::all();

        return inertia('inspection/apar/create', [
            'apars' => $apars,
        ]);
    }


    /**
     * Simpan inspeksi baru ke database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'apar_id' => 'required|exists:master_apars,id',
            'date' => 'required|date',
            'expired_year' => 'required|integer',
            'apar_inspection_items' => 'required|json',
        ]);

        DB::beginTransaction();

        try {
            $apar = MasterApar::findOrFail($validated['apar_id']);
            $code = auth()->user()->plant->alias_name . '/APAR/' . sprintf('%03d', AparInspection::count() + 1) . '/' . now()->format('d/m/Y');

            $inspection = AparInspection::create([
                'uuid' => (string) Str::uuid(),
                'code' => $code,
                'approval_status_code' => 'SOP', // Status Open
                'apar_id' => $validated['apar_id'],
                'date_inspection' => $validated['date'],
                'expired_year' => $validated['expired_year'],
                'plant_code' => $apar->plant_code,
                'entity_code' => $apar->entity_code,
                'note' => $request->note,
                'created_by' => Auth::id(),
            ]);

            $items = json_decode($request->input('apar_inspection_items'), true);

            foreach ($items as $item) {
                $inspection->items()->create([
                    'apar_inspection_id' => $inspection->id,
                    'month' => $item['month'],
                    'field' => $item['field'],
                    'value' => $item['value'],
                ]);
            }

            DB::commit();
            return redirect()->route('inspection.apar.index')->with('success', 'Inspeksi berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['message' => 'Gagal menyimpan inspeksi: ' . $e->getMessage()]);
        }
    }

    /**
     * Tampilkan detail inspeksi tertentu.
     */
    public function show($uuid)
    {
        $aparInspection = AparInspection::where('uuid', $uuid)
            ->with(['approvalStatus', 'plant', 'entity', 'apar', 'items.checkItem', 'createdBy'])
            ->firstOrFail();

        return inertia('inspection/apar/show', [
            'aparInspection' => $aparInspection,
        ]);
    }

    /**
     * Tampilkan form edit inspeksi.
     */
    public function edit(AparInspection $aparInspection)
    {
        $aparInspection->load(['items.checkItem']);

        return inertia('inspection/apar/edit', [
            'aparInspection' => $aparInspection,
            'apars' => MasterApar::all(),
            'checkItems' => MasterAparCheckItem::all(),
        ]);
    }

    /**
     * Update data inspeksi.
     */
    public function update(Request $request, AparInspection $aparInspection)
    {
        $validated = $request->validate([
            'date_inspection' => 'required|date',
            'expired_year' => 'required|integer',
            'items' => 'required|array',
            'items.*.id' => 'nullable|integer|exists:apar_inspection_items,id',
            'items.*.apar_check_item_id' => 'required|exists:master_apar_check_items,id',
            'items.*.is_checked' => 'required|boolean',
        ]);

        DB::beginTransaction();
        try {
            $aparInspection->update([
                'date_inspection' => $validated['date_inspection'],
                'expired_year' => $validated['expired_year'],
            ]);

            foreach ($validated['items'] as $item) {
                AparInspectionItem::updateOrCreate(
                    ['id' => $item['id'] ?? null],
                    [
                        'apar_inspection_id' => $aparInspection->id,
                        'apar_check_item_id' => $item['apar_check_item_id'],
                        'is_checked' => $item['is_checked'],
                    ]
                );
            }

            DB::commit();

            return redirect()->route('apar-inspections.index')->with('success', 'Inspeksi berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['message' => 'Gagal memperbarui inspeksi.']);
        }
    }

    /**
     * Hapus inspeksi (soft delete).
     */
    public function destroy(AparInspection $aparInspection)
    {
        $aparInspection->delete();

        return redirect()->route('apar-inspections.index')->with('success', 'Inspeksi berhasil dihapus.');
    }
}
