<?php

namespace App\Http\Controllers;

use App\Models\GensetInspection;
use App\Models\GensetInspectionItem;
use App\Models\Master\MasterGenset;
use App\Models\Master\MasterGensetWorkStandard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Carbon\Carbon;

class GensetInspectionController extends Controller
{
    private function authorizeRole(array $roles)
    {
        if (Auth::user() && !Auth::user()->hasAnyRole($roles)) {
            abort(403, 'Anda tidak memiliki izin untuk melakukan aksi ini.');
        }
    }

    /** List inspeksi genset (paginated) */
    public function index()
    {
        $query = GensetInspection::with([
                'genset:id,serial_number,merk',
                'entity:id,entity_code,name',
                'plant:id,plant_code,name',
                'createdBy:id,name',
                'items.workStandard:id,work_item,period',
            ])
            ->select([
                'id','uuid','genset_id','entity_code','plant_code',
                'car_auto_number','inspection_date','approval_status_code',
                'created_by','created_at','updated_at',
            ])
            ->orderBy('updated_at', 'desc');

        $totalRecords = (clone $query)->count();

        $inspections = $query
            ->paginate($totalRecords > 0 ? $totalRecords : 15)
            ->through(function ($inspection) {
                $periods = collect($inspection->items)
                    ->map(fn ($it) => optional($it->workStandard)->period)
                    ->filter()
                    ->unique()
                    ->values()
                    ->all();

                return [
                    'id'                   => $inspection->id,
                    'uuid'                 => $inspection->uuid,
                    'car_auto_number'      => $inspection->car_auto_number,
                    'inspection_date'      => $inspection->inspection_date,
                    'approval_status_code' => $inspection->approval_status_code,
                    'genset'               => $inspection->genset,
                    'entity'               => $inspection->entity,
                    'plant'                => $inspection->plant,
                    'createdBy'            => $inspection->createdBy,
                    'periods'              => $periods,
                    'created_at'           => $inspection->created_at,
                ];
            });

        return Inertia::render('inspection/genset/page', [
            'inspections' => $inspections,
        ]);
    }

    /** Detail inspeksi genset */
    public function show(string $uuid)
    {
        $inspection = GensetInspection::where('uuid', $uuid)
            ->with([
                'genset:id,serial_number,merk',
                'entity:id,entity_code,name',
                'plant:id,plant_code,name',
                'items.workStandard:id,work_item,period',
                'createdBy:id,name',
                'approvedBy:id,name',
            ])
            ->firstOrFail();

        return Inertia::render('inspection/genset/show', [
            'gensetInspection' => $inspection,
        ]);
    }

    /** Form create */
    public function create()
    {
        $this->authorizeRole(['SuperAdmin', 'Technician', 'Teknisi Genset']);

        return Inertia::render('inspection/genset/create', [
            'masterGensets' => MasterGenset::select('id','serial_number','merk','entity_code','plant_code')->get(),
            'workStandards' => MasterGensetWorkStandard::select('id','work_item','period')->get(),
        ]);
    }

