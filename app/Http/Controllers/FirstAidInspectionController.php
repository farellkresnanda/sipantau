<?php

namespace App\Http\Controllers;

use App\Models\{
    FirstAidInspection,
    FirstAidInspectionCondition,
    FirstAidInspectionItem,
    ApprovalStatus,
    Master\MasterEntity,
    Master\MasterPlant,
    Master\MasterP3k,
    Master\MasterP3kItem,
    User // Pastikan User model diimpor
};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{ Auth, DB, Log };
use Illuminate\Support\Str;
use Inertia\Inertia;

class FirstAidInspectionController extends Controller
{
    public function index()
    {
        $inspections = FirstAidInspection::with([
            'entity:id,entity_code,name',
            'plant:id,plant_code,name',
            'location:id,location,inventory_code',
            'approvalStatus:id,code,name',
            'createdBy:id,name', // Relasi ini dimuat
            'items.item:id,item_name,standard_quantity,unit',
            'items.condition:id,name',
        ])
        ->select([
            'id', 'uuid', 'entity_code', 'plant_code', 'location_id', 'car_auto_number',
            'inspection_date', 'project_name', 'approval_status_code', 'created_by', 'created_at',
        ])
        ->orderBy('created_at', 'desc')
        ->paginate(10);

        return Inertia::render('inspection/first-aid/page', [
            'inspections' => $inspections,
        ]);
    }

