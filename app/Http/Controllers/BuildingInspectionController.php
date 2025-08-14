<?php

namespace App\Http\Controllers;

use App\Models\BuildingInspection;
use App\Models\Master\MasterBuilding;
use App\Models\Master\MasterBuildingWorkStandard;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class BuildingInspectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $buildingInspections = BuildingInspection::with(['approvalStatus', 'plant', 'items', 'entity', 'building', 'createdBy'])
            ->latest()
            ->get();

        return inertia('inspection/building/page', [
            'buildingInspections' => $buildingInspections,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $buildings = MasterBuilding::with(['entity', 'plant'])->get();
        $workStandards = MasterBuildingWorkStandard::all();

        return inertia('inspection/building/create', [
            'buildings' => $buildings,
            'workStandards' => $workStandards,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'inspection_date' => 'required|date',
            'building_id' => 'required|exists:master_buildings,id',
            'frequency' => 'required|in:weekly,monthly',
            'items' => 'required|array',
            'items.*.work_standard_id' => 'required|exists:master_building_work_standards,id',
            'items.*.job_name' => 'required|string',
            'items.*.standard_description' => 'required|string',
            'items.*.action_repair' => 'required|boolean',
            'items.*.action_maintenance' => 'required|boolean',
            'items.*.condition_good' => 'required|boolean',
            'items.*.condition_broken' => 'required|boolean',
            'items.*.remarks' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try{
            // Generate CAR number (you may want to extract this logic into a service later)
            $code = auth()->user()->plant->alias_name . '/BLD/' . sprintf('%03d', BuildingInspection::count() + 1) . '/' . now()->format('d/m/Y');

            $inspection = BuildingInspection::create([
                'uuid' => Str::uuid(),
                'approval_status_code' => 'SOP',
                'code' => $code,
                'inspection_date' => $data['inspection_date'],
                'created_by' => auth()->id(),
                'entity_code' => auth()->user()->entity_code,
                'plant_code' => auth()->user()->plant_code,
                'building_id' => $data['building_id'],
                'frequency' => $data['frequency'],
            ]);

            foreach ($data['items'] as $item) {
                $inspection->items()->create([
                    'work_standard_id' => $item['work_standard_id'],
                    'job_name' => $item['job_name'],
                    'standard_description' => $item['standard_description'],
                    'action_repair' => $item['action_repair'],
                    'action_maintenance' => $item['action_maintenance'],
                    'condition_good' => $item['condition_good'],
                    'condition_broken' => $item['condition_broken'],
                    'remarks' => $item['remarks'],
                ]);
            }

            DB::commit();

            return inertia('inspection/building/create', [
                'buildingInspectionCode' => $inspection->code, // bisa juga pakai uuid
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
        $buildingInspection= BuildingInspection::with(['items', 'building', 'entity', 'plant', 'createdBy', 'approvalStatus', 'approvedBy'])
            ->where('uuid', $uuid)
            ->firstOrFail();

        return inertia('inspection/building/show', [
            'buildingInspection' => $buildingInspection,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($uuid)
    {
        $buildingInspection = BuildingInspection::with(['items', 'building', 'entity', 'plant'])
            ->where('uuid', $uuid)
            ->firstOrFail();

        $buildings = MasterBuilding::with(['entity', 'plant'])->get();
        $workStandards = MasterBuildingWorkStandard::all();

        return inertia('inspection/building/edit', [
            'buildingInspection' => $buildingInspection,
            'buildings' => $buildings,
            'workStandards' => $workStandards,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $uuid)
    {
        $data = $request->validate([
            'inspection_date' => 'required|date',
            'building_id' => 'required|exists:master_buildings,id',
            'frequency' => 'required|in:weekly,monthly',
            'items' => 'required|array',
            'items.*.id' => 'sometimes|exists:building_inspection_items,id',
            'items.*.work_standard_id' => 'required|exists:master_building_work_standards,id',
            'items.*.job_name' => 'required|string',
            'items.*.standard_description' => 'required|string',
            'items.*.action_repair' => 'required|boolean',
            'items.*.action_maintenance' => 'required|boolean',
            'items.*.condition_good' => 'required|boolean',
            'items.*.condition_broken' => 'required|boolean',
            'items.*.remarks' => 'nullable|string',
        ]);

        $inspection = BuildingInspection::where('uuid', $uuid)->firstOrFail();
        $inspection->update([
            'inspection_date' => $data['inspection_date'],
            'building_id' => $data['building_id'],
            'frequency' => $data['frequency'],
        ]);

        // Update existing items or create new ones
        foreach ($data['items'] as $item) {
            if (isset($item['id'])) {
                // Update existing item
                $inspection->items()->where('id', $item['id'])->update($item);
            } else {
                // Create new item
                $inspection->items()->create($item);
            }
        }

        return redirect()->route('inspection.building.index')
            ->with('success', 'Building inspection updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $uuid)
    {
        $inspectionBuilding = BuildingInspection::where('uuid', $uuid)->firstOrFail();
        $inspectionBuilding->items()->delete();
        $inspectionBuilding->delete();

        return redirect()->route('inspection.building.index')
            ->with('success', 'Building inspection deleted successfully.');
    }

    /**
     * Verify the building inspection.
     */
    public function verify(Request $request, $uuid)
    {
        $buildingInspection = BuildingInspection::where('uuid', $uuid)->firstOrFail();
        $user_id = auth()->id();

        // Check if the inspection is already approved
        if ($buildingInspection->approval_status_code === 'SAP') {
            return redirect()->back()->with('error', 'This APAR Inspection has already been approved.');
        }

        // Generate QR Code untuk building ini
        $qrCodeFolder = 'qrcodes/building';
        $qrFileName = 'building-' . $buildingInspection->id . '-approval-' . auth()->id() . '.png';
        $qrCodePath = $qrCodeFolder . '/' . $qrFileName;
        $fullPath = storage_path('app/public/' . $qrCodePath);

        // Buat folder jika belum ada
        if (!file_exists(dirname($fullPath))) {
            mkdir(dirname($fullPath), 0755, true);
        }

        // Data yang akan dimasukkan ke QR Code
        $qrContent = route('inspection.building.show', $buildingInspection->uuid) . '?verified_by=' . $user_id . '&stage=' . 'SAP';

        // Generate QR
        QrCode::format('png')->size(200)->generate($qrContent, $fullPath);

        // Update the approval status to 'SAP'
        $buildingInspection->update([
            'approval_status_code' => $request->approval_status,
            'note_validator' => $request->note ?? null,
            'approved_at' => now(),
            'approved_by' => $user_id,
            'qr_code_path' => $qrCodePath,
        ]);

        return redirect()->back()->with('success', 'APAR Inspection approved successfully.');
    }

    /**
     * Print the building inspection.
     */
    public function print($uuid)
    {
        $buildingInspection = BuildingInspection::where('uuid', $uuid)
            ->with(['approvalStatus', 'plant', 'entity', 'building', 'items', 'createdBy'])
            ->firstOrFail();

        $pdf = PDF::loadView('pdf.building', compact('buildingInspection'))
            ->setPaper('a4', 'portrait');

        return $pdf->stream('Inspeksi-APAR-' . $uuid . '.pdf');
    }
}
