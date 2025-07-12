<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterK3l;
use App\Models\Master\MasterK3lDescription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MasterK3lController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        $k3List = MasterK3l::latest()->with('description')->get();

        return Inertia::render('master/k3l/page', compact('k3List'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('master/k3l/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'objective' => 'required|string|max:255',
            'description' => 'required|array|min:1',
            'description.*.description' => 'required|string|max:255',
        ]);

        DB::transaction(function () use ($validated) {
            // Simpan objective ke master_k3l
            $masterK3l = MasterK3l::create([
                'objective' => $validated['objective'],
            ]);

            // Simpan description ke master_k3l_description
            foreach ($validated['description'] as $item) {
                $masterK3l->description()->create([
                    'description' => $item['description'],
                ]);
            }
        });

        return redirect()->route('k3l.index')->with('success', 'Data berhasil ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(MasterK3l $masterInspeksiK3l)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $k3l = MasterK3l::with('description')->findOrFail($id);

        return Inertia::render('master/k3l/edit', [
            'data' => [
                'id' => $k3l->id,
                'objective' => $k3l->objective,
                'description' => $k3l->description->map(fn ($d) => [
                    'id' => $d->id,
                    'description' => $d->description,
                ]),
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'objective' => 'required|string|max:255',
            'description' => 'required|array|min:1',
            'description.*.id' => 'nullable|exists:master_k3l_description,id',
            'description.*.description' => 'required|string|max:255',
        ]);

        DB::transaction(function () use ($validated, $id) {
            $k3l = MasterK3l::findOrFail($id);
            $k3l->update(['objective' => $validated['objective']]);

            // ID yang dikirim dari form
            $incomingIds = collect($validated['description'])->pluck('id')->filter()->toArray();

            // Hapus description lama yang tidak dikirim lagi
            $existingIds = $k3l->description()->pluck('id')->toArray();
            $toDelete = array_diff($existingIds, $incomingIds);
            MasterK3lDescription::destroy($toDelete);

            // Tambah atau update description
            foreach ($validated['description'] as $desc) {
                if (isset($desc['id'])) {
                    MasterK3lDescription::where('id', $desc['id'])->update([
                        'description' => $desc['description'],
                    ]);
                } else {
                    $k3l->description()->create([
                        'description' => $desc['description'],
                    ]);
                }
            }
        });

        return redirect()->route('k3l.index')->with('success', 'Data berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterK3l $masterK3l, $id)
    {
        $masterK3l = $masterK3l->findOrFail($id);
        MasterK3lDescription::where('master_k3l_id', $id)->delete();
        $masterK3l->delete();

        activity()->log('User deleted a master K3l');

        return redirect()->route('k3l.index')
            ->with('success', 'Master K3L deleted successfully.');
    }
}
