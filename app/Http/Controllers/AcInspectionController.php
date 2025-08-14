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
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class AcInspectionController extends Controller
{
    // ... (metode lain seperti index, create, store tidak perlu diubah dari versi Anda) ...

    private function authorizeRole(array $roles)
    {
        if (Auth::user() && !Auth::user()->hasAnyRole($roles)) {
            abort(403, 'Anda tidak memiliki izin untuk melakukan aksi ini.');
        }
    }

    public function index()
    {
        $query = AcInspection::with([
            'approvalStatus',
            'plant',
            'entity',
            'location',
            'createdBy.role'
        ])
            ->latest('updated_at');

        $totalRecords = (clone $query)->count();
        $paginator = $query->paginate($totalRecords > 0 ? $totalRecords : 15);

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

    /**
     * [REVISI FINAL] Membangun data secara manual untuk memastikan semua relasi terkirim.
     * Ini adalah pendekatan paling andal dan meniru pola yang berhasil dari controller lain.
     */
    public function show(string $uuid)
    {
        // 1. Temukan model utama dan muat semua relasi yang diperlukan.
        $inspection = AcInspection::where('uuid', $uuid)
            ->firstOrFail()
            ->load([
                'approvalStatus',
                'plant',
                'entity',
                'items.masterAc',
                'createdBy',
                'approvedBy'
            ]);

        // 2. Buat array data secara manual untuk dikirim ke frontend.
        // Ini menciptakan "kontrak data" yang jelas dan menghindari masalah serialisasi.
        $inspectionData = [
            'uuid' => $inspection->uuid,
            'car_auto_number' => $inspection->car_auto_number,
            'inspection_date' => $inspection->inspection_date,
            'note_validator' => $inspection->note_validator,
            'approved_at' => $inspection->approved_at,
            
            // Menyertakan seluruh objek relasi
            'items' => $inspection->items,
            'approvalStatus' => $inspection->approvalStatus,
            'plant' => $inspection->plant,
            'entity' => $inspection->entity,
            'createdBy' => $inspection->createdBy,
            'approvedBy' => $inspection->approvedBy,
        ];

        // 3. Kirim array yang sudah pasti benar ke view.
        return Inertia::render('inspection/ac/show', [
            'acInspection' => $inspectionData,
        ]);
    }

    // ... (metode lainnya seperti edit, update, destroy, dll. tetap sama) ...

    public function create()
    {
        $this->authorizeRole(['SuperAdmin', 'Technician']);
        return Inertia::render('inspection/ac/create', [
            'masterAcs' => MasterAc::select('id', 'inventory_code', 'merk', 'room')->get(),
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
        
        $url = route('inspection.ac.show', $inspection->uuid);
            $fileName = 'ac-inspection-' . $inspection->uuid . '.svg';
            $filePath = 'qrcodes/' . $fileName;

            // Generate dan simpan QR Code ke folder storage
            QrCode::format('svg')->size(100)->generate($url, storage_path('app/public/' . $filePath));
            
            // Simpan path relatif ke database
            $inspection->update(['qr_code_path' => $filePath]);

        DB::commit();
        return redirect()->back()->with([
            'success' => 'Inspeksi AC berhasil dibuat.',
            'acInspectionCode' => $carAutoNumber,
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Gagal menyimpan inspeksi AC: ' . $e->getMessage());
        return back()->withErrors(['message' => 'Gagal menyimpan inspeksi: ' . $e->getMessage()])->withInput();
    }
}

    public function edit(string $uuid)
    {
        $acInspection = AcInspection::where('uuid', $uuid)
            ->with('items')
            ->firstOrFail();

        $inspectionData = [
            'uuid' => $acInspection->uuid,
            'inspection_date' => $acInspection->inspection_date,
            'items' => $acInspection->items->map(function ($item) {
                return [
                    'master_ac_unit_id' => $item->master_ac_unit_id,
                    'maintenance_status' => $item->maintenance_status,
                    'condition_status' => $item->condition_status,
                    'notes' => $item->notes,
                ];
            })->all(),
        ];

        return Inertia::render('inspection/ac/edit', [
            'inspection' => $inspectionData,
            'masterAcs' => MasterAc::select('id', 'inventory_code', 'merk', 'room')->get(),
        ]);
    }

    public function update(Request $request, string $uuid)
    {
        $acInspection = AcInspection::where('uuid', $uuid)->firstOrFail();

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
                'inspection_date' => $validated['inspection_date'],
                'location_id' => $masterAc->id,
                'plant_code' => $masterAc->plant_code,
                'entity_code' => $masterAc->entity_code,
                'approval_status_code' => 'SOP',
            ]);

            $item = $acInspection->items()->firstOrNew([]);
            
            $item->fill([
                'master_ac_unit_id' => $validated['master_ac_id'],
                'maintenance_status' => $validated['maintenance_status'],
                'condition_status' => $validated['condition_status'],
                'notes' => $validated['notes'],
            ])->save();

            DB::commit();
            return redirect()->route('inspection.ac.index')->with('success', 'Inspeksi berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal update inspeksi AC: ' . $e->getMessage());
            return back()->withErrors(['message' => 'Gagal memperbarui inspeksi.'])->withInput();
        }
    }

    public function destroy(AcInspection $ac)
    {
        try {
            $ac->delete();
            
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
            $clickedInspection = AcInspection::where('uuid', $uuid)->with('items.masterAc')->firstOrFail();
                if (!$clickedInspection->items->first()) {
                        abort(404, 'Data item inspeksi tidak ditemukan.');
                }
                $masterAc = $clickedInspection->items->first()->masterAc;
                $inspectionHistory = AcInspection::whereHas('items', function ($query) use ($masterAc) {
                            $query->where('master_ac_unit_id', $masterAc->id);
                })
                ->with(['items', 'createdBy']) // Muat relasi yang dibutuhkan
                ->orderBy('inspection_date', 'asc') // Urutkan dari terdahulu -> terbaru
                ->get();

                    $pdf = Pdf::loadView('pdf.ac', compact('masterAc', 'inspectionHistory'));
                    return $pdf->stream('Kartu-Pemeliharaan-AC-' . $masterAc->inventory_code . '.pdf');
    }
}
