<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterProbability;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterProbabilityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $probabilities = MasterProbability::latest()->get();

        return inertia('master/probability/page', compact('probabilities'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('master/probability/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'probability' => 'required|numeric|min:0|max:100',
        ]);
        MasterProbability::create([
            'name' => $request->name,
            'probability' => $request->probability,
        ]);

        activity()->log('User created a new master probability');

        return redirect()->route('probability.index')->with('success', 'Master probability created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(MasterProbability $masterProbabilitas)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MasterProbability $masterProbabilitas, $id)
    {
        $masterProbabilitas = MasterProbability::findOrFail($id);

        return Inertia::render('master/probability/edit', [
            'masterProbabilitas' => $masterProbabilitas,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MasterProbability $masterProbabilitas)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'probability' => 'required|numeric|min:0|max:100',
        ]);

        $masterProbabilitas->update([
            'name' => $request->name,
            'probability' => $request->probability,
        ]);

        activity()->log('User updated a master probability');

        return redirect()->route('probability.index')->with('success', 'Master probability updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterProbability $masterProbabilitas, $id)
    {
        $masterProbabilitas = MasterProbability::findOrFail($id);
        $masterProbabilitas->delete();
        activity()->log('User deleted a master probability');

        return redirect()->route('probability.index')->with('success', 'Master probability deleted successfully.');
    }
}
