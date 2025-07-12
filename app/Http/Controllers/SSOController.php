<?php

namespace App\Http\Controllers;

use App\Models\User;
use Firebase\JWT\BeforeValidException;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\SignatureInvalidException;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;

class SSOController extends Controller
{
    public function loginSSO(Request $request)
    {
        // Get public key from local storage
        $publicKey = Storage::disk('local')->get(env('SSO_KIFEST'));

        try {
            $payloads = JWT::decode($request->token, new Key($publicKey, 'RS256'));
        } catch (BeforeValidException|ExpiredException|SignatureInvalidException $e) {
            return response()->json(['error' => $e->getMessage()], 401);
        }

        // Clear session and logout user
        Auth::logout();
        Session::flush();

        $employeeNpp = $payloads->employee_npp;
        $user = null;

        // Try to fetch data from API
        $client = new Client(['base_uri' => env('API_URL')]);
        $headers = [
            'X-API-KEY' => env('API_KEY') ?? '',
            'Accept' => 'application/json',
        ];

        //        try {
        //
        //        } catch (\Exception $e) {
        //            // Log API errors for debugging
        //            Log::error('API connection failed: '.$e->getMessage());
        //        }

        $response = $client->request('GET', 'employee?npp='.$employeeNpp, [
            'headers' => $headers,
            'timeout' => 5, // Set timeout to avoid long delays
        ]);

        $data = json_decode($response->getBody(), true);

        if (! empty($data['data']) && ! empty($data['data']['employee'])) {
            // If API response is valid, create or update the user in the database
            $user = $this->createOrUpdateUser($data['data']);
        }

        // Fallback to local database if user is not fetched from API
        if (! $user) {
            $user = User::where('npp', $employeeNpp)->first();
        }

        // Check if user exists
        if ($user) {
            Auth::login($user);
            activity()->log('Melakukan Login Aplikasi dengan data lokal');

            return redirect('/');
        }

        // User not found
        return redirect('/login')->withErrors(['error' => 'User tidak ditemukan.']);
    }

    public function createOrUpdateUser($employeeData)
    {
        // Check if user already exists
        $user = User::where('npp', $employeeData['employee']['kode_npp'])->first();

        $userData = [
            'name' => $employeeData['employee']['nama_pegawai'],
            'email' => $employeeData['employee']['email'],
            'npp' => $employeeData['employee']['kode_npp'],
            'npp_sap' => $employeeData['employee']['kode_id'],
            'position_code' => $employeeData['position']['kode_jabatan'],
            'position_name' => $employeeData['position']['nama_jabatan'],
            'position_level' => $employeeData['position']['level_jabatan'],
            'position_level_name' => $employeeData['position']['nama_level_jabatan'],
            'entity_group_code' => $employeeData['position']['kode_group_entitas'],
            'entity_code' => $employeeData['position']['kode_entitas'],
            'entity_name' => $employeeData['position']['nama_entitas'],
            'entity_alias_name' => $employeeData['position']['nama_alias_entitas'],
            'directorate_code' => $employeeData['position']['kode_direktorat'],
            'directorate_name' => $employeeData['position']['nama_direktorat'],
            'division_code' => $employeeData['position']['kode_divisi'],
            'division_name' => $employeeData['position']['nama_divisi'],
            'unit_code' => $employeeData['position']['kode_unit'],
            'unit_name' => $employeeData['position']['nama_unit'],
            'sub_unit_code' => $employeeData['position']['kodesub_unit'],
            'sub_unit_name' => $employeeData['position']['nama_sub_unit'],
            'department_code' => $employeeData['position']['kode_bagian'],
            'department_name' => $employeeData['position']['nama_bagian'],
            'branch_manager_code' => $employeeData['outlet']['kode_bm'],
            'branch_manager_name' => $employeeData['outlet']['nama_bm'],
            'password' => bcrypt($employeeData['employee']['kode_npp']), // Use NPP as password
        ];

        if (! $user) {
            $user = User::create($userData);
            $user->assignRole('Officer');
        } else {
            unset($userData['password']);
            $user->update($userData);
        }

        return $user;
    }
}
