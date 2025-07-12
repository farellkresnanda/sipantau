<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterNonconformitySubType;
use App\Models\Master\MasterNonconformityType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterNonconformityTypeController extends Controller
{
    /**
     * Display a listing of the master nc types.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $masterNonconformityType = MasterNonconformityType::with('nonconformitySubType')->latest()->get();

        return Inertia::render('master/nonconformity-type/page', [
            'masterNonconformityType' => $masterNonconformityType,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        return Inertia::render('master/nonconformity-type/create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nonconformity_sub_type' => 'nullable|array',
            'nonconformity_sub_type.*.name' => 'nullable|string|max:255',
        ]);

        $type = MasterNonconformityType::create([
            'name' => $validated['name'],
        ]);

        if (! empty($validated['nonconformity_sub_type'])) {
            // Filter hanya nonconformity_sub_type yang memiliki name
            $filteredSubJenis = array_filter($validated['nonconformity_sub_type'], fn ($item) => ! empty($item['name']));

            if (! empty($filteredSubJenis)) {
                $type->nonconformitySubType()->createMany($filteredSubJenis);
            }
        }

        return redirect()->route('nonconformity-type.index')->with('success', 'Berhasil menambahkan data');
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @return \Inertia\Response
     */
    public function edit(string $id)
    {
        $masterNonconformityType = MasterNonconformityType::with('nonconformitySubType')->findOrFail($id);

        return Inertia::render('master/nonconformity-type/edit', [
            'masterNonconformityType' => $masterNonconformityType,
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nonconformity_sub_type' => 'nullable|array',
            'nonconformity_sub_type.*.id' => 'nullable|integer|exists:master_nonconformity_sub_types,id',
            'nonconformity_sub_type.*.name' => 'nullable|string|max:255',
        ]);

        $type = MasterNonconformityType::findOrFail($id);
        $type->update(['name' => $validated['name']]);

        // Ambil semua ID sub yang dikirim agar yang tidak dikirim bisa dihapus
        $incomingIds = collect($validated['nonconformity_sub_type'])->pluck('id')->filter()->all();

        // Hapus nonconformity_sub_type yang tidak ada di inputan
        MasterNonconformitySubType::where('nonconformity_type_id', $id)
            ->whereNotIn('id', $incomingIds)
            ->delete();

        // Proses nonconformity_sub_type
        foreach ($validated['nonconformity_sub_type'] ?? [] as $sub) {
            if (! empty($sub['id'])) {
                // Update nonconformity_sub_type yang sudah ada
                MasterNonconformitySubType::where('id', $sub['id'])->update([
                    'name' => $sub['name'],
                ]);
            } elseif (! empty($sub['name'])) {
                // Tambah nonconformity_sub_type baru
                MasterNonconformitySubType::create([
                    'nonconformity_type_id' => $id,
                    'name' => $sub['name'],
                ]);
            }
        }

        return redirect()->route('nonconformity-type.index')->with('success', 'Berhasil update data');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(string $id)
    {
        $type = MasterNonconformityType::findOrFail($id);
        $type->nonconformitySubType()->delete();
        $type->delete();

        return redirect()->back()->with('success', 'Berhasil menghapus data');
    }
}