    /**
     * Simpan inspeksi.
     * - Generate nomor dokumen
     * - Simpan item
     * - Buat QR "Dibuat oleh" (PNG) => public/qrcodes/genset/maker-{uuid}.png
     * - Kirim flash uuid & code agar FE bisa redirect ke temuan
     */
    public function store(Request $request)
    {
        $this->authorizeRole(['SuperAdmin', 'Technician', 'Teknisi Genset']);

        $validated = $request->validate([
            'genset_id' => 'required|exists:master_gensets,id',
            'inspection_date' => 'required|date',
            'details' => 'required|array|min:1',
            'details.*.work_standard_id' => 'required|exists:master_genset_work_standards,id',
            'details.*.notes' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();
        try {
            $genset = MasterGenset::select('id','entity_code','plant_code')->findOrFail($validated['genset_id']);

            $today = Carbon::now();
            $datePart = $today->format('d/m/Y');
            $countThisYear = GensetInspection::whereYear('created_at', $today->year)->lockForUpdate()->count();
            $sequence = str_pad($countThisYear + 1, 4, '0', STR_PAD_LEFT);
            $inspectionCode = "KFHO/GENSET/{$sequence}/{$datePart}";

            // Header
            $inspection = new GensetInspection();
            $inspection->uuid = (string) Str::uuid();
            $inspection->genset_id = $genset->id;
            $inspection->entity_code = $genset->entity_code;
            $inspection->plant_code  = $genset->plant_code;
            $inspection->inspection_date = $validated['inspection_date'];
            $inspection->car_auto_number = $inspectionCode;
            $inspection->approval_status_code = 'SOP';
            $inspection->created_by = Auth::id();
            $inspection->save();

            // Items
            foreach ($validated['details'] as $item) {
                $gi = new GensetInspectionItem();
                $gi->inspection_id    = $inspection->id;
                $gi->work_standard_id = $item['work_standard_id'];
                $gi->notes            = $item['notes'] ?? null;
                $gi->save();
            }

            // ==== QR MAKER (dibuat oleh) -> PNG ====
            try {
                $dir = 'qrcodes/genset';
                if (!Storage::disk('public')->exists($dir)) {
                    Storage::disk('public')->makeDirectory($dir);
                }
                $makerName = "maker-{$inspection->uuid}.png";
                $makerPath = $dir . '/' . $makerName;

                $makerUrl = route('inspection.genset.show', $inspection->uuid);
                $png = QrCode::format('png')->size(300)->margin(1)->generate($makerUrl);

                Storage::disk('public')->put($makerPath, $png);

                // simpan path QR maker agar bisa direferensikan kalau perlu
                $inspection->qr_code_path = $makerPath;
                $inspection->save();
            } catch (\Throwable $qe) {
                Log::warning('QR maker genset gagal dibuat: ' . $qe->getMessage());
            }

            DB::commit();

            return redirect()
                ->route('inspection.genset.index')
                ->with('success', 'Inspeksi Genset berhasil dibuat.')
                ->with('gensetInspectionUuid', $inspection->uuid)
                ->with('gensetInspectionCode', $inspectionCode);

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Gagal menyimpan inspeksi genset: ' . $e->getMessage(), [
                'trace'   => $e->getTraceAsString(),
                'payload' => $validated,
            ]);

            return back()
                ->withErrors(['message' => 'Gagal menyimpan inspeksi genset: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /** Form edit (param {genset} = UUID) */
    public function edit(string $genset)
    {
        $inspection = GensetInspection::where('uuid', $genset)
            ->with(['items.workStandard:id,work_item,period'])
            ->firstOrFail();

        return Inertia::render('inspection/genset/edit', [
            'inspection'    => $inspection,
            'masterGensets' => MasterGenset::select('id','serial_number','merk','entity_code','plant_code')->get(),
            'workStandards' => MasterGensetWorkStandard::select('id','work_item','period')->get(),
        ]);
    }

    /** Update inspeksi — reset status ke SOP & hapus jejak verifikasi */
    public function update(Request $request, string $uuid)
    {
        $this->authorizeRole(['SuperAdmin', 'Technician', 'Teknisi Genset']);

        $inspection = GensetInspection::where('uuid', $uuid)->firstOrFail();

        $validated = $request->validate([
            'genset_id' => 'required|exists:master_gensets,id',
            'inspection_date' => 'required|date',
            'details' => 'required|array|min:1',
            'details.*.work_standard_id' => 'required|exists:master_genset_work_standards,id',
            'details.*.notes' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();
        try {
            $genset = MasterGenset::select('id','entity_code','plant_code')->findOrFail($validated['genset_id']);

            $inspection->genset_id = $genset->id;
            $inspection->entity_code = $genset->entity_code;
            $inspection->plant_code  = $genset->plant_code;
            $inspection->inspection_date = $validated['inspection_date'];

            $inspection->approval_status_code = 'SOP';
            $inspection->approved_by = null;
            $inspection->approved_at = null;
            $inspection->note_validator = null;
            $inspection->save();

            $inspection->items()->delete();
            foreach ($validated['details'] as $item) {
                $gi = new GensetInspectionItem();
                $gi->inspection_id    = $inspection->id;
                $gi->work_standard_id = $item['work_standard_id'];
                $gi->notes            = $item['notes'] ?? null;
                $gi->save();
            }

            DB::commit();
            return redirect()->route('inspection.genset.index')->with('success', 'Inspeksi berhasil diperbarui.');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Gagal update inspeksi genset: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return back()->withErrors(['message' => 'Gagal update inspeksi genset: ' . $e->getMessage()])->withInput();
        }
    }

    /** Hapus inspeksi */
    public function destroy(string $uuid)
    {
        try {
            $inspection = GensetInspection::where('uuid', $uuid)->firstOrFail();
            $inspection->delete();
            return redirect()->route('inspection.genset.index')->with('success', 'Inspeksi berhasil dihapus.');
        } catch (\Throwable $e) {
            Log::error('Gagal hapus inspeksi genset: ' . $e->getMessage());
            return back()->with('error', 'Gagal menghapus inspeksi genset.');
        }
    }

    /**
     * Verifikasi (Approve / Reject).
     * - Simpan jejak verifikasi
     * - Buat QR "Diketahui oleh" (PNG) => public/qrcodes/genset/validator-{uuid}.png
     */
    public function verify(Request $request, string $uuid)
    {
        $this->authorizeRole(['SuperAdmin', 'Validator']);

        $validated = $request->validate([
            'approval_status_code' => 'required|in:SAP,SRE',
            'note_validator' => 'required_if:approval_status_code,SRE|nullable|string|max:1000',
        ]);

        $inspection = GensetInspection::where('uuid', $uuid)->firstOrFail();
        $inspection->approval_status_code = $validated['approval_status_code'];
        $inspection->note_validator = $validated['note_validator'] ?? null;
        $inspection->approved_at = now();
        $inspection->approved_by = Auth::id();
        $inspection->save();

        // ==== QR VALIDATOR (diketahui oleh) -> PNG ====
        try {
            $dir = 'qrcodes/genset';
            if (!Storage::disk('public')->exists($dir)) {
                Storage::disk('public')->makeDirectory($dir);
            }
            $validatorName = "validator-{$inspection->uuid}.png";
            $validatorPath = $dir . '/' . $validatorName;

            // bisa beda URL (mis: tambahkan tag #approved)
            $validatorUrl = route('inspection.genset.show', $inspection->uuid) . '#approved';
            $png = QrCode::format('png')->size(300)->margin(1)->generate($validatorUrl);

            Storage::disk('public')->put($validatorPath, $png);
        } catch (\Throwable $qe) {
            Log::warning('QR validator genset gagal dibuat: ' . $qe->getMessage());
        }

        return redirect()->back()->with('success', 'Inspeksi berhasil diverifikasi.');
    }

    /**
     * Cetak riwayat pemeliharaan genset (UUID).
     * - Kirim data URI untuk QR maker & validator ke Blade
     * - Jika file belum ada, generate on-the-fly agar tetap tampil
     */
    public function print(string $uuid)
    {
        $clickedInspection = GensetInspection::where('uuid', $uuid)
            ->with('genset')
            ->firstOrFail();

        $genset = $clickedInspection->genset;

        $inspectionHistory = GensetInspection::where('genset_id', $genset->id)
            ->with(['items.workStandard', 'createdBy', 'approvedBy'])
            ->orderBy('inspection_date', 'asc')
            ->get();

        // Lokasi file QR yang kita pakai
        $makerRelPath     = "qrcodes/genset/maker-{$clickedInspection->uuid}.png";
        $validatorRelPath = "qrcodes/genset/validator-{$clickedInspection->uuid}.png";

        // Data URI maker
        $makerQrDataUri = null;
        if (Storage::disk('public')->exists($makerRelPath)) {
            $makerQrDataUri = 'data:image/png;base64,' . base64_encode(Storage::disk('public')->get($makerRelPath));
        } else {
            // fallback: generate on-the-fly
            try {
                $makerUrl = route('inspection.genset.show', $clickedInspection->uuid);
                $png = QrCode::format('png')->size(300)->margin(1)->generate($makerUrl);
                $makerQrDataUri = 'data:image/png;base64,' . base64_encode($png);
            } catch (\Throwable $e) {
                Log::warning('Gagal generate QR maker on-the-fly: ' . $e->getMessage());
            }
        }

        // Data URI validator (kalau sudah diverifikasi). Jika belum, biarkan null.
        $validatorQrDataUri = null;
        if (Storage::disk('public')->exists($validatorRelPath)) {
            $validatorQrDataUri = 'data:image/png;base64,' . base64_encode(Storage::disk('public')->get($validatorRelPath));
        } elseif (!empty($clickedInspection->approved_at)) {
            // fallback on-the-fly saat sudah ada approved_at
            try {
                $validatorUrl = route('inspection.genset.show', $clickedInspection->uuid) . '#approved';
                $png = QrCode::format('png')->size(300)->margin(1)->generate($validatorUrl);
                $validatorQrDataUri = 'data:image/png;base64,' . base64_encode($png);
            } catch (\Throwable $e) {
                Log::warning('Gagal generate QR validator on-the-fly: ' . $e->getMessage());
            }
        }

        $pdf = Pdf::loadView('pdf.genset', [
            'masterGenset'        => $genset,
            'inspectionHistory'   => $inspectionHistory,
            'clickedInspection'   => $clickedInspection,
            'makerQrDataUri'      => $makerQrDataUri,
            'validatorQrDataUri'  => $validatorQrDataUri,
        ]);

        return $pdf->stream('Kartu-Pemeliharaan-Genset-' . ($genset->serial_number ?? 'unknown') . '.pdf');
    }
}
