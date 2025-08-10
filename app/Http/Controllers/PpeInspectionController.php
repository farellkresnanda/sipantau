<?php

namespace App\Http\Controllers;

use App\Models\Master\MasterApd;
use App\Models\Master\MasterLocation;
use App\Models\PpeInspection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PpeInspectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $ppeInspections = PpeInspection::with('entity', 'plant','createdBy', 'approvalStatus')->latest()->get();

        return Inertia::render('inspection/ppe/page', compact('ppeInspections'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $locations = MasterLocation::whereHas('plants', function ($query) {
            $query->whereIn('plant_code', explode(',', auth()->user()->plant_code));
        })->whereHas('entity', function ($query) {
            $query->where('entity_code', auth()->user()->entity_code);
        })->get();

        $ppeItems = MasterApd::orderBy('id', 'ASC')->get();

        return Inertia::render('inspection/ppe/create', [
            'locations' => $locations,
            'ppeItems' => $ppeItems,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'inspection_date' => 'required|date',
            'job_description' => 'nullable|string|max:255',
            'project_name' => 'nullable|string|max:255',
            'location' => 'required|string|max:255',
            'items' => 'required|array',
            'items.*.good_condition' => 'nullable|integer|min:0',
            'items.*.bad_condition' => 'nullable|integer|min:0',
            'items.*.used' => 'nullable|integer|min:0',
            'items.*.unused' => 'nullable|integer|min:0',
            'items.*.notes' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();

        try {
            // Buat nomor CAR
            $carNumber = auth()->user()->plant->alias_name . '/APD/' . sprintf('%03d', PpeInspection::count() + 1) . '/' . now()->format('d/m/Y');

            // Simpan data inspeksi utama
            $inspection = PpeInspection::create([
                'uuid' => Str::uuid(),
                'approval_status_code' => 'SOP',
                'entity_code' => auth()->user()->entity_code,
                'plant_code' => auth()->user()->plant_code,
                'car_auto_number' => $carNumber,
                'inspection_date' => $validated['inspection_date'],
                'location' => $validated['location'],
                'job_description' => $validated['job_description'],
                'project_name' => $validated['project_name'],
                'created_by' => auth()->id(),
            ]);

            // Simpan item APD
            foreach ($request->items as $itemData) {
                $inspection->items()->create([
                    'ppe_inspection_id' => $inspection->id,
                    'ppe_check_item_id' => $itemData['id'],
                    'good_condition' => $itemData['good_condition'] ?? 0,
                    'bad_condition' => $itemData['bad_condition'] ?? 0,
                    'used' => $itemData['used'] ?? 0,
                    'unused' => $itemData['unused'] ?? 0,
                    'notes' => $itemData['notes'] ?? null,
                ]);
            }

            DB::commit();

            return inertia('inspection/ppe/create', [
                'ppeInspectionCode' => $inspection->car_auto_number, // bisa juga pakai uuid
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['message' => 'Gagal menyimpan inspeksi: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($uuid)
    {
        $ppeInspection = PpeInspection::where('uuid', $uuid)
            ->with('items.ppeCheckItem', 'createdBy', 'entity', 'plant', 'approvalStatus', 'approvedBy')
            ->firstOrFail();

        return Inertia::render('inspection/ppe/show', [
            'ppeInspection' => $ppeInspection,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($uuid)
    {
        $ppeInspection = PpeInspection::where('uuid', $uuid)
            ->with('items.ppeCheckItem', 'createdBy', 'entity', 'plant', 'approvalStatus')
            ->firstOrFail();

        $locations = MasterLocation::whereHas('plants', function ($query) {
            $query->whereIn('plant_code', explode(',', auth()->user()->plant_code));
        })->whereHas('entity', function ($query) {
            $query->where('entity_code', auth()->user()->entity_code);
        })->get();

        $ppeItems = MasterApd::orderBy('id', 'ASC')->get();

        return Inertia::render('inspection/ppe/edit', [
            'ppeInspection' => $ppeInspection,
            'ppeItems' => $ppeItems,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $uuid)
    {
        $request->validate([
            'inspection_date' => 'required|date',
            'job_description' => 'nullable|string|max:255',
            'project_name' => 'nullable|string|max:255',
            'location' => 'required|string|max:255',
            'items' => 'required|array',
        ]);

        $ppeInspection = PpeInspection::where('uuid', $uuid)->firstOrFail();

        $ppeInspection->update([
            'inspection_date' => $request->inspection_date,
            'location' => $request->location,
            'job_description' => $request->job_description,
            'project_name' => $request->project_name,
        ]);

        foreach ($request->items as $ppeCheckItemId => $item) {
            $good = (int) ($item['good_condition'] ?? 0);
            $bad = (int) ($item['bad_condition'] ?? 0);
            $used = (int) ($item['used'] ?? 0);
            $unused = (int) ($item['unused'] ?? 0);
            $notes = $item['notes'] ?? null;

            $ppeInspection->items()->updateOrCreate(
                ['ppe_check_item_id' => $ppeCheckItemId],
                [
                    'good_condition' => $good,
                    'bad_condition' => $bad,
                    'used' => $used,
                    'unused' => $unused,
                    'notes' => $notes,
                ]
            );
        }

        return redirect()->route('inspection.ppe.index')->with('success', 'PPE Inspection updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $ppeInspection = PpeInspection::findOrFail($id);
        $ppeInspection->items()->delete();
        // Check if the PPE Inspection can be deleted
        $ppeInspection->delete();

        return redirect()->route('inspection.ppe.index')->with('success', 'PPE Inspection deleted successfully.');
    }

    /**
     * Approve the specified resource.
     */
    public function verify(Request $request, $uuid)
    {
        $ppeInspection = PpeInspection::where('uuid', $uuid)->firstOrFail();

        // Check if the inspection is already approved
        if ($ppeInspection->approval_status_code === 'SAP') {
            return redirect()->back()->with('error', 'This PPE Inspection has already been approved.');
        }

        // Update the approval status to 'SAP'
        $ppeInspection->update([
            'approval_status_code' => $request->approval_status,
            'note_validator' => $request->note ?? null,
            'approved_at' => now(),
            'approved_by' => auth()->id()
        ]);

        return redirect()->route('inspection.ppe.index')->with('success', 'PPE Inspection approved successfully.');
    }
}
