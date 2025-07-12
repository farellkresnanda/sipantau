<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterGensetWorkStandard;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterGensetWorkStandardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $masterGensetWorkStandards = MasterGensetWorkStandard::latest()->get();

        return Inertia::render('master/genset-work-standard/page', compact('masterGensetWorkStandards'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('master/genset-work-standard/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'work_item' => 'required|string|max:255',
            'period' => 'required|string|max:255',
        ]);

        MasterGensetWorkStandard::create($request->all());

        activity()->log('User created a new master standar kerja genset');

        return redirect()->route('genset-work-standard.index')
            ->with('success', 'Master standar kerja genset created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MasterGensetWorkStandard $masterGensetWorkStandard, $id)
    {
        $masterGensetWorkStandard = $masterGensetWorkStandard->findOrFail($id);

        return Inertia::render('master/genset-work-standard/edit', compact('masterGensetWorkStandard'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MasterGensetWorkStandard $masterGensetWorkStandard, $id)
    {
        $request->validate([
            'work_item' => 'required|string|max:255',
            'period' => 'required|string|max:255',
        ]);

        $masterGensetWorkStandard = $masterGensetWorkStandard->findOrFail($id);
        $masterGensetWorkStandard->update($request->all());

        activity()->log('User updated a master standar kerja genset');

        return redirect()->route('genset-work-standard.index')
            ->with('success', 'Master standar kerja genset updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterGensetWorkStandard $masterGensetWorkStandard)
    {
        $masterGensetWorkStandard->delete();

        activity()->log('User deleted a master standar kerja genset');

        return redirect()->route('genset-work-standard.index')
            ->with('success', 'Master standar kerja genset deleted successfully.');
    }
}
