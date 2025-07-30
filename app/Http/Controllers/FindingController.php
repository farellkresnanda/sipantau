<?php

namespace App\Http\Controllers;

use App\Helpers\UserStageHelper;
use App\Models\Finding;
use App\Models\FindingApprovalAssignment;
use App\Models\FindingApprovalHistory;
use App\Models\FindingApprovalStage;
use App\Models\Master\MasterNonconformityType;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class FindingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        $rolesCanViewAll = ['SuperAdmin', 'Admin', 'Viewer'];

        $findings = Finding::latest()
            ->with(['nonconformityType', 'findingStatus', 'entity', 'plant', 'createdBy'])
            ->when(! in_array($user->role, $rolesCanViewAll), function ($query) use ($user) {
                $query->where(function ($q) use ($user) {
                    // 1. Created by current user
                    $q->where('created_by', $user->id)
                        // 2. OR exists approval assignment for this user
                        ->orWhereHas('findingApprovalHistories.findingApprovalAssignment', function ($subQuery) use ($user) {
                            $subQuery->where('user_id', $user->id);
                        });
                });
            })
            ->get();

        return Inertia::render('finding/page', compact('findings'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $nonconformityType = MasterNonconformityType::select(
            'master_nonconformity_types.id',
            'master_nonconformity_types.name as name',
            'master_nonconformity_sub_types.id as sub_id',
            'master_nonconformity_sub_types.name as sub_name'
        )
            ->leftJoin('master_nonconformity_sub_types', 'master_nonconformity_types.id', '=', 'master_nonconformity_sub_types.nonconformity_type_id')
            ->orderBy('master_nonconformity_types.name')
            ->get();

        return Inertia::render('finding/create', compact('nonconformityType'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'nonconformity_type_id' => 'required|exists:master_nonconformity_types,id',
            'finding_description' => 'required|string',
            'photo_before' => 'required|image|mimes:jpg,jpeg,png|max:2048',
            'location_details' => 'required|string',
            'root_cause' => 'required|string',
        ]);

        DB::transaction(function () use ($request) {
            $data = $request->except(['photo_before']);

            if ($request->hasFile('photo_before')) {
                $data['photo_before'] = $request->file('photo_before')->store('finding-images', 'public');
            }

            // Generate CAR number (you may want to extract this logic into a service later)
            $carNumber = auth()->user()->plant->alias_name.'/'.sprintf('%03d', Finding::count() + 1).'/'.now()->format('d/m/Y');

            // Create the finding
            $finding = Finding::create(array_merge($data, [
                'uuid' => Str::uuid(),
                'finding_status_code' => 'SOP', // Status Open
                'created_by' => auth()->id(),
                'entity_code' => auth()->user()->entity_code,
                'plant_code' => auth()->user()->plant_code,
                'car_number_auto' => $carNumber,
            ]));

            // Step 1: Ambil semua stage approval berurutan
            $findingApprovalStage = FindingApprovalStage::orderBy('sequence')->get();

            foreach ($findingApprovalStage as $stage) {
                // Step 2: Buat entry history per stage
                $history = FindingApprovalHistory::create([
                    'finding_id' => $finding->id,
                    'stage' => $stage->stage,
                    'finding_approval_stage_id' => $stage->id,
                    'approval_status' => 'PENDING',
                    'verified_by' => null,
                    'verified_at' => null,
                    'note' => null,
                ]);

                // Step 3: Cari semua user dengan role sesuai dan entitas yang sama
                $users = UserStageHelper::getUsersForStage($stage, $finding);

                // Step 4: Assign user ke tahap approval ini
                foreach ($users as $user) {
                    FindingApprovalAssignment::create([
                        'finding_id' => $finding->id,
                        'finding_approval_history_id' => $history->id,
                        'user_id' => $user->id,
                        'is_verified' => false,
                        'verified_at' => null,
                        'note' => null,
                    ]);

                    // (Opsional) Kirim notifikasi ke user
                    // Notification::send($user, new FindingAssignedNotification($finding, $stage->stage));
                }

            }
        });

        return redirect()->route('finding.index')->with('success', 'Temuan created successfully and approval flow initialized.');
    }

    /**
     * Display the specified resource.
     */
    public function show($uuid)
    {
        $finding = Finding::with(['nonconformityType', 'nonconformitySubType', 'findingApprovalHistories', 'findingApprovalHistories.findingApprovalAssignment.user.role', 'findingStatus', 'entity', 'plant', 'createdBy'])->where('uuid', $uuid)->firstOrFail();
        return Inertia::render('finding/show', compact('finding'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $uuid)
    {
        $finding = Finding::where('uuid', $uuid)->with(['nonconformityType', 'nonconformitySubType', 'findingStatus', 'entity', 'plant', 'createdBy'])->firstOrFail();

        return Inertia::render('finding/edit', compact('finding'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $uuid)
    {
        $finding = Finding::where('uuid', $uuid)->firstOrFail();

        $request->validate([
            'status_finding' => 'required|string',
            'approval_status' => 'required|string',
            'car_number_auto' => 'required|string',
            'date' => 'required|date',
            'nonconformity_type_id' => 'required|exists:nonconformity_types,id',
            'finding_description' => 'required|string',
            'photo_before' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'location_details' => 'required|string',
            'root_cause' => 'required|string',
            'car_number_manual' => 'required|string',
            'corrective_plan' => 'required|string',
            'corrective_due_date' => 'required|date',
            'corrective_action' => 'required|string',
            'note' => 'nullable|string',
            'photo_after' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $data = $request->except(['photo_before', 'photo_after']);

        if ($request->hasFile('photo_before')) {
            if ($finding->photo_before) {
                \Storage::disk('public')->delete($finding->photo_before);
            }
            $data['photo_before'] = $request->file('photo_before')->store('finding-images', 'public');
        }

        if ($request->hasFile('photo_after')) {
            if ($finding->photo_after) {
                \Storage::disk('public')->delete($finding->photo_after);
            }
            $data['photo_after'] = $request->file('photo_after')->store('finding-images', 'public');
        }

        $finding->update($data);

        return redirect()->route('finding.index')->with('success', 'Temuan updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $uuid)
    {
        $finding = Finding::where('uuid', $uuid)->firstOrFail();

        if ($finding->photo_before) {
            \Storage::disk('public')->delete($finding->photo_before);
        }
        if ($finding->photo_after) {
            \Storage::disk('public')->delete($finding->photo_after);
        }

        // Delete related approval assignments first
        foreach ($finding->findingApprovalHistories as $history) {
            $history->findingApprovalAssignment()->delete();
        }

        // Then delete the approval histories
        $finding->findingApprovalHistories()->delete();

        // Finally, delete the finding itself
        $finding->delete();

        return redirect()->route('finding.index')->with('success', 'Temuan deleted successfully.');
    }

    /**
     * Verify the finding approval.
     */
    public function verify(Request $request, $uuid)
    {
        // Pastikan user sudah login
        $user = Auth::user();
        $role = $user->getRoleNames()->first(); // contoh: 'Technician', 'Admin', 'Validator'

        // Validasi UUID
        $finding = Finding::where('uuid', $uuid)
            ->with(['findingApprovalHistories.findingApprovalAssignment.user'])
            ->firstOrFail();

        try {
            // Mulai transaksi untuk memastikan atomicity
            DB::transaction(function () use ($request, $finding, $user, $role) {
                $currentHistory = $finding->findingApprovalHistories()
                    ->with(['findingApprovalAssignment' => function ($query) use ($user) {
                        $query->where('user_id', $user->id)->where('is_verified', false);
                    }])
                    ->whereHas('findingApprovalAssignment', function ($query) use ($user) {
                        $query->where('user_id', $user->id)->where('is_verified', false);
                    })->first();

                if (! $currentHistory) {
                    throw new \Exception('Tidak ada verifikasi aktif untuk user ini.');
                }

                // Pastikan ada assignment untuk user ini
                $assignment = $currentHistory->findingApprovalAssignment()
                    ->where('user_id', $user->id)
                    ->firstOrFail();

                // Validasi input berdasarkan stage
                $stage = $currentHistory->stage;

                // Proses berdasarkan stage
                if ($stage === 'Detection') {
                    $request->validate([
                        'approval_status' => 'required|in:APPROVED,REJECTED',
                        'corrective_plan' => 'required|string',
                    ]);

                    $finding->update([
                        'finding_status_code' => match ($request->approval_status) {
                            'APPROVED' => 'SPR',
                            'REJECTED' => 'SRE',
                        },
                        'corrective_plan' => $request->corrective_plan,
                    ]);
                }

                if ($stage === 'Drafting') {
                    $request->validate([
                        'approval_status' => 'required|in:APPROVED,REJECTED',
                        'car_number_manual' => 'required|string',
                    ]);

                    $finding->update([
                        'car_number_manual' => $request->car_number_manual,
                        'finding_status_code' => match ($request->approval_status) {
                            'APPROVED' => 'SPR',
                            'REJECTED' => 'SRE',
                        },
                    ]);
                }

                if ($stage === 'Planning') {
                    $request->validate([
                        'approval_status' => 'required|in:ON_PROGRESS,REJECTED',
                        'corrective_due_date' => 'required|date',
                    ]);

                    $finding->update([
                        'corrective_due_date' => $request->corrective_due_date,
                        'need_permit' => $request->need_permit,
                        'finding_status_code' => match ($request->approval_status) {
                            'ON_PROGRESS' => 'SPR',
                            'REJECTED' => 'SRE',
                        },
                    ]);
                }

                if ($stage === 'On Progress') {
                    $request->validate([
                        'approval_status' => 'required|in:FINISHED',
                        'corrective_action' => 'required|string',
                    ]);

                    $finding->update([
                        'corrective_action' => $request->corrective_action,
                        'finding_status_code' => match ($request->approval_status) {
                            'FINISHED' => 'SPR',
                        },
                    ]);
                }

                if ($stage === 'Finalizing') {
                    $request->validate([
                        'approval_status' => 'required|in:EFFECTIVE,INEFFECTIVE,POSTPONED',
                        'note' => 'nullable|string',
                        'photo_after' => 'nullable|image|max:2048',
                    ]);

                    if ($request->hasFile('photo_after')) {
                        $photoPath = $request->file('photo_after')->store('finding_photos', 'public');
                        $finding->update(['photo_after' => $photoPath]);
                    }
                }

                if ($stage === 'Verification') {
                    $request->validate([
                        'approval_status' => 'required|in:CLOSE',
                    ]);

                    $finding->update([
                        'finding_status_code' => 'SCF',
                    ]);
                }

                // Tandai assignment sebagai sudah diverifikasi
                $assignment->update([
                    'is_verified' => true,
                    'verified_at' => now(),
                    'note' => $request->note ?? null,
                ]);

                // Jika semua assignment pada tahap ini sudah diverifikasi
                $allVerified = $currentHistory->findingApprovalAssignment()
                    ->where('is_verified', false)
                    ->doesntExist();

                // Update status history jika semua assignment sudah diverifikasi
                if ($allVerified) {
                    $currentHistory->update([
                        'approval_status' => $request->approval_status,
                        'verified_by' => $user->id,
                        'verified_at' => now(),
                        'note' => $request->note ?? null,
                    ]);

                    // Generate QR Code untuk finding ini
                    $qrCodeFolder = 'qrcodes/findings';
                    $qrFileName = 'finding-' . $finding->id . '-approval-' . $currentHistory->id . '.png';
                    $qrCodePath = $qrCodeFolder . '/' . $qrFileName;
                    $fullPath = storage_path('app/public/' . $qrCodePath);

                    // Buat folder jika belum ada
                    if (!file_exists(dirname($fullPath))) {
                        mkdir(dirname($fullPath), 0755, true);
                    }

                    // Data yang akan dimasukkan ke QR Code
                    $qrContent = route('finding.show', $finding->uuid) . '?verified_by=' . $user->id . '&stage=' . $currentHistory->stage;

                    // Generate QR
                    QrCode::format('png')->size(200)->generate($qrContent, $fullPath);

                    // Simpan path QR code di DB
                    $currentHistory->update([
                        'qr_code_path' => $qrCodePath,
                    ]);

                    // Update status finding berdasarkan approval status
                    if ($request->approval_status === 'REJECTED') {
                        $finding->update(['finding_status_code' => 'SRE']); // Rejected
                    }

                    // Cek apakah ini adalah tahap terakhir
                    $isLastStage = ! FindingApprovalHistory::where('finding_id', $finding->id)
                        ->where('approval_status', 'PENDING')
                        ->exists();

                    // Jika sudah di tahap terakhir dan disetujui
                    if ($request->approval_status === 'CLOSE' && $isLastStage) {
                        $finding->update(['finding_status_code' => 'SCF']); // Approved
                    }
                }
            });

            return redirect()->route('finding.show', $uuid)
                ->with('success', 'Verifikasi berhasil diproses.');

        } catch (\Exception $e) {
            return redirect()->route('finding.show', $uuid)
                ->with('error', 'Gagal verifikasi: '.$e->getMessage());
        }
    }

    /**
     * Print the finding details.
     */
    public function print($uuid)
    {
        $finding = Finding::with([
            'nonconformityType.nonconformitySubType',
            'findingApprovalHistories.findingApprovalAssignment.user',
            'createdBy',
            'findingStatus',
        ])->where('uuid', $uuid)->firstOrFail();

        $finder = $finding->createdBy?->name;
        $receiver = $finding->findingApprovalHistories->first()->findingApprovalAssignment->first()->user->name ?? null;
        $receiverQr = $finding->findingApprovalHistories->first()?->qr_code_path;
        $personInCharge = $finding->findingApprovalHistories->where('stage', 'Detection')->first()->findingApprovalAssignment->first()->user->name ?? null;
        $verifier = $finding->findingApprovalHistories->where('stage', 'Verification')->first()->findingApprovalAssignment->first()->user->name ?? null;
        $verifiedAt = $finding->findingApprovalHistories->where('stage', 'Verification')->first()?->findingApprovalAssignment->first()->verified_at;
        $verifierNote = $finding->findingApprovalHistories->where('stage', 'Verification')->first()?->findingApprovalAssignment->first()->note;
        $verifierQR = $finding->findingApprovalHistories->where('stage', 'Verification')->first()?->qr_code_path;
        $secretary = $finding->findingApprovalHistories->where('stage', 'Finalizing')->first()->findingApprovalAssignment->first()->user->name ?? null;
        $pdf = PDF::loadView('pdf.finding', compact('finding', 'finder', 'receiver', 'receiverQr', 'personInCharge', 'verifier', 'verifiedAt', 'secretary', 'verifierNote', 'verifierQR'));
        return $pdf->stream('CorrectiveActionReport.pdf');
    }
}
