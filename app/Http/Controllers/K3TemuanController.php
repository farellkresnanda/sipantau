<?php

namespace App\Http\Controllers;

use App\Models\K3Temuan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class K3TemuanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $k3Temuans = K3Temuan::latest()->get();
        return Inertia::render('k3temuan/page', compact('k3Temuans'));
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
    public function show(K3Temuan $k3Temuan)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(K3Temuan $k3Temuan)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, K3Temuan $k3Temuan)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(K3Temuan $k3Temuan)
    {
        //
    }
}
