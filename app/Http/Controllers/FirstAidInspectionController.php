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
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\{ Auth, DB, Log, Redirect };
use Illuminate\Support\Str;
use Inertia\Inertia;

class FirstAidInspectionController extends Controller
{
    /**
     * Menampilkan daftar inspeksi dengan paginasi dinamis untuk semua data.
     */
    public function index()
    {
        $query = FirstAidInspection::with([
            'entity:id,entity_code,name',
            'plant:id,plant_code,name',
            'location:id,location,inventory_code',
            'approvalStatus:id,code,name',
            'createdBy:id,name',
        ])
        ->select([
            'id', 'uuid', 'entity_code', 'plant_code', 'location_id', 'car_auto_number',
            'inspection_date', 'project_name', 'approval_status_code', 'created_by', 'created_at',
        ])
        ->orderBy('created_at', 'desc');

        $totalRecords = (clone $query)->count();

        $inspections = $query->paginate($totalRecords > 0 ? $totalRecords : 15);

        return Inertia::render('inspection/first-aid/page', [
            'inspections' => $inspections,
        ]);
    }

    /**
     * Menampilkan form untuk membuat inspeksi baru.
     */
    public function create()
    {
        return Inertia::render('inspection/first-aid/create', $this->getCreateViewData());
    }

