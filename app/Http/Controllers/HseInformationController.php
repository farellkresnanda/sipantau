<?php

namespace App\Http\Controllers;

use App\Models\HseInformation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HseInformationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $hseInformation = HseInformation::latest()->get();

        return Inertia::render('analysis/hse-information/page', compact('hseInformation'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('analysis/hse-information/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'status' => 'required|string',
            'image_path' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $image = $request->file('image_path');
        $imagePath = $image->store('k3-images', 'public');

        HseInformation::create([
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status,
            'image_path' => $imagePath,
        ]);

        activity()->log('User created a new K3 info');

        return redirect()->route('hse-information.index')->with('success', 'K3 Info created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(HseInformation $hseInformation)
    {
        return Inertia::render('analysis/hse-information/show', compact('hseInformation'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(HseInformation $hseInformation)
    {
        return Inertia::render('analysis/hse-information/edit', compact('hseInformation'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, HseInformation $hseInformation)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'status' => 'required|string',
            'image_path' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $data = [
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status,
        ];

        if ($request->hasFile('image_path')) {
            if ($hseInformation->image_path) {
                Storage::disk('public')->delete($hseInformation->image_path);
            }
            $image = $request->file('image_path');
            $data['image_path'] = $image->store('k3-images', 'public');
        }

        $hseInformation->update($data);

        activity()->log('User updated a K3 info');

        return redirect()->route('hse-information.index')->with('success', 'K3 Info updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(HseInformation $hseInformation)
    {
        // Delete the image file if it exists
        if ($hseInformation->image_path) {
            \Storage::disk('public')->delete($hseInformation->image_path);
        }

        $hseInformation->delete();

        activity()->log('User deleted a K3 info');

        return redirect()->route('hse-information.index')->with('success', 'K3 Info deleted successfully.');
    }
}
