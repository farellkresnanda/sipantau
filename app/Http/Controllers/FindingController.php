<?php

namespace App\Http\Controllers;

use App\Models\Finding;
use App\Models\FindingApprovalHistory;
use App\Models\FindingApprovalStage;
use App\Models\Master\MasterNonconformityType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FindingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $findings = Finding::latest()->with(['nonconformityType', 'findingStatus', 'entity', 'plant', 'createdBy'])->get();
        return Inertia::render('finding/page', compact('findings'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $nonconformityType = MasterNonconformityType::select(
            'master_nonconformity_types.id',
            'master_nonconformity_types.name as name',
            'master_nonconformity_sub_types.id as sub_id',
            'master_nonconformity_sub_types.name as sub_name'
        )
            ->leftJoin('master_nonconformity_sub_types', 'master_nonconformity_types.id', '=', 'master_nonconformity_sub_types.nonconformity_type_id')
            ->orderBy('master_nonconformity_types.name')
            ->get();

        return Inertia::render('finding/create', compact('nonconformityType'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'nonconformity_type_id' => 'required|exists:master_nonconformity_types,id',
            'finding_description' => 'required|string',
            'photo_before' => 'required|image|mimes:jpg,jpeg,png|max:2048',
            'location_details' => 'required|string',
            'root_cause' => 'required|string',
        ]);

        DB::transaction(function () use ($request) {
            $data = $request->except(['photo_before']);

            if ($request->hasFile('photo_before')) {
                $data['photo_before'] = $request->file('photo_before')->store('finding-images', 'public');
            }

            // Generate CAR number (you may want to extract this logic into a service later)
            $carNumber = auth()->user()->plant->alias_name . '/' . sprintf('%03d', Finding::count() + 1) . '/' . now()->format('d/m/Y');

            // Create the finding
            $finding = Finding::create(array_merge($data, [
                'finding_status_code' => 'SOP', // Status Open
                'created_by' => auth()->id(),
                'entity_code' => auth()->user()->entity_code,
                'plant_code' => auth()->user()->plant_code,
                'car_number_auto' => $carNumber,
            ]));

            // Get all approval stages, ordered
            $findingApprovalStage = FindingApprovalStage::orderBy('stage')->get();

            foreach ($findingApprovalStage as $row) {
                FindingApprovalHistory::create([
                    'finding_id' => $finding->id,
                    'stage' => $row->stage,
                    'approval_status' => 'PENDING',
                    'verified_by' => null,
                    'verified_at' => null,
                    'note' => null,
                ]);
            }
        });

        return redirect()->route('finding.index')->with('success', 'Temuan created successfully and approval flow initialized.');
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $finding = Finding::with(['nonconformityType', 'nonconformitySubType', 'findingApprovalHistories', 'findingStatus', 'entity', 'plant', 'createdBy'])->findOrFail($id);
        return Inertia::render('finding/show', compact('finding'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Finding $finding)
    {
        return Inertia::render('finding/edit', compact('finding'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Finding $finding)
    {
        $request->validate([
            'status_finding' => 'required|string',
            'approval_status' => 'required|string',
            'car_number_auto' => 'required|string',
            'date' => 'required|date',
            'nonconformity_type_id' => 'required|exists:nonconformity_types,id',
            'finding_description' => 'required|string',
            'photo_before' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'location_details' => 'required|string',
            'root_cause' => 'required|string',
            'car_number_manual' => 'required|string',
            'corrective_plan' => 'required|string',
            'corrective_due_date' => 'required|date',
            'corrective_action' => 'required|string',
            'note' => 'nullable|string',
            'photo_after' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $data = $request->except(['photo_before', 'photo_after']);

        if ($request->hasFile('photo_before')) {
            if ($finding->photo_before) {
                \Storage::disk('public')->delete($finding->photo_before);
            }
            $data['photo_before'] = $request->file('photo_before')->store('finding-images', 'public');
        }

        if ($request->hasFile('photo_after')) {
            if ($finding->photo_after) {
                \Storage::disk('public')->delete($finding->photo_after);
            }
            $data['photo_after'] = $request->file('photo_after')->store('finding-images', 'public');
        }

        $finding->update($data);

        return redirect()->route('finding.index')->with('success', 'Temuan updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Finding $finding)
    {
        if ($finding->photo_before) {
            \Storage::disk('public')->delete($finding->photo_before);
        }
        if ($finding->photo_after) {
            \Storage::disk('public')->delete($finding->photo_after);
        }

        $finding->delete();

        return redirect()->route('finding.index')->with('success', 'Temuan deleted successfully.');
    }
}
