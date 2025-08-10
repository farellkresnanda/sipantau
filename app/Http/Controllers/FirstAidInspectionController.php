<?php

namespace App\Http\Controllers;

use App\Models\{
    FirstAidInspection,
    FirstAidInspectionCondition,
    FirstAidInspectionItem,
    ApprovalStatus,
    Master\MasterEntity,
    Master\MasterPlant,
    Master\MasterP3k,
    Master\MasterP3kItem,
    User
};
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\{ Auth, DB, Log, Redirect };
use Illuminate\Support\Str;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Carbon\Carbon; // Import Carbon

class FirstAidInspectionController extends Controller
{
    /**
     * Menampilkan daftar inspeksi dengan paginasi dinamis untuk semua data.
     */
    public function index()
    {
        $query = FirstAidInspection::with([
            'entity:id,entity_code,name',
            'plant:id,plant_code,name',
            'location:id,location,inventory_code',
            'approvalStatus:id,code,name',
            'createdBy:id,name',
        ])
        ->select([
            'id', 'uuid', 'entity_code', 'plant_code', 'location_id', 'car_auto_number',
            'inspection_date', 'project_name', 'approval_status_code', 'created_by', 'created_at',
        ])
        ->orderBy('updated_at', 'desc');
        $totalRecords = (clone $query)->count();
        $inspections = $query->paginate($totalRecords > 0 ? $totalRecords : 15);
        return Inertia::render('inspection/first-aid/page', [
            'inspections' => $inspections,
        ]);
    }

    /**
     * Menampilkan form untuk membuat inspeksi baru.
     */
    public function create()
    {
        return Inertia::render('inspection/first-aid/create', $this->getCreateViewData());
    }

    /**
     * Menyimpan inspeksi baru dan merespons seperti AparController.
     */
    public function store(Request $request)
    {
        $validationRules = [
            'entity_code' => 'required|string|exists:master_entities,entity_code',
            'plant_code' => 'required|string|exists:master_plants,plant_code',
            'inspection_date' => 'required|date',
            'project_name' => 'nullable|string|max:255',
            'location_id' => 'required|integer|exists:master_p3ks,id',
            'items' => 'required|array|min:1',
            'items.*.first_aid_check_item_id' => 'required|integer|exists:master_p3k_items,id',
            'items.*.quantity_found' => 'required|integer|min:0',
            'items.*.condition_id' => 'required|integer|exists:first_aid_inspection_conditions,id',
            'items.*.note' => 'nullable|string|max:255',
            'items.*.expired_at' => 'nullable|date',
        ];

        try {
            $validated = $request->validate($validationRules);

            DB::beginTransaction();

            $prefix = MasterPlant::where('plant_code', $validated['plant_code'])->first()->alias_name ?? strtoupper($validated['plant_code']);
            $today = now()->toDateString();
            $runningNumber = FirstAidInspection::where('entity_code', $validated['entity_code'])->whereDate('created_at', $today)->count() + 1;
            $carNumber = sprintf('%s/P3K/%03d/%s', $prefix, $runningNumber, now()->format('d/m/Y'));

            $inspection = FirstAidInspection::create([
                'uuid' => (string) Str::uuid(),
                'entity_code' => $validated['entity_code'],
                'plant_code' => $validated['plant_code'],
                'location_id' => $validated['location_id'],
                'car_auto_number' => $carNumber,
                'inspection_date' => $validated['inspection_date'],
                'project_name' => $validated['project_name'],
                'approval_status_code' => 'SOP',
                'created_by' => Auth::id(),
            ]);

            foreach ($validated['items'] as $itemData) {
                $inspection->items()->create($itemData);
            }

            DB::commit();

            return inertia('inspection/first-aid/create', array_merge(
                $this->getCreateViewData(),
                [
                    'firstAidInspectionUuid' => $inspection->uuid,
                    'firstAidInspectionCode' => $inspection->car_auto_number,
                ]
            ));

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menyimpan inspeksi: ' . $e->getMessage());
        }
    }

    // Helper function untuk menghindari duplikasi kode
    private function getCreateViewData()
    {
        return [
            'locations' => MasterP3k::select('id', 'location', 'inventory_code', 'entity_code', 'plant_code')->get(),
            'entities' => MasterEntity::select('entity_code as code', 'name')->get(),
            'plants' => MasterPlant::select('plant_code as code', 'name')->get(),
            'firstAidItems' => MasterP3kItem::select('id', 'item_name', 'standard_quantity', 'unit')->get(),
            'conditions' => FirstAidInspectionCondition::select('id', 'name')->get(),
        ];
    }

