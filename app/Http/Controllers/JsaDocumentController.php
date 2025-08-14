<?php

namespace App\Http\Controllers;

use App\Models\JsaDocument;
use Illuminate\Http\Request;

class JsaDocumentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $jsaDocuments = JsaDocument::with(['approvalStatus', 'plant', 'items', 'entity', 'createdBy'])
            ->latest()
            ->get();

        return inertia('analysis/jsa/page', [
            'jsaDocuments' => $jsaDocuments,
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
    public function show(JsaDocument $jsaDocument)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(JsaDocument $jsaDocument)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, JsaDocument $jsaDocument)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(JsaDocument $jsaDocument)
    {
        //
    }

    /**
     * Verify the JSA document.
     */
    public function verify($uuid)
    {

    }

    /**
     * Print the JSA document.
     */
    public function print($uuid)
    {

    }
}
