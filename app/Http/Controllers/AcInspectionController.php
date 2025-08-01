<?php

namespace App\Http\Controllers;

use App\Models\{
    AcInspection,          // Model Inspeksi AC
    AcInspectionItem,      // Model Item Inspeksi AC
    ApprovalStatus,        // Untuk status persetujuan
    Master\MasterEntity,   // Untuk entitas
    Master\MasterPlant,    // Untuk plant (digunakan untuk prefix nomor inspeksi)
    Master\MasterAc,      // Untuk lokasi
    User                   // Untuk created_by dan approved_by
};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{ Auth, DB, Log };
use Illuminate\Support\Str;
use Inertia\Inertia;

class AcInspectionController extends Controller
{
    /**
     * Define hardcoded status/condition options for frontend.
     * These will be passed to create/edit forms.
     */
    private array $maintenanceStatuses = [
        ['name' => 'Baik', 'value' => 'Baik'],
        ['name' => 'Rusak', 'value' => 'Rusak'],
        ['name' => 'Perawatan', 'value' => 'Perawatan'],
    ];

    private array $conditionTypes = [
        ['name' => 'Baik', 'value' => 'Baik'],
        ['name' => 'Rusak', 'value' => 'Rusak'],
        ['name' => 'N/A', 'value' => 'N/A'],
    ];

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $inspections = AcInspection::with([
            'entity:id,entity_code,name', // Pastikan relasi entity ada di AcInspection Model
            'plant:id,plant_code,name',   // Pastikan relasi plant ada di AcInspection Model
            'location:id,location,inventory_code',
            'approvalStatus:id,code,name',
            'createdBy:id,name',
        ])
        ->select([
            'id', 'uuid', 'car_auto_number', 'inspection_date', 'entity_id', // Menggunakan entity_id (BIGINT UNSIGNED)
            'plant_id', 'location_id', 'approval_status_code', 'created_by', 'created_at', // Menggunakan plant_id (BIGINT UNSIGNED)
            'notes',
        ])
        ->orderBy('created_at', 'desc')
        ->paginate(10);

