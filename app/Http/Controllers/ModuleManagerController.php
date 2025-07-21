<?php

namespace App\Http\Controllers;

use App\Models\Master\MasterPlant;
use App\Models\Module;
use App\Models\ModuleManager;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ModuleManagerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $moduleManagers = ModuleManager::with(['user', 'entity', 'plant'])
            ->selectRaw('COUNT(*) as count_module,
                user_id,
                MAX(module_managers.created_at) as latest_created_at,
                MAX(module_managers.entity_code) as latest_entity_code,
                MAX(module_managers.plant_code) as latest_plant_code,
                MAX(master_entities.name) as entity_name,
                MAX(master_plants.name) as plant_name')
            ->leftJoin('master_entities', 'module_managers.entity_code', '=', 'master_entities.entity_code')
            ->leftJoin('master_plants', 'module_managers.plant_code', '=', 'master_plants.plant_code')
            ->groupBy('user_id')
            ->orderBy('latest_created_at', 'desc')
            ->get();

        return Inertia::render('module/page', compact('moduleManagers'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $users = User::with('roles', 'entity', 'plant')->latest()->get();
        $modules = Module::orderBy('code', 'ASC')->get();
        $roles = Role::orderBy('name')->get();

        $plants = MasterPlant::select(
            'master_plants.id',
            'master_plants.name as name_plant',
            'master_plants.entity_code',
            'master_plants.plant_code',
            'master_entities.name as entity_name'
        )
            ->leftJoin('master_entities', 'master_plants.entity_code', '=', 'master_entities.entity_code')
            ->orderBy('master_entities.name')
            ->get();

        return Inertia::render('module/create', compact('users', 'modules', 'roles', 'plants'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'module_ids' => 'required|exists:modules,id',
            'role_name' => 'required|exists:roles,name',
            'plant_code' => 'required|exists:master_plants,plant_code',
            'entity_code' => 'required|exists:master_entities,entity_code',
        ]);

        foreach ($request->module_ids as $moduleId) {
            ModuleManager::create([
                'module_id' => $moduleId,
                'user_id' => $request->user_id,
                'role_name' => $request->role_name,
                'entity_code' => $request->entity_code,
                'plant_code' => $request->plant_code,
                'is_active' => $request->is_active,
            ]);
        }

        return redirect()->route('module-managers.index')->with('success', __('Module Manager created successfully.'));
    }

    /**
     * Display the specified resource.
     */
    public function show(ModuleManager $moduleManager)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($user_id)
    {
        $moduleManager = ModuleManager::where('user_id', $user_id)->with('user', 'modules', 'entity', 'plant')->get();
        $users = User::with('roles', 'entity', 'plant')->latest()->get();
        $modules = Module::orderBy('code', 'ASC')->get();
        $roles = Role::orderBy('name')->get();

        $plants = MasterPlant::select(
            'master_plants.id',
            'master_plants.name as name_plant',
            'master_plants.entity_code',
            'master_plants.plant_code',
            'master_entities.name as entity_name'
        )
            ->leftJoin('master_entities', 'master_plants.entity_code', '=', 'master_entities.entity_code')
            ->orderBy('master_entities.name')
            ->get();

        return Inertia::render('module/edit', [
            'module_manager' => $moduleManager,
            'users' => $users,
            'modules' => $modules,
            'roles' => $roles,
            'plants' => $plants,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $user_id)
    {
        $request->validate([
            'module_ids' => 'required|array',
            'role_name' => 'required|exists:roles,name',
            'plant_code' => 'required|exists:master_plants,plant_code',
            'entity_code' => 'required|exists:master_entities,entity_code',
        ]);

        // Delete existing module managers for the user
        ModuleManager::where('user_id', $user_id)->delete();

        // Create new module managers
        foreach ($request->module_ids as $moduleId) {
            ModuleManager::create([
                'module_id' => $moduleId,
                'user_id' => $user_id,
                'role_name' => $request->role_name,
                'entity_code' => $request->entity_code,
                'plant_code' => $request->plant_code,
                'is_active' => $request->is_active,
            ]);
        }

        return redirect()->route('module-managers.index')->with('success', __('Module Manager updated successfully.'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($user_id)
    {
        $moduleManager = ModuleManager::where('user_id', $user_id)->get();
        $moduleManager->each->delete();

        return redirect()->route('module-managers.index')->with('success', __('Module Manager deleted successfully.'));
    }
}
