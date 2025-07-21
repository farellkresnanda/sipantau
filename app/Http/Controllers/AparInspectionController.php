<?php

namespace App\Http\Controllers;

use App\Models\AparInspection;
use Illuminate\Http\Request;

class AparInspectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $aparInspections = AparInspection::latest()->with(['plant', 'items', 'entity', 'apar'])->get();
        // dd($aparInspections);

        return inertia('inspection/apar/page', [
            'aparInspections' => $aparInspections,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(AparInspection $aparInspection)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AparInspection $aparInspection)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AparInspection $aparInspection)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AparInspection $aparInspection)
    {
        //
    }
}