    public function create()
    {
        $locations = MasterP3k::select('id', 'location', 'inventory_code', 'entity_code', 'plant_code')->get();

        return Inertia::render('inspection/first-aid/create', [
            'locations' => $locations,
            'entities' => MasterEntity::select('entity_code as code', 'name')->get(),
            'plants' => MasterPlant::select('plant_code as code', 'name')->get(),
            'firstAidItems' => MasterP3kItem::select('id', 'item_name', 'standard_quantity', 'unit')->get(),
            'conditions' => FirstAidInspectionCondition::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Request data received for FirstAidInspection store:', $request->all());

        $validationRules = [
            'entity_code' => 'required|string|exists:master_entities,entity_code',
            'plant_code' => 'required|string|exists:master_plants,plant_code',
            'inspection_date' => 'required|date',
            'project_name' => 'nullable|string|max:255',
            'location_id' => 'required|integer|exists:master_p3ks,id',
            'items' => 'required|array|min:1',
            'items.*.first_aid_check_item_id' => 'required|integer|exists:master_p3k_items,id',
            'items.*.quantity_found' => 'required|integer|min:0',
            'items.*.condition_id' => 'required|integer|exists:first_aid_inspection_conditions,id',
            'items.*.note' => 'nullable|string|max:255',
            'items.*.expired_at' => 'nullable|date',
        ];

        try {
            $validated = $request->validate($validationRules);
            Log::info('Validated data before processing:', $validated);

            DB::beginTransaction();

            $selectedPlantCode = $validated['plant_code'];
            $masterPlant = MasterPlant::where('plant_code', $selectedPlantCode)->first();
            $prefix = $masterPlant->alias_name ?? strtoupper($selectedPlantCode);

            $today = now()->toDateString();
            $runningNumber = FirstAidInspection::where('entity_code', $validated['entity_code'])
                ->whereDate('created_at', $today)
                ->count() + 1;

            $carNumber = sprintf('%s/P3K/%03d/%s', $prefix, $runningNumber, now()->format('d/m/Y'));

            $inspectionData = [
                'uuid' => (string) Str::uuid(),
                'entity_code' => $validated['entity_code'],
                'plant_code' => $validated['plant_code'],
                'location_id' => $validated['location_id'],
                'car_auto_number' => $carNumber,
                'inspection_date' => $validated['inspection_date'],
                'project_name' => $validated['project_name'],
                'approval_status_code' => 'SOP',
                'created_by' => Auth::id(),
            ];

            $inspection = FirstAidInspection::create($inspectionData);

            foreach ($validated['items'] as $itemData) {
                $inspection->items()->create([
                    'first_aid_check_item_id' => $itemData['first_aid_check_item_id'],
                    'quantity_found' => $itemData['quantity_found'],
                    'condition_id' => $itemData['condition_id'],
                    'note' => $itemData['note'] ?? null,
                    'expired_at' => $itemData['expired_at'],
                ]);
            }

            DB::commit();

            return redirect()->route('inspection.first-aid.index')->with('success', 'Inspeksi P3K berhasil disimpan.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::error('Validation Error in store:', $e->errors());
            return back()->withErrors($e->errors())->withInput();

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal menyimpan FirstAidInspection:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return back()->with('error', 'Gagal menyimpan inspeksi: ' . $e->getMessage());
        }
    }

    public function show(string $uuid)
    {
        try {
            $inspection = FirstAidInspection::with([
                'entity:id,entity_code,name',
                'plant:id,plant_code,name',
                'location:id,location,inventory_code',
                'createdBy:id,name', // Relasi ini dimuat
                'approvedBy:id,name',
                'approvalStatus:id,code,name',
                'items.item:id,item_name,standard_quantity,unit',
                'items.condition:id,name',
            ])->where('uuid', $uuid)->firstOrFail();

            // === DEBUG POINT KRUSIAL: Lihat JSON mentah dari relasi createdBy ===
            // UNCOMMENT baris ini untuk melihat string JSON dari relasi createdBy saja.
            // Jika ini 'null', berarti masalahnya di serialisasi Laravel.
            // dd(json_encode($inspection->createdBy));
            // === AKHIR DEBUG POINT ===

            // --- DEBUG POINT LAINNYA ---
            // UNCOMMENT ini untuk melihat objek inspeksi lengkap setelah dimuat relasi
            // dd($inspection->toArray());
            // --- AKHIR DEBUG POINT ---

            Log::info('Full inspection object from DB:', $inspection->toArray());

            $inspectorNotes = $inspection->items->map(function ($item) {
                Log::info('Mapping item:', ['item_id' => $item->id, 'note_db_value' => $item->note]);
                return [
                    'item_name' => $item->item->item_name ?? '-',
                    'note' => $item->note,
                    'condition' => $item->condition->name ?? '-',
                    'quantity_found' => $item->quantity_found,
                    'expired_at' => $item->expired_at,
                ];
            });
            Log::info('Prepared inspectorNotes for frontend:', $inspectorNotes->toArray());

            return Inertia::render('inspection/first-aid/show', [
                'firstAidInspection' => $inspection,
                'validatorNote' => $inspection->note_validator,
                'inspectorNotes' => $inspectorNotes,
                'approvedBy' => $inspection->approvedBy?->name,
                // --- PROP BARU UNTUK NAMA PEMBUAT ---
                // Mengirim nama pembuat sebagai prop terpisah sebagai workaround
                'creatorNameProp' => $inspection->createdBy->name ?? 'Fallback Dari Controller',
                // --- AKHIR PROP BARU ---
            ]);

        } catch (\Exception $e) {
            Log::error('Error in show method of FirstAidInspectionController:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->route('inspection.first-aid.index')
                ->with('error', 'Data tidak ditemukan atau terjadi kesalahan: ' . $e->getMessage());
        }
    }


    public function edit(string $uuid)
    {
        $inspection = FirstAidInspection::with([
            'entity', 'plant', 'location',
            'items.item', 'items.condition'
        ])->where('uuid', $uuid)->firstOrFail();

        return Inertia::render('inspection/first-aid/edit', [
            'inspection' => $inspection,
            'entities' => MasterEntity::select('entity_code as code', 'name')->get(),
            'plants' => MasterPlant::select('plant_code as code', 'name')->get(),
            'locations' => MasterP3k::select('id', 'location', 'inventory_code', 'entity_code', 'plant_code')->get(),
            'firstAidItems' => MasterP3kItem::select('id', 'item_name', 'standard_quantity', 'unit')->get(),
            'conditions' => FirstAidInspectionCondition::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, string $uuid)
    {
        $validationRules = [
            'entity_code' => 'required|exists:master_entities,entity_code',
            'plant_code' => 'required|exists:master_plants,plant_code',
            'inspection_date' => 'required|date',
            'project_name' => 'nullable|string|max:255',
            'approval_status_code' => 'required|string|max:255',
        ];

        try {
            $validated = $request->validate($validationRules);
            $inspection = FirstAidInspection::where('uuid', $uuid)->firstOrFail();

            DB::beginTransaction();
            $inspection->update($validated);
            DB::commit();

            return redirect()->route('inspection.first-aid.index')->with('success', 'Inspeksi berhasil diperbarui.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update error in FirstAidInspectionController:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->with('error', 'Gagal memperbarui inspeksi: ' . $e->getMessage());
        }
    }

    public function destroy(string $uuid)
    {
        try {
            $inspection = FirstAidInspection::withTrashed()->where('uuid', $uuid)->firstOrFail();
            $inspection->forceDelete();

            return back()->with('success', 'Data inspeksi berhasil dihapus permanen.');

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('ModelNotFoundException saat menghapus data (UUID tidak ditemukan):', [
                'uuid' => $uuid,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return back()->with('error', 'Gagal menghapus data: Record tidak ditemukan.');
        } catch (\Exception $e) {
            Log::error('General Delete error:', ['error' => $e->getMessage(), 'uuid' => $uuid, 'trace' => $e->getTraceAsString()]);
            return back()->with('error', 'Gagal menghapus data: ' . $e->getMessage());
        }
    }

    public function verify(Request $request, string $uuid)
    {
        $request->validate([
            'approval_status' => 'required|in:SAP,SRE',
            'note_validator' => 'required_if:approval_status,SRE|string|max:255',
        ], [
            'note_validator.required_if' => 'Catatan wajib diisi jika inspeksi ditolak.',
        ]);

        $inspection = FirstAidInspection::where('uuid', $uuid)->firstOrFail();

        try {
            $inspection->update([
                'approval_status_code' => $request->approval_status,
                'note_validator' => $request->note_validator,
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);

            return back()->with([
                'type' => 'success',
                'message' => 'Inspeksi berhasil diverifikasi.',
            ]);
        } catch (\Throwable $th) {
            report($th);
            Log::error('Verification error in FirstAidInspectionController:', [
                'error' => $th->getMessage(),
                'trace' => $th->getTraceAsString()
            ]);
            return back()->with([
                'type' => 'error',
                'message' => 'Gagal verifikasi: Terjadi kesalahan.',
            ]);
        }
    }
}