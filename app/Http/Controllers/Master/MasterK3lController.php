<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterK3l;
use App\Models\Master\MasterK3lDeskripsi;
use Illuminate\Support\Facades\DB;

use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterK3lController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        $k3List = MasterK3l::latest()->with('deskripsi')->get();
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
            'tujuan' => 'required|string|max:255',
            'deskripsi' => 'required|array|min:1',
            'deskripsi.*.deskripsi' => 'required|string|max:255',
        ]);

        DB::transaction(function () use ($validated) {
            // Simpan tujuan ke master_k3l
            $masterK3l = MasterK3l::create([
                'tujuan' => $validated['tujuan'],
            ]);

            // Simpan deskripsi ke master_k3l_deskripsi
            foreach ($validated['deskripsi'] as $item) {
                $masterK3l->deskripsi()->create([
                    'deskripsi' => $item['deskripsi'],
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
        $k3l = MasterK3l::with('deskripsi')->findOrFail($id);

        return Inertia::render('master/k3l/edit', [
            'data' => [
                'id' => $k3l->id,
                'tujuan' => $k3l->tujuan,
                'deskripsi' => $k3l->deskripsi->map(fn($d) => [
                    'id' => $d->id,
                    'deskripsi' => $d->deskripsi
                ]),
            ]
        ]);
    }



    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'tujuan' => 'required|string|max:255',
            'deskripsi' => 'required|array|min:1',
            'deskripsi.*.id' => 'nullable|exists:master_k3l_deskripsi,id',
            'deskripsi.*.deskripsi' => 'required|string|max:255',
        ]);

        DB::transaction(function () use ($validated, $id) {
            $k3l = MasterK3l::findOrFail($id);
            $k3l->update(['tujuan' => $validated['tujuan']]);

            // ID yang dikirim dari form
            $incomingIds = collect($validated['deskripsi'])->pluck('id')->filter()->toArray();

            // Hapus deskripsi lama yang tidak dikirim lagi
            $existingIds = $k3l->deskripsi()->pluck('id')->toArray();
            $toDelete = array_diff($existingIds, $incomingIds);
            MasterK3lDeskripsi::destroy($toDelete);

            // Tambah atau update deskripsi
            foreach ($validated['deskripsi'] as $desc) {
                if (isset($desc['id'])) {
                    MasterK3lDeskripsi::where('id', $desc['id'])->update([
                        'deskripsi' => $desc['deskripsi']
                    ]);
                } else {
                    $k3l->deskripsi()->create([
                        'deskripsi' => $desc['deskripsi']
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
        MasterK3lDeskripsi::where('master_k3l_id', $id)->delete();
        $masterK3l->delete();


        activity()->log('User deleted a master K3l');

        return redirect()->route('k3l.index')
            ->with('success', 'Master K3L deleted successfully.');
    }
}
