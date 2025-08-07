<?php

namespace App\Http\Controllers;

use App\Models\Finding;
use App\Models\K3lInspection;
use App\Models\K3lInspectionItem;
use App\Models\Master\MasterK3l;
use App\Models\Master\MasterLocation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class K3lInspectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $k3lInspections = K3lInspection::with('location', 'createdBy', 'approvedBy', 'approvalStatus', 'items', 'plant', 'entity')->latest()->get();

        return Inertia::render('inspection/k3l/page', compact('k3lInspections'));
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

        $k3lItems = MasterK3l::with('description')->get()->map(function ($item) {
            return [
                'key' => (string) $item->id,
                'title' => $item->objective,
                'items' => $item->description->map(function ($desc) {
                    return [
                        'id' => (string) $desc->id,
                        'description' => $desc->description,
                    ];
                }),
            ];
        });

        return Inertia::render('inspection/k3l/create', compact('locations', 'k3lItems'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'location_id' => 'required|exists:master_locations,id',
            'items' => 'required|array',
            'inspection_date' => 'required|date',
        ]);

        DB::beginTransaction();
        try {
            // Generate CAR number (you may want to extract this logic into a service later)
            $carNumber = auth()->user()->plant->alias_name.'/'.sprintf('%03d', Finding::count() + 1).'/'.now()->format('d/m/Y');

            $k3lInspection = K3lInspection::create([
                'uuid' => Str::uuid(),
                'approval_status_code' => 'SOP',
                'entity_code' => auth()->user()->entity_code,
                'plant_code' => auth()->user()->plant_code,
                'car_number_auto' => $carNumber,
                'location_id' => $request->location_id,
                'inspection_date' => $request->inspection_date,
                'created_by' => auth()->id(),
            ]);

            foreach ($request->items as $item) {
                $k3lInspection->items()->create([
                    'k3l_inspection_id' => $k3lInspection->id,
                    'master_k3l_description_id' => $item['master_k3l_description_id'],
                    'condition' => $item['condition'] ?? null,
                    'note' => $item['note'] ?? null,
                ]);
            }
            DB::commit();

            return inertia('inspection/k3l/create', [
                'k3lInspectionCode' => $k3lInspection->car_number_auto, // bisa juga pakai uuid
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['message' => 'Gagal menyimpan inspeksi: ' . $e->getMessage()]);
        }

        return redirect()->route('inspection.k3l.index')->with('success', __('K3L Inspection created successfully.'));
    }

    /**
     * Display the specified resource.
     */
    public function show($uuid)
    {
        $k3lInspection = K3lInspection::with('items', 'location', 'createdBy', 'approvedBy', 'approvalStatus', 'plant', 'entity', 'items.masterK3l', 'items.masterK3lDescription.masterK3l')
            ->where('uuid', $uuid)
            ->firstOrFail();

        return Inertia::render('inspection/k3l/show', compact('k3lInspection'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($uuid)
    {
        $k3lInspection = K3lInspection::with('items', 'location', 'createdBy', 'approvedBy', 'approvalStatus', 'plant', 'entity', 'items.masterK3l', 'items.masterK3lDescription.masterK3l')
            ->where('uuid', $uuid)
            ->firstOrFail();

        $locations = MasterLocation::whereHas('plants', function ($query) {
            $query->whereIn('plant_code', explode(',', auth()->user()->plant_code));
        })->whereHas('entity', function ($query) {
            $query->where('entity_code', auth()->user()->entity_code);
        })->get();

        $k3lItems = MasterK3l::with('description')->get()->map(function ($item) {
            return [
                'key' => (string)$item->id,
                'title' => $item->objective,
                'items' => $item->description->map(function ($desc) {
                    return [
                        'id' => (string)$desc->id,
                        'description' => $desc->description,
                        'condition' => $desc->condition,
                    ];
                }),
            ];
        });

        return Inertia::render('inspection/k3l/edit', compact('k3lInspection', 'locations', 'k3lItems'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $uuid)
    {
        $k3lInspection = K3lInspection::where('uuid', $uuid)->firstOrFail();

        $validated = $request->validate([
            'inspection_date' => 'required|date',
            'location_id' => 'required|exists:master_locations,id',
            'items' => 'required|array',
        ]);

        DB::beginTransaction();
        try {
            // Update data utama inspeksi
            $k3lInspection->update([
                'inspection_date' => $validated['inspection_date'],
                'location_id' => $validated['location_id'],
                'note_validator' => $validated['note_validator'],
            ]);

            // Update setiap item (assume key-nya adalah master_k3l_description_id sebagai string)
            foreach ($validated['items'] as $descriptionId => $itemData) {
                $item = $k3lInspection->items()
                    ->where('master_k3l_description_id', $descriptionId)
                    ->first();

                if ($item) {
                    $item->update([
                        'condition' => $itemData['condition'],
                        'note' => $itemData['note'] ?? null,
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('inspection.k3l.index')
                ->with('success', 'K3L Inspection updated successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();
            report($e);
            return back()->with('error', 'Error saving data: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($uuid)
    {
        try {
            DB::beginTransaction();

            $k3lInspection = K3lInspection::where('uuid', $uuid)->firstOrFail();

            K3lInspectionItem::where('k3l_inspection_id', $k3lInspection->id)->delete();
            $k3lInspection->delete();

            DB::commit();

            return redirect()->back()->with('success', __('K3L Inspection deleted successfully.'));
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', __('Failed to delete K3L Inspection.'));
        }
    }

    /**
     * Verify the specified K3L inspection.
     */
    public function verify(Request $request, $uuid)
    {
        $k3lInspection = K3lInspection::where('uuid', $uuid)->firstOrFail();

        // Check if the inspection is already approved
        if ($k3lInspection->approval_status_code === 'SAP') {
            return redirect()->back()->with('error', 'This K3L Inspection has already been approved.');
        }

        // Update the approval status to 'SAP'
        $k3lInspection->update([
            'approval_status_code' => $request->approval_status,
            'note_validator' => $request->note ?? null,
            'approved_at' => now(),
            'approved_by' => auth()->id()
        ]);

        return redirect()->route('inspection.k3l.index')->with('success', 'K3L Inspection approved successfully.');
    }
}
