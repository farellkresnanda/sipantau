<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterHseStatistic;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterHseStatisticController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $masterHseStatistics = MasterHseStatistic::latest()->get();

        return inertia('master/hse-statistic/page', compact('masterHseStatistics'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // This method can be used to show a form for creating a new Sertifikasi K3
        // You can return a view or an Inertia page here
        return inertia('master/hse-statistic/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'statistic_data' => 'required|string|max:255',

        ]);
        MasterHseStatistic::create([
            'statistic_data' => $request->statistic_data,

        ]);

        activity()->log('User created a new master statistik K3');

        return redirect()->route('hse-statistic.index')->with('success', 'Master statistik k3 created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MasterHseStatistic $masterHseStatistic, $id)
    {
        $masterHseStatistic = $masterHseStatistic->findOrFail($id);

        return Inertia::render('master/hse-statistic/edit', [
            'masterHseStatistic' => $masterHseStatistic,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MasterHseStatistic $masterHseStatistic, $id)
    {
        $request->validate([
            'statistic_data' => 'required|string|max:255',
        ]);

        $masterHseStatistic = $masterHseStatistic->findOrFail($id);
        $masterHseStatistic->update([
            'statistic_data' => $request->statistic_data,
        ]);

        activity()->log('User updated a master statistik K3');

        return redirect()->route('hse-statistic.index')->with('success', 'Master statistik K3 updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterHseStatistic $masterHseStatistic, $id)
    {
        $masterHseStatistic = $masterHseStatistic->findOrFail($id);
        $masterHseStatistic->delete();
        activity()->log('User deleted a master statistik k3');

        return redirect()->route('hse-statistic.index')->with('success', 'Master statistik k3 deleted successfully.');
    }
}
