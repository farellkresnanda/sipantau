<?php

namespace App\Http\Controllers;

use App\Models\K3Info;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class K3InfoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $k3Infos = K3Info::latest()->get();
        return Inertia::render('k3info/page', compact('k3Infos'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('k3info/create');
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
            'image_path' => 'required|image|mimes:jpg,jpeg,png|max:2048'
        ]);

        $image = $request->file('image_path');
        $imagePath = $image->store('k3-images', 'public');

        K3Info::create([
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status,
            'image_path' => $imagePath
        ]);

        activity()->log('User created a new K3 info');

        return redirect()->route('k3info.index')->with('success', 'K3 Info created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(K3Info $k3Info, $id)
    {
        $k3Info = $k3Info::findOrFail($id);
        return Inertia::render('k3info/show', compact('k3Info'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(K3Info $k3Info, $id)
    {
        $k3Info = $k3Info::findOrFail($id);
        return Inertia::render('k3info/edit', compact('k3Info'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, K3Info $k3Info, $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'status' => 'required|string',
            'image_path' => 'nullable|image|mimes:jpg,jpeg,png|max:2048'
        ]);

        $data = [
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status,
        ];

        $k3Info = $k3Info::findOrFail($id);

        if ($request->hasFile('image_path')) {
            if ($k3Info->image_path) {
                Storage::disk('public')->delete($k3Info->image_path);
            }
            $image = $request->file('image_path');
            $data['image_path'] = $image->store('k3-images', 'public');
        }

        $k3Info->update($data);

        activity()->log('User updated a K3 info');

        return redirect()->route('k3info.index')->with('success', 'K3 Info updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(K3Info $k3Info, $id)
    {
        $k3Info = $k3Info->findOrFail($id);
        // Delete the image file if it exists
        if ($k3Info->image_path) {
            \Storage::disk('public')->delete($k3Info->image_path);
        }

        $k3Info->delete();

        activity()->log('User deleted a K3 info');

        return redirect()->route('k3info.index')->with('success', 'K3 Info deleted successfully.');
    }
}