    /**
     * Menyimpan inspeksi baru dan merespons seperti AparController.
     */
    public function store(Request $request)
    {
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
            
            DB::beginTransaction();

            $prefix = MasterPlant::where('plant_code', $validated['plant_code'])->first()->alias_name ?? strtoupper($validated['plant_code']);
            $today = now()->toDateString();
            $runningNumber = FirstAidInspection::where('entity_code', $validated['entity_code'])->whereDate('created_at', $today)->count() + 1;
            $carNumber = sprintf('%s/P3K/%03d/%s', $prefix, $runningNumber, now()->format('d/m/Y'));

            $inspection = FirstAidInspection::create([
                'uuid' => (string) Str::uuid(),
                'entity_code' => $validated['entity_code'],
                'plant_code' => $validated['plant_code'],
                'location_id' => $validated['location_id'],
                'car_auto_number' => $carNumber,
                'inspection_date' => $validated['inspection_date'],
                'project_name' => $validated['project_name'],
                'approval_status_code' => 'SOP',
                'created_by' => Auth::id(),
            ]);

            foreach ($validated['items'] as $itemData) {
                $inspection->items()->create($itemData);
            }

            DB::commit();

            // ✅ PERBAIKAN: Mengirim KEDUA uuid dan code, sama seperti AparController
            return inertia('inspection/first-aid/create', array_merge(
                $this->getCreateViewData(),
                [
                    'success' => 'Inspeksi P3K berhasil disimpan.',
                    'firstAidInspectionUuid' => $inspection->uuid,
                    'firstAidInspectionCode' => $inspection->car_auto_number,
                ]
            ));

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menyimpan inspeksi: ' . $e->getMessage());
        }
    }
    
    // Helper function untuk menghindari duplikasi kode
    private function getCreateViewData()
    {
        return [
            'locations' => MasterP3k::select('id', 'location', 'inventory_code', 'entity_code', 'plant_code')->get(),
            'entities' => MasterEntity::select('entity_code as code', 'name')->get(),
            'plants' => MasterPlant::select('plant_code as code', 'name')->get(),
            'firstAidItems' => MasterP3kItem::select('id', 'item_name', 'standard_quantity', 'unit')->get(),
            'conditions' => FirstAidInspectionCondition::select('id', 'name')->get(),
        ];
    }

    public function show(string $uuid)
    {
        try {
            $inspection = FirstAidInspection::with([
                'entity:id,entity_code,name',
                'plant:id,plant_code,name',
                'location:id,location,inventory_code',
                'createdBy:id,name',
                'approvedBy:id,name',
                'approvalStatus:id,code,name',
                'items.item:id,item_name,standard_quantity,unit',
                'items.condition:id,name',
            ])->where('uuid', $uuid)->firstOrFail();
            
            $inspectorNotes = $inspection->items->map(function ($item) {
                return [
                    'item_name' => $item->item->item_name ?? '-',
                    'note' => $item->note,
                    'condition' => $item->condition->name ?? '-',
                    'quantity_found' => $item->quantity_found,
                    'expired_at' => $item->expired_at,
                ];
            });

            return Inertia::render('inspection/first-aid/show', [
                'firstAidInspection' => $inspection->toArray(),
                'validatorNote' => $inspection->note_validator,
                'inspectorNotes' => $inspectorNotes,
                'approvedBy' => $inspection->approvedBy?->name,
                'creatorNameProp' => $inspection->createdBy->name ?? 'Fallback Dari Controller',
            ]);

        } catch (\Exception $e) {
            Log::error('Error in show method:', ['error' => $e->getMessage()]);
            return redirect()->route('inspection.first-aid.index')->with('error', 'Inspeksi tidak ditemukan.');
        }
    }

    public function printPdf($uuid)
    {
        $inspection = FirstAidInspection::with([
            'entity:id,entity_code,name',
            'plant:id,plant_code,name',
            'location:id,location,inventory_code',
            'createdBy:id,name',
            'approvedBy:id,name',
            'approvalStatus:id,code,name',
            'items.item:id,item_name,standard_quantity,unit',
            'items.condition:id,name',
        ])->where('uuid', $uuid)->firstOrFail();
        
        \Carbon\Carbon::setLocale('id');

        $inspectorNotes = $inspection->items->map(function ($item) {
            return [
                'item_name' => $item->item->item_name ?? '-',
                'note' => $item->note,
                'condition' => $item->condition->name ?? '-',
                'quantity_found' => $item->quantity_found,
                'expired_at' => $item->expired_at,
            ];
        });

        return Pdf::loadView('pdf.first-aid', [
            'inspection' => $inspection,
            'inspectorNotes' => $inspectorNotes,
            'validatorNote' => $inspection->note_validator,
        ])->stream("inspection-p3k-$uuid.pdf");
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
            'entity_code' => 'required|string|exists:master_entities,entity_code',
            'plant_code' => 'required|string|exists:master_plants,plant_code',
            'inspection_date' => 'required|date',
            'project_name' => 'nullable|string|max:255',
            'approval_status_code' => 'required|string|max:255',
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

            $inspection = FirstAidInspection::where('uuid', $uuid)->firstOrFail();

            DB::beginTransaction();

            $inspection->update([
                'inspection_date' => $validated['inspection_date'],
                'location_id' => $validated['location_id'],
                'project_name' => $validated['project_name'],
                'entity_code' => $validated['entity_code'],
                'plant_code' => $validated['plant_code'],
                'approval_status_code' => $validated['approval_status_code'],
            ]);

            $inspection->items()->delete();
            foreach ($validated['items'] as $itemData) {
                $inspection->items()->create($itemData);
            }

            DB::commit();

            return redirect()->route('inspection.first-aid.index')->with('success', 'Inspeksi berhasil diperbarui.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update error in FirstAidInspectionController:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal memperbarui inspeksi: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(string $uuid)
    {
        try {
            $inspection = FirstAidInspection::withTrashed()->where('uuid', $uuid)->firstOrFail();
            $inspection->forceDelete();

            return back()->with('success', 'Data inspeksi berhasil dihapus permanen.');
        } catch (\Exception $e) {
            Log::error('Delete error:', ['error' => $e->getMessage()]);
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

        try {
            $inspection = FirstAidInspection::where('uuid', $uuid)->firstOrFail();

            $inspection->update([
                'approval_status_code' => $request->approval_status,
                'note_validator' => $request->note_validator,
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);

            return redirect()->route('inspection.first-aid.show', $uuid)->with('success', 'Inspeksi berhasil diverifikasi.');
        } catch (\Throwable $th) {
            report($th);
            return redirect()->back()->with('error', 'Gagal verifikasi: ' . $th->getMessage());
        }
    }
}