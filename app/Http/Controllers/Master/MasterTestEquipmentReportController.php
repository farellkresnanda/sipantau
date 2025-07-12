<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterTestEquipmentReport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterTestEquipmentReportController extends Controller
{
    public function index()
    {
        $data = MasterTestEquipmentReport::latest()->get();

        return Inertia::render('master/test-equipment-report/page', [
            'data' => $data,
        ]);
    }

    public function create()
    {
        return Inertia::render('master/test-equipment-report/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'equipment_name' => 'required|string|max:255',
            'reference' => 'nullable|string|max:255',
        ]);

        MasterTestEquipmentReport::create([
            'equipment_name' => $request->equipment_name,
            'reference' => $request->reference,
        ]);

        return redirect()
            ->route('test-equipment-report.index')
            ->with('success', 'Berhasil menambahkan data');
    }

    public function edit($id)
    {
        $peralatan = MasterTestEquipmentReport::findOrFail($id);

        return Inertia::render('master/test-equipment-report/edit', [
            'peralatan' => $peralatan,
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'equipment_name' => 'required|string|max:255',
            'reference' => 'nullable|string|max:255',
        ]);

        $peralatan = MasterTestEquipmentReport::findOrFail($id);
        $peralatan->update([
            'equipment_name' => $request->equipment_name,
            'reference' => $request->reference,
        ]);

        return redirect()
            ->route('test-equipment-report.index')
            ->with('success', 'Berhasil memperbarui data');
    }

    public function destroy($id)
    {
        $peralatan = MasterTestEquipmentReport::findOrFail($id);
        $peralatan->delete();

        return redirect()
            ->route('test-equipment-report.index')
            ->with('success', 'Berhasil menghapus data');
    }
}