    public function show(string $uuid)
    {
        try {
            $inspection = FirstAidInspection::with([
                'entity:id,entity_code,name',
                'plant:id,plant_code,name',
                'location:id,location,inventory_code',
                'createdBy:id,name',
                'approvedBy:id,name',
                'approvalStatus:id,code,name',
                'items.item:id,item_name,standard_quantity,unit',
                'items.condition:id,name',
            ])->where('uuid', $uuid)->firstOrFail();

            $inspectorNotes = $inspection->items->map(function ($item) {
                return [
                    'item_name' => $item->item->item_name ?? '-',
                    'note' => $item->note,
                    'condition' => $item->condition->name ?? '-',
                    'quantity_found' => $item->quantity_found,
                    'expired_at' => $item->expired_at,
                ];
            });

            return Inertia::render('inspection/first-aid/show', [
                'firstAidInspection' => $inspection,
                'inspectorNotes' => $inspectorNotes,
                'approvedBy' => $inspection->approvedBy?->name,
                'creatorNameProp' => $inspection->createdBy->name ?? 'Tidak Diketahui',
            ]);

        } catch (\Exception $e) {
            Log::error('Error in show method:', ['error' => $e->getMessage()]);
            return redirect()->route('inspection.first-aid.index')->with('error', 'Inspeksi tidak ditemukan.');
        }
    }

    public function printPdf($uuid)
    {
        $inspection = FirstAidInspection::with([
            'entity:id,entity_code,name',
            'plant:id,plant_code,name',
            'location:id,location,inventory_code',
            'createdBy:id,name',
            'approvedBy:id,name',
            'approvalStatus:id,code,name',
            'items.item:id,item_name,standard_quantity,unit',
            'items.condition:id,name',
        ])->where('uuid', $uuid)->firstOrFail();

        Carbon::setLocale('id');
        $inspectorNotes = $inspection->items->map(function ($item) {
        return [
            'item_name' => $item->item->item_name ?? '-',
            'note' => $item->note,
            'condition' => $item->condition->name ?? '-',
            'quantity_found' => $item->quantity_found,
            'expired_at' => $item->expired_at,
        ];
    });
    return Pdf::loadView('pdf.first-aid', [
        'inspection' => $inspection,
        'inspectorNotes' => $inspectorNotes, // Variabel ini sekarang dikirim
        'validatorNote' => $inspection->note_validator, // Kirim juga catatan validator
    ])->stream("inspection-p3k-$uuid.pdf");
        return Pdf::loadView('pdf.first-aid', [
            'inspection' => $inspection,
        ])->stream("inspection-p3k-$uuid.pdf");
    }

    public function edit(string $uuid)
    {
        $inspection = FirstAidInspection::with([
            'entity', 'plant', 'location',
            'items.item', 'items.condition'
        ])->where('uuid', $uuid)->firstOrFail();

        return Inertia::render('inspection/first-aid/edit', [
            'inspection' => $inspection,
            'entities' => MasterEntity::select('entity_code as code', 'name')->get(),
            'plants' => MasterPlant::select('plant_code as code', 'name')->get(),
            'locations' => MasterP3k::select('id', 'location', 'inventory_code', 'entity_code', 'plant_code')->get(),
            'firstAidItems' => MasterP3kItem::select('id', 'item_name', 'standard_quantity', 'unit')->get(),
            'conditions' => FirstAidInspectionCondition::select('id', 'name')->get(),
        ]);
    }

    // =======================================================================
    // REVISI UTAMA DI SINI
    // =======================================================================
    public function update(Request $request, string $uuid)
    {
        // REVISI: Dihapus 'approval_status_code' dari validasi karena akan di-set manual.
        $validationRules = [
            'entity_code' => 'required|string|exists:master_entities,entity_code',
            'plant_code' => 'required|string|exists:master_plants,plant_code',
            'inspection_date' => 'required|date',
            'project_name' => 'nullable|string|max:255',
            'location_id' => 'required|integer|exists:master_p3ks,id',
            'items' => 'required|array|min:1',
            'items.*.first_aid_check_item_id' => 'required|integer|exists:master_p3k_items,id',
            'items.*.quantity_found' => 'required|integer|min:0',
            'items.*.condition_id' => 'required|integer|exists:first_aid_inspection_conditions,id',
            'items.*.note' => 'nullable|string|max:255',
            'items.*.expired_at' => 'nullable|date',
        ];

        try {
            $validated = $request->validate($validationRules);
            $inspection = FirstAidInspection::where('uuid', $uuid)->firstOrFail();
            DB::beginTransaction();

            // REVISI: Update data inspeksi utama tanpa status
            $inspection->update([
                'inspection_date' => $validated['inspection_date'],
                'location_id' => $validated['location_id'],
                'project_name' => $validated['project_name'],
                'entity_code' => $validated['entity_code'],
                'plant_code' => $validated['plant_code'],
            ]);

            // REVISI: Hapus item lama dan buat yang baru
            $inspection->items()->delete();
            foreach ($validated['items'] as $itemData) {
                $inspection->items()->create($itemData);
            }

            // REVISI: Set status kembali ke 'Open' secara manual
            $inspection->approval_status_code = 'SOP';

            // REVISI: Bersihkan data validasi sebelumnya
            $inspection->note_validator = null;
            $inspection->approved_at = null;
            $inspection->approved_by = null;

            // REVISI: Simpan perubahan status
            $inspection->save();

            DB::commit();

            // REVISI: Redirect ke halaman show, bukan index, untuk UX yang lebih baik
            return redirect()->route('inspection.first-aid.show', $inspection->uuid)->with('success', 'Inspeksi berhasil diperbarui.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update error in FirstAidInspectionController:', ['error' => $e->getMessage()]);
            // REVISI: Redirect kembali ke halaman edit jika ada error
            return redirect()->back()->with('error', 'Gagal memperbarui inspeksi: ' . $e->getMessage())->withInput();
        }
    }

