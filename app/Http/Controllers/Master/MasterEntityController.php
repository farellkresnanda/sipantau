<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterEntity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterEntityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $masterEntities = MasterEntity::latest()->get();

        return Inertia::render('master/entity/page', compact('masterEntities'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('master/entity/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'entity_code' => 'required|string|max:255',
            'group_code' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'alias_name' => 'required|string|max:255',
        ]);

        MasterEntity::create([
            'entity_code' => $request->entity_code,
            'group_code' => $request->group_code,
            'name' => $request->name,
            'alias_name' => $request->alias_name,
        ]);

        activity()->log('User created a new master entity');

        return redirect()->route('entity.index')->with('success', 'Master entity created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MasterEntity $masterEntity, $id)
    {
        $masterEntity = $masterEntity->findOrFail($id);

        return Inertia::render('master/entity/edit', compact('masterEntity'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MasterEntity $masterEntity, $id)
    {
        $request->validate([
            'entity_code' => 'required|string|max:255',
            'group_code' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'alias_name' => 'required|string|max:255',
        ]);

        $masterEntity = $masterEntity->findOrFail($id);
        $masterEntity->update([
            'entity_code' => $request->entity_code,
            'group_code' => $request->group_code,
            'name' => $request->name,
            'alias_name' => $request->alias_name,
        ]);

        activity()->log('User updated a master entity');

        return redirect()->route('entity.index')->with('success', 'Master entity updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterEntity $masterEntity, $id)
    {
        $masterEntity = $masterEntity->findOrFail($id);

        // Hapus semua plant yang berkaitan
        $masterEntity->plants()->delete();

        // Hapus entity-nya sendiri
        $masterEntity->delete();

        // Catat log
        activity()->log('User deleted a master entity beserta semua plants terkait.');

        return redirect()->route('entity.index')
            ->with('success', 'Master entity dan semua plant terkait berhasil dihapus.');
    }
}
