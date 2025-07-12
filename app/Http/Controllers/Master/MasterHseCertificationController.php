<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterHseCertification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterHseCertificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $masterHseCertifications = MasterHseCertification::latest()->get();

        return inertia('master/hse-certification/page', compact('masterHseCertifications'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('master/hse-certification/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'certification_type' => 'required|string|max:255',

        ]);
        MasterHseCertification::create([
            'certification_type' => $request->certification_type,

        ]);

        activity()->log('User created a new master sertifikasi K3');

        return redirect()->route('hse-certification.index')->with('success', 'Master sertifikasi k3 created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MasterHseCertification $masterHseCertification, $id)
    {
        $masterHseCertification = $masterHseCertification->findOrFail($id);

        return Inertia::render('master/hse-certification/edit', [
            'masterHseCertification' => $masterHseCertification,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MasterHseCertification $masterHseCertification)
    {
        $request->validate([
            'certification_type' => 'required|string|max:255',
        ]);

        $masterHseCertification->update([
            'certification_type' => $request->certification_type,
        ]);

        activity()->log('User updated a master sertifikasi K3');

        return redirect()->route('hse-certification.index')->with('success', 'Master sertifikasi K3 updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterHseCertification $masterHseCertification, $id)
    {
        $masterHseCertification = MasterHseCertification::findOrFail($id);
        $masterHseCertification->delete();
        activity()->log('User deleted a master sertifikasi k3');

        return redirect()->route('hse-certification.index')->with('success', 'Master sertifikasi k3 deleted successfully.');
    }
}