    public function destroy(string $uuid)
    {
        try {
            // REVISI: Langsung hapus tanpa withTrashed jika soft delete tidak dipakai
            $inspection = FirstAidInspection::where('uuid', $uuid)->firstOrFail();
            // Gunakan delete() untuk soft delete, atau forceDelete() untuk hapus permanen
            $inspection->delete(); // atau $inspection->forceDelete();

            return back()->with('success', 'Data inspeksi berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Delete error:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Gagal menghapus data: ' . $e->getMessage());
        }
    }

    // =======================================================================
    // REVISI TAMBAHAN DI SINI
    // =======================================================================
    public function verify(Request $request, string $uiid) // <--- 1. UBAH DI SINI
{
    // 2. UBAH DI SINI agar log konsisten
    Log::info('--- MEMULAI PROSES VERIFIKASI UNTUK UIID: ' . $uiid . ' ---');
    Log::info('DATA DARI REQUEST:', $request->all());

    $request->validate([
        'approval_status' => 'required|in:SAP,SRE',
        'note_validator' => 'required_if:approval_status,SRE|nullable|string|max:255',
    ], [
        'note_validator.required_if' => 'Catatan wajib diisi jika inspeksi ditolak.',
    ]);

    try {
        Log::info('Validasi berhasil, mencari data inspeksi...');

        // 3. UBAH DI SINI: Gunakan $uiid untuk mencari di kolom 'uuid'
        $inspection = FirstAidInspection::where('uuid', $uiid)->firstOrFail();

        $updateData = [
            'approval_status_code' => $request->approval_status,
            'note_validator' => $request->note_validator,
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ];

        Log::info('Data awal untuk update disiapkan.', $updateData);

        if ($request->approval_status === 'SAP') {
            Log::info('Masuk ke blok IF karena status adalah SAP.');

            $qrCodeFolder = 'qrcodes/first_aid_inspections';
            $qrFileName = 'inspection-' . $inspection->uuid . '-verified.png';
            $qrCodePath = $qrCodeFolder . '/' . $qrFileName;
            $fullPath = storage_path('app/public/' . $qrCodePath);

            Log::info('Path QR Code telah dibuat: ' . $fullPath);

            if (!file_exists(dirname($fullPath))) {
                mkdir(dirname($fullPath), 0755, true);
                Log::info('Berhasil membuat folder karena belum ada.');
            }

            $qrContent = route('inspection.first-aid.show', $inspection->uuid) . '?verified_by=' . auth()->id();
            Log::info('Konten untuk QR Code disiapkan: ' . $qrContent);

            QrCode::format('png')->size(200)->generate($qrContent, $fullPath);
            Log::info('BERHASIL membuat file gambar QR Code.');

            $updateData['qr_code_path'] = $qrCodePath;
            Log::info('Path QR code berhasil ditambahkan ke array updateData.');
        }

        Log::info('Mencoba menjalankan $inspection->update()...');
        $inspection->update($updateData);
        Log::info('UPDATE BERHASIL. Redirect ke halaman show...');

        // 4. UBAH DI SINI: redirect menggunakan $uiid
        return redirect()->route('inspection.first-aid.show', $uiid)->with('success', 'Inspeksi berhasil diverifikasi.');

    } catch (\Throwable $th) {
        Log::error('!!! TERJADI ERROR DI BLOK TRY !!!', [
            'error_message' => $th->getMessage(),
            'file' => $th->getFile(),
            'line' => $th->getLine(),
            'trace' => $th->getTraceAsString()
        ]);

        return redirect()->back()->with('error', 'Gagal verifikasi. Silakan cek log untuk detail.');
    }
}
}
