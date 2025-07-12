<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterPriorityScale;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterPriorityScaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $priorityScales = MasterPriorityScale::latest()->get();

        return inertia('master/priority-scale/page', compact('priorityScales'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('master/priority-scale/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'scale' => 'required|numeric|min:0|max:100',
        ]);
        MasterPriorityScale::create([
            'name' => $request->name,
            'scale' => $request->scale,
        ]);

        activity()->log('User created a new master skala prioritas');

        return redirect()->route('priority-scale.index')->with('success', 'Master skala prioritas created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MasterPriorityScale $masterPriorityScale, $id)
    {
        $masterPriorityScale = $masterPriorityScale->findOrFail($id);

        return Inertia::render('master/priority-scale/edit', [
            'masterPriorityScale' => $masterPriorityScale,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MasterPriorityScale $masterPriorityScale, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'scale' => 'required|numeric|min:0|max:100',
        ]);

        $masterPriorityScale = $masterPriorityScale->findOrFail($id);
        $masterPriorityScale->update([
            'name' => $request->name,
            'scale' => $request->scale,
        ]);

        activity()->log('User updated a master skala prioritas');

        return redirect()->route('priority-scale.index')->with('success', 'Master skala prioritas updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterPriorityScale $masterPriorityScale, $id)
    {
        $masterPriorityScale = $masterPriorityScale->findOrFail($id);
        $masterPriorityScale->delete();
        activity()->log('User deleted a master skala prioritas');

        return redirect()->route('priority-scale.index')->with('success', 'Master skala prioritas deleted successfully.');
    }
}
