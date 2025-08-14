<?php

namespace App\Http\Controllers;

use App\Models\AcInspection;
use App\Models\Master\MasterAc;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class AcInspectionController extends Controller
{
    private function authorizeRole(array $roles)
    {
        if (Auth::user() && !Auth::user()->hasAnyRole($roles)) {
            abort(403, 'Anda tidak memiliki izin untuk melakukan aksi ini.');
        }
    }

    public function index()
    {
        // [REVISI] Mengadopsi logika paginasi dinamis dari FirstAidController.
        $query = AcInspection::with([
            'approvalStatus',
            'plant',
            'entity',
            'location',
            'createdBy.role'
        ])
            ->latest('inspection_date');

        // Hitung total data untuk ditampilkan dalam satu halaman.
        $totalRecords = (clone $query)->count();
        $paginator = $query->paginate($totalRecords > 0 ? $totalRecords : 15);

        // Transformasi data secara manual untuk memastikan relasi terkirim.
        $inspections = $paginator->through(function ($inspection) {
            return [
                'id' => $inspection->id,
                'uuid' => $inspection->uuid,
                'car_auto_number' => $inspection->car_auto_number,
                'inspection_date' => $inspection->inspection_date,
                'created_at' => $inspection->created_at,
                'approval_status_code' => $inspection->approval_status_code,
                'entity' => $inspection->entity,
                'plant' => $inspection->plant,
                'location' => $inspection->location,
                'approvalStatus' => $inspection->approvalStatus,
                'createdBy' => $inspection->createdBy ? [
                    'name' => $inspection->createdBy->name,
                    'role' => $inspection->createdBy->role,
                ] : null,
            ];
        });

        return Inertia::render('inspection/ac/page', [
            'inspections' => $inspections,
        ]);
    }

    // ... Sisa method lainnya tidak perlu diubah ...
    
    private array $maintenanceStatuses = [
        ['value' => 'Perbaikan', 'name' => 'Perbaikan'],
        ['value' => 'Perawatan', 'name' => 'Perawatan'],
    ];

    private array $conditionTypes = [
        ['value' => 'Baik', 'name' => 'Baik'],
        ['value' => 'Rusak', 'name' => 'Rusak'],
    ];

    public function create()
    {
        $this->authorizeRole(['SuperAdmin', 'Technician']);
        return Inertia::render('inspection/ac/create', [
            'masterAcs' => MasterAc::select('id', 'inventory_code', 'merk', 'room')->get(),
            'maintenanceStatuses' => $this->maintenanceStatuses,
            'conditionTypes' => $this->conditionTypes,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeRole(['SuperAdmin', 'Technician']);
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
            $prefix = 'KFHO/AC';
            $today = Carbon::now();
            $datePart = $today->format('d/m/Y');
            $count = AcInspection::whereYear('created_at', $today->year)
                                 ->whereMonth('created_at', $today->month)
                                 ->count();
            $sequenceNumber = str_pad($count + 1, 3, '0', STR_PAD_LEFT);
            $carAutoNumber = "{$prefix}/{$sequenceNumber}/{$datePart}";
            $inspection = AcInspection::create([
                'uuid' => (string) Str::uuid(),
                'car_auto_number' => $carAutoNumber,
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

    public function show(string $uuid)
    {
        $inspection = AcInspection::where('uuid', $uuid)
            ->with(['approvalStatus', 'plant', 'entity', 'location', 'items.masterAc', 'createdBy.role', 'approvedBy'])
            ->firstOrFail();
        return Inertia::render('inspection/ac/show', [
            'inspection' => $inspection,
        ]);
    }

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

    public function print($uuid)
    {
        $inspection = AcInspection::where('uuid', $uuid)->with(['approvalStatus', 'plant', 'entity', 'location', 'items', 'createdBy', 'approvedBy'])->firstOrFail();
        $pdf = Pdf::loadView('pdf.ac_inspection', compact('inspection'));
        return $pdf->stream('Laporan-Inspeksi-AC.pdf');
    }
}
