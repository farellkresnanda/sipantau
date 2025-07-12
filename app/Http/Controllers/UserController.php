<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::with('roles')->latest()->get();

        return Inertia::render('users/page', compact('users'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = Role::orderBy('name')->get();

        return Inertia::render('users/create', compact('roles'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|exists:roles,name',
        ]);

        $user = User::create([
            'name' => strtoupper($request->name),
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'npp' => $request->npp,
            'npp_sap' => $request->npp_sap,
            'position_code' => $request->position_code,
            'position_name' => $request->position_name,
            'position_level' => $request->position_level,
            'position_level_name' => $request->position_level_name,
            'entity_group_code' => $request->entity_group_code,
            'entity_code' => $request->entity_code,
            'entity_name' => $request->entity_name,
            'entity_alias_name' => $request->entity_alias_name,
            'directorate_code' => $request->directorate_code,
            'directorate_name' => $request->directorate_name,
            'division_code' => $request->division_code,
            'division_name' => $request->division_name,
            'unit_code' => $request->unit_code,
            'unit_name' => $request->unit_name,
            'sub_unit_code' => $request->sub_unit_code,
            'sub_unit_name' => $request->sub_unit_name,
            'department_code' => $request->department_code,
            'department_name' => $request->department_name,
            'branch_manager_code' => $request->branch_manager_code,
            'branch_manager_name' => $request->branch_manager_name,
        ]);

        $user->assignRole($request->role);

        activity()->log('User created a new user');

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }



    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::with('roles')->findOrFail($id);

        return Inertia::render('users/show', compact('user'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $user = User::with('roles')->findOrFail($id);
        $roles = Role::orderBy('name')->get();

        return Inertia::render('users/edit', compact('user', 'roles'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$id,
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|exists:roles,name',
        ]);

        $user = User::findOrFail($id);
        $user->name = strtoupper($request->name);
        $user->email = $request->email;
        $user->npp = $request->npp;
        $user->npp_sap = $request->npp_sap;
        $user->position_code = $request->position_code;
        $user->position_name = $request->position_name;
        $user->position_level = $request->position_level;
        $user->position_level_name = $request->position_level_name;
        $user->entity_group_code = $request->entity_group_code;
        $user->entity_code = $request->entity_code;
        $user->entity_name = $request->entity_name;
        $user->entity_alias_name = $request->entity_alias_name;
        $user->directorate_code = $request->directorate_code;
        $user->directorate_name = $request->directorate_name;
        $user->division_code = $request->division_code;
        $user->division_name = $request->division_name;
        $user->unit_code = $request->unit_code;
        $user->unit_name = $request->unit_name;
        $user->sub_unit_code = $request->sub_unit_code;
        $user->sub_unit_name = $request->sub_unit_name;
        $user->department_code = $request->department_code;
        $user->department_name = $request->department_name;
        $user->branch_manager_code = $request->branch_manager_code;
        $user->branch_manager_name = $request->branch_manager_name;

        if ($request->filled('password')) {
            $user->password = bcrypt($request->password);
        }

        $user->save();

        $user->syncRoles($request->role);

        activity()->log('User updated a user');

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);

        if ($user->id === auth()->user()->id) {
            return redirect()->route('users.index')->with('error', 'You cannot delete your own account.');
        }

        // Remove all roles first
        $user->roles()->detach();

        $user->delete();

        activity()->log('User deleted a user');

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }
}
