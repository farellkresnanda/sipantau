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
    User
};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{ Auth, DB, Log, Schema };
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
            'createdBy:id,name',
            'items.item:id,item_name,standard_quantity,unit',
            'items.condition:id,name',
        ])
        ->select([
            'id', 'uuid', 'entity_code', 'plant_code', 'location_id', 'car_auto_number',
            'inspection_date', 'project_name', 'approval_status_code', 'created_by', 'created_at',
        ])
        ->orderBy('created_at', 'desc') // <-- Menggunakan order by created_at desc
        ->paginate(10);

        Log::info('Data inspeksi untuk halaman index:', $inspections->toArray());

        return Inertia::render('inspection/first-aid/page', [
            'inspections' => $inspections,
        ]);
    }

    public function create()
    {
        return Inertia::render('inspection/first-aid/create', [
            'locations' => MasterP3k::select('id', 'location', 'inventory_code', 'entity_code', 'plant_code')->get(),
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
            'items.*.noted' => 'nullable|string|max:255', // <-- Menggunakan 'noted'
            'items.*.expired_at' => 'nullable|date',
        ];

        try {
            $validated = $request->validate($validationRules);
            Log::info('Validated data before processing:', $validated);

            // --- Debugging skema tabel untuk konfirmasi nama kolom ---
            $tableName = 'first_aid_inspection_items';
            $columns = Schema::getColumnListing($tableName);
            Log::info("DEBUG: Columns in table '{$tableName}':", $columns);
            if (!Schema::hasColumn($tableName, 'noted')) {
                Log::error("DEBUG: Laravel thinks column 'noted' DOES NOT exist in '{$tableName}'!");
            } else {
                Log::info("DEBUG: Laravel thinks column 'noted' EXISTS in '{$tableName}'!");
            }
            // --- Akhir Debugging skema tabel ---

            DB::beginTransaction();

            $prefix = strtoupper($validated['entity_code']);
            $today = now()->toDateString();
            $runningNumber = FirstAidInspection::where('entity_code', $validated['entity_code'])
                ->whereDate('created_at', $today)
                ->count() + 1;

            $carNumber = sprintf(
                '%s/P3K/%03d/%s',
                $prefix,
                $runningNumber,
                now()->format('d/m/Y')
            );

            $inspectionData = [
                'uuid' => (string) Str::uuid(),
                'entity_code' => $validated['entity_code'],
                'plant_code' => $validated['plant_code'],
                'location_id' => $validated['location_id'],
                'car_auto_number' => $carNumber,
                'inspection_date' => $validated['inspection_date'],
                'project_name' => $validated['project_name'],
                'approval_status_code' => 'SOP', // <-- Status 'SOP' (Open)
                'created_by' => Auth::id(),
            ];

            $inspection = FirstAidInspection::create($inspectionData);
            Log::info('FirstAidInspection created successfully:', $inspection->toArray());

            foreach ($validated['items'] as $itemData) {
                $inspection->items()->create([
                    'first_aid_check_item_id' => $itemData['first_aid_check_item_id'],
                    'quantity_found' => $itemData['quantity_found'],
                    'condition_id' => $itemData['condition_id'],
                    'noted' => $itemData['noted'], // <-- Menggunakan 'noted'
                    'expired_at' => $itemData['expired_at'],
                ]);
            }
            Log::info('FirstAidInspectionItems created for inspection ID:', [
                'inspection_id' => $inspection->id,
                'count' => count($validated['items'])
            ]);

            DB::commit();

            return redirect()->route('inspection.first-aid.index')
                ->with('success', 'Inspeksi P3K berhasil disimpan.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Validation failed during FirstAidInspection store:', ['errors' => $e->errors(), 'request' => $request->all()]);
            return back()->withErrors($e->errors())->withInput();

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal menyimpan FirstAidInspection karena exception:', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return back()->with('error', 'Gagal menyimpan inspeksi: ' . $e->getMessage());
        }
    }

    public function show(string $uuid)
    {
        try {
            $firstAidInspection = FirstAidInspection::where('uuid', $uuid)->firstOrFail();

            $firstAidInspection->loadMissing([
                'entity:id,entity_code,name',
                'plant:id,plant_code,name',
                'location:id,location,inventory_code',
                'createdBy:id,name',
                'approvedBy:id,name',
                'approvalStatus:id,code,name',
                'items.item:id,item_name,standard_quantity,unit',
                'items.condition:id,name',
            ]);

            Log::info('FirstAidInspection object sent to Inertia for show:', $firstAidInspection->toArray());
            if ($firstAidInspection->items) {
                 Log::info('Items for this inspection in controller show method:', $firstAidInspection->items->toArray());
            } else {
                 Log::info('No items loaded for this inspection ID:', ['id' => $firstAidInspection->id, 'uuid' => $firstAidInspection->uuid]);
            }

            return Inertia::render('inspection/first-aid/show', [
                'firstAidInspection' => $firstAidInspection,
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching FirstAidInspection data:', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->route('inspection.first-aid.index')
                ->with('error', 'Data inspeksi tidak ditemukan atau terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function edit(string $uuid)
    {
        $firstAidInspection = FirstAidInspection::where('uuid', $uuid)
            ->with([
                'entity', 'plant', 'location',
                'items.item', 'items.condition'
            ])
            ->firstOrFail();

        return Inertia::render('inspection/first-aid/edit', [
            'inspection' => $firstAidInspection,
            'entities' => MasterEntity::select('entity_code as code', 'name')->get(),
            'plants' => MasterPlant::select('plant_code as code', 'name')->get(),
            'locations' => MasterP3k::select('id', 'location', 'inventory_code', 'entity_code', 'plant_code')->get(),
            'firstAidItems' => MasterP3kItem::select('id', 'item_name', 'standard_quantity', 'unit')->get(),
            'conditions' => FirstAidInspectionCondition::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, string $uuid)
    {
        Log::info('Request data received for FirstAidInspection update:', $request->all());

        $validationRules = [
            'entity_code' => 'required|exists:master_entities,entity_code',
            'plant_code' => 'required|exists:master_plants,plant_code',
            'inspection_date' => 'required|date',
            'project_name' => 'nullable|string|max:255',
            'approval_status_code' => 'required|string|max:255',
        ];

        try {
            $validated = $request->validate($validationRules);
            Log::info('Validated data for update:', $validated);

            $firstAidInspection = FirstAidInspection::where('uuid', $uuid)->firstOrFail();

            DB::beginTransaction();

            $firstAidInspection->update($validated);

            DB::commit();

            return redirect()->route('inspection.first-aid.index')
                ->with('success', 'Data inspeksi berhasil diperbarui.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Validation failed during FirstAidInspection update:', ['errors' => $e->errors(), 'request' => $request->all()]);
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal memperbarui FirstAidInspection karena exception:', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return back()->with('error', 'Gagal memperbarui inspeksi: ' . $e->getMessage());
        }
    }

    public function destroy(string $uuid)
    {
        try {
            $firstAidInspection = FirstAidInspection::where('uuid', $uuid)->firstOrFail();
            $firstAidInspection->delete();

            return back()->with('success', 'Data inspeksi berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Gagal menghapus inspeksi:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return back()->with('error', 'Gagal menghapus data: ' . $e->getMessage());
        }
    }
}