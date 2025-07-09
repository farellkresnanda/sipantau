<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\MasterStatistikK3;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterStatistikK3Controller extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $masterStatistikK3 = MasterStatistikK3::latest()->get();
        return inertia('master/statistik-k3/page', compact('masterStatistikK3'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // This method can be used to show a form for creating a new Sertifikasi K3
        // You can return a view or an Inertia page here
        return inertia('master/statistik-k3/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'data_statistik_k3' => 'required|string|max:255',

        ]);
        MasterStatistikK3::create([
            'data_statistik_k3' => $request->data_statistik_k3,

        ]);

        activity()->log('User created a new master statistik K3');

        return redirect()->route('statistik-k3.index')->with('success', 'Master statistik k3 created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(MasterStatistikK3 $masterStatistikK3)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MasterStatistikK3 $masterStatistikK3, $id)
    {
        $masterStatistikK3 = MasterStatistikK3::findOrFail($id);

        return Inertia::render('master/statistik-k3/edit', [
            'masterStatistikK3' => $masterStatistikK3,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MAsterStatistikK3 $statistik_k3)
    {
        $request->validate([
            'data_statistik_k3' => 'required|string|max:255',
        ]);

        $statistik_k3->update([
            'data_statistik_k3' => $request->data_statistik_k3,
        ]);

        activity()->log('User updated a master statistik K3');

        return redirect()->route('statistik-k3.index')->with('success', 'Master statistik K3 updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MasterStatistikK3 $masterStatistikK3, $id)
    {
        $masterStatistikK3 = MasterStatistikK3::findOrFail($id);
        $masterStatistikK3->delete();
        activity()->log('User deleted a master statistik k3');
        return redirect()->route('statistik-k3.index')->with('success', 'Master statistik k3 deleted successfully.');
    }
}
