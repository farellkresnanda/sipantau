<?php

namespace App\Http\Controllers;

use App\Models\Master\MasterP3k;
use App\Models\Master\MasterP3kItem;
use App\Models\InspectionFirstAid;
use App\Models\InspectionFirstAidCondition;
use App\Models\InspectionStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InspectionFirstAidController extends Controller
{
    public function index()
    {
        $inspections = InspectionFirstAid::with([
            'entity',
            'plant',
            'status',
            'inspector',
            'validator',
        ])
            ->latest('inspection_date')
            ->paginate(10);

        return Inertia::render('inspection/first-aid/page', [
            'inspections' => $inspections,
        ]);
    }

    public function selectKit()
    {
        $kits = MasterP3k::with(['entityData', 'plantData'])->get();

        return Inertia::render('inspection/first-aid/select-kit', [
            'kits' => $kits,
        ]);
    }

    public function create(MasterP3k $kit)
    {
        $items = MasterP3kItem::all();
        $conditions = InspectionFirstAidCondition::all();

        return Inertia::render('inspection/first-aid/create', [
            'kit' => $kit->load(['entityData', 'plantData']),
            'items' => $items,
            'conditions' => $conditions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kit.location' => 'required|string',
            'kit.inventory_code' => 'required|string',
            'entity_code' => 'required|exists:master_entities,code',
            'plant_code' => 'required|exists:master_plants,code',
            'has_findings' => 'required|boolean',
            'notes' => 'nullable|string',
            'details' => 'required|array',
            'details.*.item_id' => 'required|exists:master_p3k_items,id',
            'details.*.quantity_found' => 'required|integer|min:0',
            'details.*.condition_id' => 'required|exists:inspection_first_aid_conditions,id',
        ]);

        try {
            DB::beginTransaction();

            $inspection = InspectionFirstAid::create([
                'location' => $validated['kit']['location'],
                'inventory_code' => $validated['kit']['inventory_code'],
                'entity_code' => $validated['entity_code'],
                'plant_code' => $validated['plant_code'],
                'inspector_id' => Auth::id(),
                'inspection_date' => now(),
                'inspection_status_id' => 1,
                'has_findings' => $validated['has_findings'],
                'notes' => $validated['notes'],
            ]);

            $inspection->details()->createMany($validated['details']);

            DB::commit();

            return redirect()->route('inspection.first-aid.index')->with('success', 'Inspeksi berhasil disimpan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menyimpan inspeksi: ' . $e->getMessage());
        }
    }

    public function show(InspectionFirstAid $inspection)
    {
        $inspection->load([
            'entity',
            'plant',
            'status',
            'inspector',
            'validator',
            'details.item',
            'details.condition',
        ]);

        return Inertia::render('inspection/first-aid/show', [
            'inspection' => $inspection,
        ]);
    }

    public function edit(InspectionFirstAid $inspection)
    {
        $inspection->load([
            'entity',
            'plant',
            'status',
            'inspector',
            'validator',
            'details.item',
            'details.condition',
        ]);

        $items = MasterP3kItem::all();
        $conditions = InspectionFirstAidCondition::all();

        return Inertia::render('inspection/first-aid/Edit', [
            'inspection' => $inspection,
            'items' => $items,
            'conditions' => $conditions,
        ]);
    }

    public function update(Request $request, InspectionFirstAid $inspection)
    {
        $validated = $request->validate([
            'location' => 'required|string',
            'inventory_code' => 'required|string',
            'entity_code' => 'required|exists:master_entities,code',
            'plant_code' => 'required|exists:master_plants,code',
            'has_findings' => 'required|boolean',
            'notes' => 'nullable|string',
            'details' => 'required|array',
            'details.*.item_id' => 'required|exists:master_p3k_items,id',
            'details.*.quantity_found' => 'required|integer|min:0',
            'details.*.condition_id' => 'required|exists:inspection_first_aid_conditions,id',
        ]);

        try {
            DB::beginTransaction();

            $inspection->update([
                'location' => $validated['location'],
                'inventory_code' => $validated['inventory_code'],
                'entity_code' => $validated['entity_code'],
                'plant_code' => $validated['plant_code'],
                'has_findings' => $validated['has_findings'],
                'notes' => $validated['notes'],
            ]);

            $inspection->details()->delete();
            $inspection->details()->createMany($validated['details']);

            DB::commit();

            return redirect()->route('inspection.first-aid.index')->with('success', 'Data inspeksi berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal memperbarui inspeksi: ' . $e->getMessage());
        }
    }

    public function validateInspection(Request $request, InspectionFirstAid $inspection)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'notes' => 'nullable|string',
        ]);

        $status = InspectionStatus::where('name', ucfirst($request->status))->firstOrFail();

        $inspection->update([
            'inspection_status_id' => $status->id,
            'validator_id' => Auth::id(),
            'validated_at' => now(),
        ]);

        return back()->with('success', 'Status inspeksi berhasil diperbarui.');
    }
}
