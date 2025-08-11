<?php

namespace App\Http\Controllers;

use App\Models\AparInspection;
use App\Models\AparInspectionItem;
use App\Models\Finding;
use App\Models\Master\MasterApar;
use App\Models\Master\MasterAparCheckItem;
use App\Models\Master\MasterEntity;
use App\Models\Master\MasterPlant;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

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
            return inertia('inspection/apar/create', [
                'aparInspectionCode' => $inspection->code,
            ]);
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
            ->with(['approvalStatus', 'plant', 'entity', 'apar', 'items.checkItem', 'createdBy', 'approvedBy'])
            ->firstOrFail();

        return inertia('inspection/apar/show', [
            'aparInspection' => $aparInspection,
        ]);
    }

    /**
     * Tampilkan form edit inspeksi.
     */
    public function edit($uuid)
    {
        $aparInspection = AparInspection::where('uuid', $uuid)
            ->with(['items.checkItem'])
            ->firstOrFail();
        $aparInspection->load(['items.checkItem']);

        $inspectionItems = $aparInspection->items
            ->map(function ($item) {
                return [
                    'month' => $item->month,
                    'field' => $item->field,
                    'value' => $item->value,
                ];
            })
            ->values();

        return inertia('inspection/apar/edit', [
            'aparInspection' => [
                'uuid' => $aparInspection->uuid,
                'id' => $aparInspection->id,
                'date' => $aparInspection->date_inspection,
                'apar_id' => (string) $aparInspection->apar_id,
                'expired_year' => (string) $aparInspection->expired_year,
                'location' => $aparInspection->location,
                'note' => $aparInspection->note,
            ],
            'inspectionItems' => $inspectionItems,
            'apars' => MasterApar::select('id', 'inventory_code', 'apar', 'location')->get(),
        ]);
    }


    /**
     * Update data inspeksi.
     */
    public function update(Request $request, $uuid)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'expired_year' => 'required|integer',
            'apar_inspection_items' => 'required|json',
        ]);


        DB::beginTransaction();
        try {
            $aparInspection = AparInspection::where('uuid', $uuid)->firstOrFail();
            $aparInspection->update([
                'date_inspection' => $validated['date'],
                'expired_year' => $validated['expired_year'],
                'note' => $request->note,
            ]);

            $items = json_decode($request->input('apar_inspection_items'), true);

            // Delete existing items
            $aparInspection->items()->delete();

            // Create new items
            foreach ($items as $item) {
                $aparInspection->items()->create([
                    'apar_inspection_id' => $aparInspection->id,
                    'month' => $item['month'],
                    'field' => $item['field'],
                    'value' => $item['value'],
                ]);
            }

            DB::commit();

            return redirect()->route('inspection.apar.index')->with('success', 'APAR inspection updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['message' => 'Gagal memperbarui inspeksi. ' . $e->getMessage()]);
        }
    }

    /**
     * Hapus inspeksi (soft delete).
     */
    public function destroy(AparInspection $aparInspection)
    {
        $aparInspection->delete();

        return redirect()->route('inspection.apar.index')->with('success', 'Inspeksi berhasil dihapus.');
    }

    /**
     * Approve the specified resource.
     */
    public function verify(Request $request, $uuid)
    {
        $aparInspection = AparInspection::where('uuid', $uuid)->firstOrFail();
        $user_id = auth()->id();

        // Check if the inspection is already approved
        if ($aparInspection->approval_status_code === 'SAP') {
            return redirect()->back()->with('error', 'This APAR Inspection has already been approved.');
        }

        // Generate QR Code untuk apar ini
        $qrCodeFolder = 'qrcodes/apar';
        $qrFileName = 'apar-' . $aparInspection->id . '-approval-' . auth()->id() . '.png';
        $qrCodePath = $qrCodeFolder . '/' . $qrFileName;
        $fullPath = storage_path('app/public/' . $qrCodePath);

        // Buat folder jika belum ada
        if (!file_exists(dirname($fullPath))) {
            mkdir(dirname($fullPath), 0755, true);
        }

        // Data yang akan dimasukkan ke QR Code
        $qrContent = route('inspection.apar.show', $aparInspection->uuid) . '?verified_by=' . $user_id . '&stage=' . 'SAP';

        // Generate QR
        QrCode::format('png')->size(200)->generate($qrContent, $fullPath);

        // Update the approval status to 'SAP'
        $aparInspection->update([
            'approval_status_code' => $request->approval_status,
            'note_validator' => $request->note ?? null,
            'approved_at' => now(),
            'approved_by' => $user_id,
            'qr_code_path' => $qrCodePath,
        ]);

        return redirect()->back()->with('success', 'APAR Inspection approved successfully.');
    }

    /**
     * Print the APAR details.
     */
    public function print($uuid)
    {
        $aparInspection = AparInspection::where('uuid', $uuid)
            ->with(['approvalStatus', 'plant', 'entity', 'apar', 'items', 'createdBy'])
            ->firstOrFail();

        $pdf = PDF::loadView('pdf.apar', compact('aparInspection'))
            ->setPaper('a4', 'portrait');

        return $pdf->stream('Inspeksi-APAR-' . $uuid . '.pdf');
    }
}
