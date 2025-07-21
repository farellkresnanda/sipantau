<?php

namespace App\Http\Controllers;

use App\Models\Master\MasterApd;
use App\Models\Master\MasterLocation;
use App\Models\PpeInspection;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PpeInspectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $ppeInspections = PpeInspection::with('entity', 'plant', 'location', 'createdBy', 'approvalStatus')->latest()->get();

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
        // Validate the request data
        $request->validate([
            'inspection_date' => 'required|date',
            'job_description' => 'nullable|string|max:255',
            'project_name' => 'nullable|string|max:255',
            'location_id' => 'required|exists:master_locations,id',
            'items' => 'required|array',
            'items.*.id' => 'required|exists:master_apds,id',
            'items.*.quantity' => 'required|integer|min:0',
        ]);

        // Generate CAR number (you may want to extract this logic into a service later)
        $carNumber = auth()->user()->plant->alias_name . '/APD/' . sprintf('%03d', PpeInspection::count() + 1) . '/' . now()->format('d/m/Y');

        // Create the PPE Inspection record
        $ppeInspection = PpeInspection::create([
            'uuid' => Str::uuid(),
            'approval_status_code' => 'SOP', // Default status code, adjust as necessary
            'entity_code' => auth()->user()->entity_code,
            'plant_code' => auth()->user()->plant_code,
            'car_auto_number' => $carNumber,
            'inspection_date' => $request->inspection_date,
            'location_id' => $request->location_id,
            'job_description' => $request->job_description,
            'project_name' => $request->project_name,
            'created_by' => auth()->id()
        ]);

        // Attach the PPE items to the inspection
        foreach ($request->items as $item) {
            $ppeInspection->items()->create([
                'ppe_inspection_id' => $ppeInspection->id,
                'ppe_check_item_id' => $item['id'],
                'condition' => $item['condition'],
                'usage' => $item['usage'],
                'quantity' => $item['quantity'],
                'notes' => $item['notes'],
            ]);
        }

        return redirect()->route('inspection.ppe.index')->with('success', 'PPE Inspection created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show($uuid)
    {
        $ppeInspection = PpeInspection::where('uuid', $uuid)
            ->with('items.ppeCheckItem', 'location', 'createdBy', 'entity', 'plant', 'approvalStatus')
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
            ->with('items.ppeCheckItem', 'location', 'createdBy', 'entity', 'plant', 'approvalStatus')
            ->firstOrFail();

        $locations = MasterLocation::whereHas('plants', function ($query) {
            $query->whereIn('plant_code', explode(',', auth()->user()->plant_code));
        })->whereHas('entity', function ($query) {
            $query->where('entity_code', auth()->user()->entity_code);
        })->get();

        $ppeItems = MasterApd::orderBy('id', 'ASC')->get();

        return Inertia::render('inspection/ppe/edit', [
            'ppeInspection' => $ppeInspection,
            'locations' => $locations,
            'ppeItems' => $ppeItems,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $uuid)
    {
        dd($request);
        // Validate the request data
        $request->validate([
            'inspection_date' => 'required|date',
            'job_description' => 'nullable|string|max:255',
            'project_name' => 'nullable|string|max:255',
            'location_id' => 'required|exists:master_locations,id',
            'items' => 'required|array',
        ]);

        // Find the PPE Inspection record
        $ppeInspection = PpeInspection::where('uuid', $uuid)->firstOrFail();

        // Update the PPE Inspection record
        $ppeInspection->update([
            'inspection_date' => $request->inspection_date,
            'location_id' => $request->location_id,
            'job_description' => $request->job_description,
            'project_name' => $request->project_name,
        ]);

        // Update or create the PPE items
        foreach ($request->items as $item) {
            $ppeInspection->items()->updateOrCreate(
                ['ppe_check_item_id' => $item['id']],
                [
                    'condition' => $item['condition'],
                    'usage' => $item['usage'],
                    'quantity' => $item['quantity'],
                    'notes' => $item['notes'],
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
}
