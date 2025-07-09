<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterSertifikasiK3;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterSertifikasiK3Controller extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $sertifikasiK3 = MasterSertifikasiK3::latest()->get();
        return inertia('master/sertifikasiK3/page', compact('sertifikasiK3'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // This method can be used to show a form for creating a new Sertifikasi K3
        // You can return a view or an Inertia page here
        return inertia('master/sertifikasiK3/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'jenis_sertifikasi' => 'required|string|max:255',

        ]);
        MasterSertifikasiK3::create([
            'jenis_sertifikasi' => $request->jenis_sertifikasi,

        ]);

        activity()->log('User created a new master sertifikasi K3');

        return redirect()->route('sertifikasi-k3.index')->with('success', 'Master sertifikasi k3 created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(MasterSertifikasiK3 $masterSertifikasiK3)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MasterSertifikasiK3 $masterSertifikasiK3, $id)
    {
        $masterSertifikasiK3 = MasterSertifikasiK3::findOrFail($id);

        return Inertia::render('master/sertifikasiK3/edit', [
            'masterSertifikasiK3' => $masterSertifikasiK3,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MasterSertifikasiK3 $sertifikasi_k3)
    {
        $request->validate([
            'jenis_sertifikasi' => 'required|string|max:255',
        ]);

        $sertifikasi_k3->update([
            'jenis_sertifikasi' => $request->jenis_sertifikasi,
        ]);

        activity()->log('User updated a master sertifikasi K3');

        return redirect()->route('sertifikasi-k3.index')->with('success', 'Master sertifikasi K3 updated successfully.');
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterSertifikasiK3 $masterSertifikasiK3, $id)
    {
        $masterSertifikasiK3 = MasterSertifikasiK3::findOrFail($id);
        $masterSertifikasiK3->delete();
        activity()->log('User deleted a master sertifikasi k3');
        return redirect()->route('sertifikasi-k3.index')->with('success', 'Master sertifikasi k3 deleted successfully.');
    }
}
