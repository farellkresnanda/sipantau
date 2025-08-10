<?php

namespace App\Http\Controllers;

use App\Models\AcInspection;
use App\Models\Master\MasterAc;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class AcInspectionController extends Controller
{
    private array $maintenanceStatuses = [
        ['value' => 'Perbaikan', 'name' => 'Perbaikan'],
        ['value' => 'Perawatan', 'name' => 'Perawatan'],
    ];

    private array $conditionTypes = [
        ['value' => 'Baik', 'name' => 'Baik'],
        ['value' => 'Rusak', 'name' => 'Rusak'],
    ];

    /**
     * Menampilkan daftar semua laporan inspeksi AC yang telah dibuat.
     */
    public function index()
    {
        // [REVISI FINAL] Menghapus batasan kolom pada with() untuk memastikan relasi termuat penuh.
        $inspections = AcInspection::with([
            'approvalStatus',
            'plant',
            'entity',
            'location', // Ini adalah relasi ke MasterAc
            'createdBy'
        ])
        ->latest('inspection_date')
        ->paginate(10);

        return Inertia::render('inspection/ac/page', [
            'inspections' => $inspections,
        ]);
    }

    /**
     * Menampilkan form untuk membuat inspeksi baru.
     */
    public function create()
    {
        return Inertia::render('inspection/ac/create', [
            'masterAcs' => MasterAc::select('id', 'inventory_code', 'merk', 'room')->get(),
            'maintenanceStatuses' => $this->maintenanceStatuses,
            'conditionTypes' => $this->conditionTypes,
        ]);
    }

    /**
     * Menyimpan inspeksi baru ke database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'master_ac_id' => 'required|exists:master_acs,id',
            'inspection_date' => 'required|date',
            'maintenance_status' => 'required|string',
            'condition_status' => 'required|string',
            'notes' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();
        try {
            $masterAc = MasterAc::findOrFail($validated['master_ac_id']);
            $code = 'AC-INS/' . now()->format('Y/m/') . sprintf('%04d', AcInspection::whereYear('created_at', now()->year)->count() + 1);

            $inspection = AcInspection::create([
                'uuid' => (string) Str::uuid(),
                'ac_inspection_number' => $code,
                'approval_status_code' => 'SOP',
                'location_id' => $masterAc->id,
                'inspection_date' => $validated['inspection_date'],
                'plant_code' => $masterAc->plant_code,
                'entity_code' => $masterAc->entity_code,
                'created_by' => Auth::id(),
            ]);

            $inspection->items()->create([
                'master_ac_unit_id' => $validated['master_ac_id'],
                'maintenance_status' => $validated['maintenance_status'],
                'condition_status' => $validated['condition_status'],
                'notes' => $validated['notes'],
            ]);

            DB::commit();
            return redirect()->route('inspection.ac.index')->with('success', 'Inspeksi AC berhasil dibuat.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal menyimpan inspeksi AC: ' . $e->getMessage());
            return back()->withErrors(['message' => 'Gagal menyimpan inspeksi: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Menampilkan detail dari satu laporan inspeksi.
     */
    public function show(string $uuid)
    {
        $inspection = AcInspection::where('uuid', $uuid)
            ->with(['approvalStatus', 'plant', 'entity', 'location', 'items.masterAc', 'createdBy', 'approvedBy'])
            ->firstOrFail();

        return Inertia::render('inspection/ac/show', [
            'inspection' => $inspection,
        ]);
    }

    /**
     * Menampilkan form untuk mengedit inspeksi.
     */
    public function edit(AcInspection $acInspection)
    {
        $acInspection->load('items');
        return Inertia::render('inspection/ac/edit', [
            'inspection' => $acInspection,
            'masterAcs' => MasterAc::select('id', 'inventory_code', 'merk', 'room')->get(),
            'maintenanceStatuses' => $this->maintenanceStatuses,
            'conditionTypes' => $this->conditionTypes,
        ]);
    }

    /**
     * Memperbarui data inspeksi di database.
     */
    public function update(Request $request, AcInspection $acInspection)
    {
        $validated = $request->validate([
            'master_ac_id' => 'required|exists:master_acs,id',
            'inspection_date' => 'required|date',
            'maintenance_status' => 'required|string',
            'condition_status' => 'required|string',
            'notes' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();
        try {
            $masterAc = MasterAc::findOrFail($validated['master_ac_id']);
            $acInspection->update([
                'location_id' => $masterAc->id,
                'inspection_date' => $validated['inspection_date'],
                'plant_code' => $masterAc->plant_code,
                'entity_code' => $masterAc->entity_code,
            ]);

            $acInspection->items()->update([
                'master_ac_unit_id' => $validated['master_ac_id'],
                'maintenance_status' => $validated['maintenance_status'],
                'condition_status' => $validated['condition_status'],
                'notes' => $validated['notes'],
            ]);

            DB::commit();
            return redirect()->route('inspection.ac.index')->with('success', 'Inspeksi berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal update inspeksi AC: ' . $e->getMessage());
            return back()->withErrors(['message' => 'Gagal memperbarui inspeksi.'])->withInput();
        }
    }

    /**
     * Menghapus data inspeksi (soft delete).
     */
    public function destroy(AcInspection $acInspection)
    {
        try {
            $acInspection->delete();
            return redirect()->route('inspection.ac.index')->with('success', 'Inspeksi berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Gagal hapus inspeksi AC: ' . $e->getMessage());
            return back()->with('error', 'Gagal menghapus inspeksi.');
        }
    }

    /**
     * Memverifikasi sebuah laporan inspeksi.
     */
    public function verify(Request $request, $uuid)
    {
        $validated = $request->validate([
            'approval_status' => 'required|in:SAP,SRE',
            'note_validator' => 'required_if:approval_status,SRE|nullable|string|max:1000',
        ]);

        $inspection = AcInspection::where('uuid', $uuid)->firstOrFail();
        
        $inspection->update([
            'approval_status_code' => $validated['approval_status'],
            'note_validator' => $validated['note_validator'],
            'approved_at' => now(),
            'approved_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'Inspeksi berhasil diverifikasi.');
    }

    /**
     * Mencetak laporan inspeksi ke PDF.
     */
    public function print($uuid)
    {
        $inspection = AcInspection::where('uuid', $uuid)->with(['approvalStatus', 'plant', 'entity', 'location', 'items', 'createdBy', 'approvedBy'])->firstOrFail();
        $pdf = PDF::loadView('pdf.ac_inspection', compact('inspection'));
        return $pdf->stream('Laporan-Inspeksi-AC.pdf');
    }
}