        return Inertia::render('inspection/ac/page', [
            'inspections' => $inspections,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('inspection/ac/create', [
            'locations' => MasterAc::select('id', 'location', 'inventory_code', 'entity_code', 'plant_code')->get(),
            // === PENTING: Perhatikan seleksi kolom untuk MasterEntity dan MasterPlant ===
            // Jika entity_id/plant_id di ac_inspections adalah FK ke id, maka kirim ID juga.
            'entities' => MasterEntity::select('id', 'entity_code', 'name')->get(), // Mengambil ID untuk FK
            'plants' => MasterPlant::select('id', 'plant_code', 'name', 'alias_name')->get(), // Mengambil ID dan alias_name
            // =======================================================================
            'maintenanceStatuses' => $this->maintenanceStatuses,
            'conditionTypes' => $this->conditionTypes,
            // Jika ada master unit AC (dari spreadsheet), Anda akan memuatnya di sini
            // 'masterAcUnits' => MasterAcUnit::select('id', 'inventory_code', 'ac_number', 'brand', 'location_room')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Log::info('Request data received for AC Inspection store:', $request->all());

        $validationRules = [
            'inspection_date' => 'required|date',
            'entity_id' => 'required|integer|exists:master_entities,id', // Validasi entity_id (integer FK)
            'plant_id' => 'required|integer|exists:master_plants,id',     // Validasi plant_id (integer FK)
            'location_id' => 'required|integer|exists:master_acs,id',
            'notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.master_ac_unit_id' => 'required|integer|exists:nama_tabel_master_ac_anda,id', // Harus sesuai dengan nama tabel master AC Anda
            'items.*.maintenance_status' => 'nullable|string|max:255',
            'items.*.condition_status' => 'nullable|string|max:255',
            'items.*.notes' => 'nullable|string|max:1000',
        ];

        try {
            $validated = $request->validate($validationRules);
            Log::info('Validated data before processing:', $validated);

            DB::beginTransaction();

            // Logika pembuatan AC Inspection Number (menggunakan car_auto_number)
            $masterPlant = MasterPlant::find($validated['plant_id']); // Cari plant berdasarkan ID
            $prefix = $masterPlant->alias_name ?? 'UNKNOWN'; // Gunakan alias_name dari MasterPlant

            $today = now()->toDateString();
            $runningNumber = AcInspection::where('entity_id', $validated['entity_id']) // Filter berdasarkan entity_id
                ->whereDate('created_at', $today)
                ->count() + 1;

            $carAutoNumber = sprintf('%s/AC/%03d/%s', $prefix, $runningNumber, now()->format('d/m/Y')); // Format tetap untuk AC

            $inspectionData = [
                'uuid' => (string) Str::uuid(),
                'inspection_date' => $validated['inspection_date'],
                'car_auto_number' => $carAutoNumber, // Disimpan di kolom car_auto_number
                'notes' => $validated['notes'],
                'entity_id' => $validated['entity_id'], // Disimpan sebagai ID entitas
                'plant_id' => $validated['plant_id'],   // Disimpan sebagai ID plant
                'location_id' => $validated['location_id'],
                'approval_status_code' => 'SOP',
                'created_by' => Auth::id(),
            ];

            $inspection = AcInspection::create($inspectionData);

            foreach ($validated['items'] as $itemData) {
                $inspection->items()->create([
                    'master_ac_unit_id' => $itemData['master_ac_unit_id'],
                    'maintenance_status' => $itemData['maintenance_status'],
                    'condition_status' => $itemData['condition_status'],
                    'notes' => $itemData['notes'],
                ]);
            }

            DB::commit();

            return redirect()->route('inspection.ac.index')->with('success', 'Inspeksi AC berhasil disimpan.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::error('Validation Error in AC Inspection store:', $e->errors());
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal menyimpan AC Inspection:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Gagal menyimpan inspeksi AC: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $uuid)
    {
        try {
            $inspection = AcInspection::with([
                'entity:id,name', // Eager load entity by ID
                'plant:id,name,alias_name', // Eager load plant by ID
                'location:id,location,inventory_code',
                'createdBy:id,name',
                'approvedBy:id,name',
                'approvalStatus:id,code,name',
                'items.masterAcUnit', // Eager load relasi ke Master AC Unit
            ])->where('uuid', $uuid)->firstOrFail();

            return Inertia::render('inspection/ac/show', [
                'acInspection' => $inspection,
                'validatorNote' => $inspection->note_validator,
                'approvedBy' => $inspection->approvedBy?->name,
                'creatorNameProp' => $inspection->createdBy->name ?? 'Nama Tidak Tersedia',
                'entityNameProp' => $inspection->entity->name ?? 'N/A', // Tambah prop untuk nama entitas
                'plantNameProp' => $inspection->plant->name ?? 'N/A',   // Tambah prop untuk nama plant
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('AC Inspection not found:', ['uuid' => $uuid, 'error' => $e->getMessage()]);
            return redirect()->route('inspection.ac.index')->with('error', 'Inspeksi AC tidak ditemukan.');
        } catch (\Exception $e) {
            Log::error('Error showing AC Inspection:', ['uuid' => $uuid, 'error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return redirect()->route('inspection.ac.index')->with('error', 'Terjadi kesalahan saat menampilkan detail AC Inspeksi.');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $uuid)
    {
        try {
            $inspection = AcInspection::with([
                'entity', 'plant', 'location', 'items.masterAcUnit'
            ])->where('uuid', $uuid)->firstOrFail();

            return Inertia::render('inspection/ac/edit', [
                'inspection' => $inspection,
                'locations' => MasterAc::select('id', 'location', 'inventory_code', 'entity_code', 'plant_code')->get(),
                'entities' => MasterEntity::select('id', 'entity_code', 'name')->get(), // Ambil ID entitas
                'plants' => MasterPlant::select('id', 'plant_code', 'name', 'alias_name')->get(), // Ambil ID plant
                'maintenanceStatuses' => $this->maintenanceStatuses,
                'conditionTypes' => $this->conditionTypes,
                // Tambah master unit AC jika form edit perlu daftar penuh untuk pilihan
                // 'masterAcUnits' => MasterAcUnit::select('id', 'inventory_code', 'ac_number', 'brand', 'location_room', 'entity_code', 'plant_code')->get(), // Ambil semua data yang relevan
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('AC Inspection not found for edit:', ['uuid' => $uuid, 'error' => $e->getMessage()]);
            return redirect()->route('inspection.ac.index')->with('error', 'Inspeksi AC tidak ditemukan untuk diedit.');
        } catch (\Exception $e) {
            Log::error('Error showing AC Inspection edit form:', ['uuid' => $uuid, 'error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return redirect()->route('inspection.ac.index')->with('error', 'Terjadi kesalahan saat menampilkan form edit AC Inspeksi.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $uuid)
    {
        $validationRules = [
            'inspection_date' => 'required|date',
            'entity_id' => 'required|integer|exists:master_entities,id', // Validasi ID entitas
            'plant_id' => 'required|integer|exists:master_plants,id',     // Validasi ID plant
            'location_id' => 'required|integer|exists:master_acs,id',
            'notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.master_ac_unit_id' => 'required|integer|exists:nama_tabel_master_ac_anda,id', // Harus sesuai dengan nama tabel master AC Anda
            'items.*.maintenance_status' => 'nullable|string|max:255',
            'items.*.condition_status' => 'nullable|string|max:255',
            'items.*.notes' => 'nullable|string|max:1000',
        ];

        try {
            $validated = $request->validate($validationRules);
            $inspection = AcInspection::where('uuid', $uuid)->firstOrFail();

            DB::beginTransaction();

            $inspection->update([
                'inspection_date' => $validated['inspection_date'],
                'notes' => $validated['notes'],
                'entity_id' => $validated['entity_id'],
                'plant_id' => $validated['plant_id'],
                'location_id' => $validated['location_id'],
            ]);

            $inspection->items()->delete();
            foreach ($validated['items'] as $itemData) {
                $inspection->items()->create($itemData);
            }

            DB::commit();

            return redirect()->route('inspection.ac.index')->with('success', 'Inspeksi AC berhasil diperbarui.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::error('Validation Error in AC Inspection update:', $e->errors());
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal memperbarui AC Inspection:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Gagal memperbarui inspeksi AC: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $uuid)
    {
        try {
            $inspection = AcInspection::where('uuid', $uuid)->firstOrFail();
            $inspection->delete(); // Menggunakan soft delete

            return back()->with('success', 'Inspeksi AC berhasil dihapus.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('AC Inspection not found for delete:', ['uuid' => $uuid, 'error' => $e->getMessage()]);
            return back()->with('error', 'Inspeksi AC tidak ditemukan untuk dihapus.');
        } catch (\Exception $e) {
            Log::error('Error deleting AC Inspection:', ['uuid' => $uuid, 'error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Gagal menghapus inspeksi AC: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Verify the specified AC Inspection.
     */
    public function verify(Request $request, string $uuid)
    {
        $request->validate([
            'approval_status' => 'required|in:SAP,SRE',
            'note_validator' => 'required_if:approval_status,SRE|string|max:255',
        ], [
            'note_validator.required_if' => 'Catatan wajib diisi jika inspeksi ditolak.',
        ]);

        $inspection = AcInspection::where('uuid', $uuid)->firstOrFail();

        try {
            $inspection->update([
                'approval_status_code' => $request->approval_status,
                'note_validator' => $request->note_validator,
                'approved_by' => Auth::id(),
                'approved_at' => now(),
            ]);

            return back()->with([
                'type' => 'success',
                'message' => 'Inspeksi AC berhasil diverifikasi.',
            ]);
        } catch (\Throwable $th) {
            report($th);
            Log::error('Verification error in AC Inspection Controller:', [
                'error' => $th->getMessage(),
                'trace' => $th->getTraceAsString()
            ]);
            return response()->json(['message' => 'Gagal verifikasi inspeksi AC: ' . $th->getMessage()], 500);
        }
    }
}