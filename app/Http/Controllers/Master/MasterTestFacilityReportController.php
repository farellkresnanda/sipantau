<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterTestFacilityReport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterTestFacilityReportController extends Controller
{
    public function index()
    {
        $data = MasterTestFacilityReport::latest()->get();

        return Inertia::render('master/test-facility-report/page', [
            'data' => $data,
        ]);
    }

    public function create()
    {
        return Inertia::render('master/test-facility-report/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'facility_name' => 'required|string|max:255',
            'reference' => 'required|string|max:255',
        ]);

        MasterTestFacilityReport::create($request->only('facility_name', 'reference'));

        return redirect()
            ->route('test-facility-report.index')
            ->with('success', 'Berhasil menambahkan data');
    }

    public function edit($id)
    {
        $facility = MasterTestFacilityReport::findOrFail($id);

        return Inertia::render('master/test-facility-report/edit', [
            'facility' => $facility,
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'facility_name' => 'required|string|max:255',
            'reference' => 'required|string|max:255',
        ]);

        $facility = MasterTestFacilityReport::findOrFail($id);
        $facility->update($request->only('facility_name', 'reference'));

        return redirect()
            ->route('test-facility-report.index')
            ->with('success', 'Berhasil memperbarui data');
    }

    public function destroy($id)
    {
        $facility = MasterTestFacilityReport::findOrFail($id);
        $facility->delete();

        return redirect()
            ->route('test-facility-report.index')
            ->with('success', 'Berhasil menghapus data');
    }
}
