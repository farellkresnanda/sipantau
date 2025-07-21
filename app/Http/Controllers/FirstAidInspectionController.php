<?php

namespace App\Http\Controllers;

use App\Models\FirstAidInspection;
use App\Models\Master\MasterEntity;
use App\Models\Master\MasterPlant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Str;

class FirstAidInspectionController extends Controller
{
    public function index()
    {
        $inspections = FirstAidInspection::with(['entity', 'plant'])
            ->latest('inspection_date')
            ->paginate(10);

        return Inertia::render('inspection/first-aid/page', [
            'inspections' => $inspections,
        ]);
    }

    public function create()
    {
        return Inertia::render('inspection/first-aid/create', [
            'entities' => MasterEntity::all(),
            'plants' => MasterPlant::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'entity_code' => 'required|exists:master_entities,code',
            'plant_code' => 'required|exists:master_plants,code',
            'inspection_date' => 'required|date',
            'project_name' => 'nullable|string|max:255',
            'approval_status_code' => 'required|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            $prefix = strtoupper($validated['entity_code']);
            $today = now()->toDateString();

            $runningNumber = FirstAidInspection::where('entity_code', $validated['entity_code'])
                ->whereDate('created_at', $today)
                ->count() + 1;

            $formattedNumber = str_pad($runningNumber, 3, '0', STR_PAD_LEFT);
            $formattedDate = now()->format('d/m/Y');
            $carNumber = "{$prefix}/P3K/{$formattedNumber}/{$formattedDate}";

            $validated['uuid'] = (string) Str::uuid();
            $validated['car_auto_number'] = $carNumber;

            FirstAidInspection::create($validated);

            DB::commit();

            return redirect()->route('inspection.first-aid.index')->with('success', 'Inspeksi berhasil disimpan.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error', 'Gagal menyimpan inspeksi: ' . $e->getMessage());
        }
    }

    public function show(InspectionFirstAid $inspection)
    {
        $inspection->load(['entity', 'plant']);

        return Inertia::render('inspection/first-aid/show', [
            'inspection' => $inspection,
        ]);
    }

    public function edit(FirstAidInspection $inspection)
    {
        $inspection->load(['entity', 'plant']);

        return Inertia::render('inspection/first-aid/edit', [
            'inspection' => $inspection,
            'entities' => MasterEntity::all(),
            'plants' => MasterPlant::all(),
        ]);
    }

    public function update(Request $request, InspectionFirstAid $inspection)
    {
        $validated = $request->validate([
            'entity_code' => 'required|exists:master_entities,code',
            'plant_code' => 'required|exists:master_plants,code',
            'inspection_date' => 'required|date',
            'project_name' => 'nullable|string|max:255',
            'approval_status_code' => 'required|string|max:255',
        ]);

        try {
            $inspection->update($validated);

            return redirect()->route('inspection.first-aid.index')->with('success', 'Data inspeksi berhasil diperbarui.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal memperbarui inspeksi: ' . $e->getMessage());
        }
    }

    public function destroy(InspectionFirstAid $inspection)
    {
        try {
            $inspection->delete();

            return back()->with('success', 'Data inspeksi berhasil dihapus.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menghapus data: ' . $e->getMessage());
        }
    }
}