<?php

namespace App\Http\Controllers;

use App\Models\K3Program;
use App\Models\K3ProgramItem;
use App\Models\Master\MasterEntity;
use App\Models\Master\MasterPlant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Illuminate\Support\Str;

class K3ProgramController extends Controller
{
    /** ======================== List ======================== */
    public function index()
    {
        $query = K3Program::with([
            'creator:id,name',
            'validator:id,name',
            'entity:entity_code,name',
            'plant:plant_code,name',
        ])
        ->select([
            'id','uuid','year','target_description',
            'entity_code','plant_code',
            'approval_status_code','created_by','approved_by',
            'approved_at','created_at','updated_at',
        ])
        ->orderByDesc('updated_at');

        $total    = (clone $query)->count();
        $programs = $query->paginate($total > 0 ? $total : 15);

        $user = auth()->user();
        $programs->getCollection()->transform(function ($p) use ($user) {
            $canEdit   = $user?->hasAnyRole(['Admin','SuperAdmin']) && $p->approval_status_code === 'SOP';
            $canVerify = $user?->hasAnyRole(['Validator','SuperAdmin']) && $p->approval_status_code === 'SOP';
            $p->abilities = ['can_edit' => $canEdit, 'can_verify' => $canVerify];
            return $p;
        });

        return Inertia::render('analysis/k3-program/page', [
            'programs'  => $programs,
            'canCreate' => $user?->hasAnyRole(['Admin','SuperAdmin']) ?? false,
        ]);
    }

    /** ======================== Create ======================== */
    public function create()
    {
        return Inertia::render('analysis/k3-program/create', $this->getCreateViewData());
    }

    /** ======================== Store ======================== */
    public function store(Request $request)
    {
        // RULES: wizard
        $wizardRules = [
            'year'               => 'required|integer|min:2020|max:2100',
            'entity_code'        => 'required|string|exists:master_entities,entity_code',
            'plant_code'         => 'required|string|exists:master_plants,plant_code',
            'target_description' => 'nullable|string',

            'sections'                        => 'required|array|min:1',
            'sections.*.title'                => 'required|string',
            'sections.*.target_pct'           => 'required|integer|min:0|max:100',
            'sections.*.items'                => 'array',

            'sections.*.items.*.title'        => 'required|string',
            'sections.*.items.*.pic'          => 'nullable|string',
            'sections.*.items.*.unit_type'    => 'required|in:monthly,once,custom',
            'sections.*.items.*.target_units' => 'nullable|integer|min:1',
            'sections.*.items.*.monthly_denominator_mode' => 'required|in:12,elapsed',

            'sections.*.items.*.plan_m'       => 'nullable|array|size:12',
            'sections.*.items.*.plan_m.*'     => 'boolean',
            'sections.*.items.*.actual_m'     => 'nullable|array|size:12',
            'sections.*.items.*.actual_m.*'   => 'boolean',

            'sections.*.items.*.plan_q'       => 'nullable|array|size:4',
            'sections.*.items.*.plan_q.*'     => 'boolean',
            'sections.*.items.*.actual_q'     => 'nullable|array|size:4',
            'sections.*.items.*.actual_q.*'   => 'boolean',

            'sections.*.items.*.docs'                   => 'array',
            'sections.*.items.*.docs.*.month'           => 'required|integer|min:1|max:12',
            'sections.*.items.*.docs.*.plan_note'       => 'nullable|string',
            'sections.*.items.*.docs.*.actual_note'     => 'nullable|string',
            'sections.*.items.*.docs.*.evidence'        => 'nullable|string',
        ];

        // RULES: legacy header
        $legacyRules = [
            'year'               => 'required|integer|min:2020|max:2100',
            'target_description' => 'required|string',
            'entity_code'        => 'required|string|exists:master_entities,entity_code',
            'plant_code'         => 'required|string|exists:master_plants,plant_code',
        ];

        // === MODE WIZARD (pakai sections + items) ===
        if ($request->has('sections')) {
            $payload = $request->validate($wizardRules);

            try {
                DB::beginTransaction();

                $program = K3Program::create([
                    'uuid'                 => (string) Str::uuid(),
                    'year'                 => $payload['year'],
                    'target_description'   => $payload['target_description'] ?? null,
                    'entity_code'          => $payload['entity_code'],
                    'plant_code'           => $payload['plant_code'],
                    'approval_status_code' => 'SOP',
                    'created_by'           => Auth::id(),
                ]);

                $useSectionTable = Schema::hasTable('k3_program_sections')
                    && Schema::hasColumn('k3_program_sections', 'program_id')
                    && Schema::hasTable('k3_program_items')
                    && Schema::hasColumn('k3_program_items', 'section_id');

                foreach ($payload['sections'] as $si => $section) {
                    $sectionId = null;

                    if ($useSectionTable) {
                        $secAttrs = [
                            'program_id' => $program->id,
                            'title'      => $section['title'],
                            'target_pct' => (int) $section['target_pct'],
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                        if (Schema::hasColumn('k3_program_sections', 'order_no')) {
                            $secAttrs['order_no'] = $si + 1;
                        }
                        $sectionId = DB::table('k3_program_sections')->insertGetId($secAttrs);
                    }

                    foreach ($section['items'] ?? [] as $ii => $it) {
                        $planFlags   = $this->resolveMonthlyFlags($it, 'plan_m', 'plan_q');
                        $actualFlags = $this->resolveMonthlyFlags($it, 'actual_m', 'actual_q');

                        $attrs = [
                            'title'                    => $it['title'],
                            'pic'                      => $it['pic'] ?? null,
                            'unit_type'                => $it['unit_type'],
                            'target_units'             => $it['target_units'] ?? null,
                            'monthly_denominator_mode' => $it['monthly_denominator_mode'],
                            'created_at'               => now(),
                            'updated_at'               => now(),
                        ];

                        if ($useSectionTable) {
                            $attrs['section_id'] = $sectionId;
                        } else {
                            if (Schema::hasColumn('k3_program_items', 'section_title')) {
                                $attrs['section_title'] = $section['title'];
                            }
                            if (Schema::hasColumn('k3_program_items', 'section_target_pct')) {
                                $attrs['section_target_pct'] = (int) $section['target_pct'];
                            }
                            if (Schema::hasColumn('k3_program_items', 'program_id')) {
                                $attrs['program_id'] = $program->id;
                            } else {
                                if (Schema::hasColumn('k3_program_items', 'year'))        $attrs['year']        = $program->year;
                                if (Schema::hasColumn('k3_program_items', 'entity_code')) $attrs['entity_code'] = $program->entity_code;
                                if (Schema::hasColumn('k3_program_items', 'plant_code'))  $attrs['plant_code']  = $program->plant_code;
                            }
                        }

                        if (Schema::hasColumn('k3_program_items', 'order_no')) {
                            $attrs['order_no'] = $ii + 1;
                        }

                        if (Schema::hasColumn('k3_program_items', 'plan_flags')) {
                            $attrs['plan_flags'] = json_encode($planFlags);
                        }
                        if (Schema::hasColumn('k3_program_items', 'actual_flags')) {
                            $attrs['actual_flags'] = json_encode($actualFlags);
                        }

                        $itemId = DB::table('k3_program_items')->insertGetId($attrs);

                        if (!empty($it['docs']) && Schema::hasTable('k3_program_item_docs')) {
                            $docRows = [];
                            foreach ($it['docs'] as $doc) {
                                $docRows[] = [
                                    'item_id'     => $itemId,
                                    'month'       => (int) $doc['month'],
                                    'plan_note'   => $doc['plan_note']   ?? null,
                                    'actual_note' => $doc['actual_note'] ?? null,
                                    'evidence'    => $doc['evidence']    ?? null,
                                    'created_at'  => now(),
                                    'updated_at'  => now(),
                                ];
                            }
                            DB::table('k3_program_item_docs')->insert($docRows);
                        }
                    }
                }

                DB::commit();

                return redirect("/analysis/k3-program/{$program->uuid}")
                    ->with('success', 'Program K3 berhasil dibuat (wizard).');

            } catch (\Throwable $th) {
                DB::rollBack();
                Log::error('K3Program store(full) error', ['e' => $th->getMessage()]);
                return back()->with('error', 'Gagal menyimpan program: '.$th->getMessage());
            }
        }

        // === MODE LEGACY (header saja) ===
        try {
            $data = $request->validate($legacyRules);

            DB::beginTransaction();

            $program = K3Program::create([
                'uuid'                 => (string) Str::uuid(),
                'year'                 => $data['year'],
                'target_description'   => $data['target_description'],
                'entity_code'          => $data['entity_code'],
                'plant_code'           => $data['plant_code'],
                'approval_status_code' => 'SOP',
                'created_by'           => Auth::id(),
            ]);

            DB::commit();

            return redirect("/analysis/k3-program/{$program->uuid}/edit")
                ->with('success', 'Program K3 (header) berhasil dibuat.');

        } catch (\Illuminate\Validation\ValidationException $ve) {
            DB::rollBack();
            return back()->withErrors($ve->errors())->withInput();
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error('K3Program store error', ['e' => $th->getMessage()]);
            return back()->with('error', 'Gagal menyimpan program: '.$th->getMessage());
        }
    }

    /** ======================== Show ======================== */
    public function show(string $uuid)
    {
        $program = $this->findByUuidOrFail($uuid);

        $program->load([
            'creator:id,name',
            'validator:id,name',
        ]);

        $sections = $this->buildSectionsPayload($program->id);

        $user = auth()->user();
        $canVerify = $user?->hasAnyRole(['Validator','SuperAdmin']) && $program->approval_status_code === 'SOP';
        $canEdit   = $user?->hasAnyRole(['Admin','SuperAdmin'])     && $program->approval_status_code === 'SOP';

        return Inertia::render('analysis/k3-program/show', [
            'program'   => array_merge($program->toArray(), ['sections' => $sections]),
            'canVerify' => $canVerify,
            'canEdit'   => $canEdit,
        ]);
    }

    /** ======================== Edit & Achievements ======================== */
    public function edit(K3Program $program, Request $request)
    {
        $tab = $request->query('tab', 'edit');

        $program->load([
            'entity:name,entity_code',
            'plant:name,plant_code',
            'sections' => fn($q) => $q->orderBy('order_no'),
            'sections.items',
        ]);

        if ($tab === 'achievements') {
            return Inertia::render('analysis/k3-program/achievements', ['program' => $program]);
        }

        return Inertia::render('analysis/k3-program/edit', ['program' => $program]);
    }

    public function achievements(K3Program $program)
    {
        $program->load([
            'entity:name,entity_code',
            'plant:name,plant_code',
            'sections' => fn($q) => $q->orderBy('order_no'),
            'sections.items',
        ]);

        return Inertia::render('analysis/k3-program/achievements', ['program' => $program]);
    }

    /** ======================== Update header ======================== */
    public function update(Request $request, string $uuid)
    {
        $program = $this->findByUuidOrFail($uuid);

        $rulesHeader = [
            'year'               => ['required','integer','min:2020','max:2100'],
            'target_description' => ['required','string'],
            'entity_code'        => ['required','string','exists:master_entities,entity_code'],
            'plant_code'         => ['required','string','exists:master_plants,plant_code'],
        ];

        $payload = $request->validate($rulesHeader);

        $dup = K3Program::where('year', $payload['year'])
            ->where('entity_code', $payload['entity_code'])
            ->where('plant_code', $payload['plant_code'])
            ->where('id', '!=', $program->id)
            ->exists();

        if ($dup) {
            return back()->withErrors([
                'entity_code' => 'Program untuk kombinasi Tahun/Entitas/Plant tersebut sudah ada.',
            ])->withInput();
        }

        try {
            DB::beginTransaction();

            $program->update([
                'year'                 => $payload['year'],
                'target_description'   => $payload['target_description'],
                'entity_code'          => $payload['entity_code'],
                'plant_code'           => $payload['plant_code'],
                'approval_status_code' => 'SOP',
                'note_validator'       => null,
                'approved_at'          => null,
                'approved_by'          => null,
            ]);

            DB::commit();

            return redirect("/analysis/k3-program/{$program->uuid}")
                ->with('success', 'Program K3 berhasil diperbarui.');

        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error('K3Program update error', ['e' => $th->getMessage()]);
            return back()->with('error', 'Gagal memperbarui program: '.$th->getMessage());
        }
    }

    /** ======================== Destroy ======================== */
    public function destroy(string $uuid)
    {
        try {
            $program = $this->findByUuidOrFail($uuid);
            $program->delete();
            return back()->with('success', 'Program K3 berhasil dihapus.');
        } catch (\Throwable $th) {
            Log::error('K3Program destroy error', ['e' => $th->getMessage()]);
            return back()->with('error', 'Gagal menghapus program: '.$th->getMessage());
        }
    }

    /** ======================== Verify ======================== */
    public function verify(Request $request, string $uuid)
    {
        Log::info('[K3Program] Mulai verifikasi', ['uuid' => $uuid, 'payload' => $request->all()]);

        $request->validate([
            'approval_status' => 'required|in:SAP,SRE',
            'note_validator'  => 'required_if:approval_status,SRE|nullable|string|max:255',
        ], [
            'note_validator.required_if' => 'Catatan wajib diisi jika status Ditolak.',
        ]);

        try {
            $program = $this->findByUuidOrFail($uuid);

            $update = [
                'approval_status_code' => $request->approval_status,
                'note_validator'       => $request->note_validator,
                'approved_by'          => Auth::id(),
                'approved_at'          => now(),
            ];

            $program->update($update);

            return redirect("/analysis/k3-program/{$uuid}")
                ->with('success', 'Program K3 berhasil diverifikasi.');

        } catch (\Throwable $th) {
            Log::error('[K3Program] Verify error', ['e' => $th->getMessage()]);
            return back()->with('error', 'Gagal verifikasi. Silakan cek log.');
        }
    }

    /** ======================== PATCH items/{id} ======================== */
    public function updateItemMonthly(Request $request, int $itemId)
    {
        $data = $request->validate([
            'plan_m'     => 'required|array|size:12',
            'plan_m.*'   => 'boolean',
            'actual_m'   => 'required|array|size:12',
            'actual_m.*' => 'boolean',
        ]);

        $user = auth()->user();
        $item = K3ProgramItem::with(['program:id,approval_status_code,uuid,year'])->findOrFail($itemId);

        $canEdit = $user && $user->hasAnyRole(['Admin','SuperAdmin']) && $item->program->approval_status_code === 'SOP';
        if (!$canEdit) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $planFlags   = array_map(fn($v) => (bool)$v, array_values($data['plan_m']));
        $actualFlags = array_map(fn($v) => (bool)$v, array_values($data['actual_m']));

        $attrs = ['updated_at' => now()];
        if (Schema::hasColumn('k3_program_items', 'plan_flags'))   $attrs['plan_flags']   = json_encode($planFlags);
        if (Schema::hasColumn('k3_program_items', 'actual_flags')) $attrs['actual_flags'] = json_encode($actualFlags);

        $item->fill($attrs)->save();

        // Plan sekarang 100% kalau ada PLAN (berapa pun bulan yang dipilih)
        $planPct      = $this->percentPlanRelToPlan($planFlags, $item->unit_type, $item->target_units);
        // Actual: to-date relatif ke bulan yang memang di-PLAN
        $actualPctTD  = $this->actualPercentToDateAgainstPlan($planFlags, $actualFlags);

        return response()->json([
            'ok'                => true,
            'item_id'           => $item->id,
            'plan_pct_eoy'      => round($planPct, 2),        // FE lama membaca key ini
            'actual_pct_todate' => round($actualPctTD, 2),
            'actual_pct_eoy'    => round($actualPctTD, 2),    // compat FE lama
        ]);
    }

    /** ======================== Helpers: hitung % ======================== */

    /**
     * PLAN relatif ke PLAN:
     * - monthly/custom/once → 100% bila ada minimal 1 bulan/indikasi PLAN, selain itu 0%.
     *   (sesuai kebutuhan: kalau timeline dipilih hanya di kuartal tertentu, dianggap 100%)
     */
    private function percentPlanRelToPlan(array $planFlags, string $unitType, ?int $targetUnits): float
    {
        $plan = 0; foreach ($planFlags as $b) $plan += $b ? 1 : 0;

        if ($unitType === 'once')   return $plan > 0 ? 100.0 : 0.0;
        if ($unitType === 'custom') return $plan > 0 ? 100.0 : 0.0; // sederhana: ada PLAN → 100
        // monthly
        return $plan > 0 ? 100.0 : 0.0;
    }

    /**
     * Hitung % dari flags (dipakai untuk kebutuhan lain).
     * $item bisa K3ProgramItem | stdClass | array.
     */
    private function percentFromFlags(array $flags, $item, string $mode = 'eoy'): float
    {
        if ($item instanceof K3ProgramItem) {
            $unitType    = $item->unit_type ?? 'monthly';
            $targetUnits = $item->target_units ?? null;
            $denMode     = $item->monthly_denominator_mode ?? '12';
        } elseif (is_array($item)) {
            $unitType    = $item['unit_type'] ?? 'monthly';
            $targetUnits = $item['target_units'] ?? null;
            $denMode     = $item['monthly_denominator_mode'] ?? '12';
        } else {
            $unitType    = $item->unit_type ?? 'monthly';
            $targetUnits = $item->target_units ?? null;
            $denMode     = $item->monthly_denominator_mode ?? '12';
        }

        $t = 0; foreach ($flags as $b) { $t += $b ? 1 : 0; }

        if ($unitType === 'once') {
            $den = 1; $num = $t > 0 ? 1 : 0;
            return ($num / $den) * 100.0;
        }
        if ($unitType === 'custom') {
            $den = max(1, (int) ($targetUnits ?? 0));
            $num = min($t, $den);
            return ($num / $den) * 100.0;
        }
        if ($mode === 'todate' && $denMode === 'elapsed') {
            $nowM = (int) date('n');
            $den  = $nowM;
            $num  = min($t, $den);
            return $den > 0 ? ($num / $den) * 100.0 : 0.0;
        }
        $den = 12; $num = min($t, $den);
        return ($num / $den) * 100.0;
    }

    /**
     * Actual to-date relatif ke PLAN:
     * pembagi = jumlah bulan yang di-PLAN dari Jan..bulan berjalan.
     */
    private function actualPercentToDateAgainstPlan(array $planFlags, array $actualFlags): float
    {
        $now = (int) date('n'); // 1..12
        $den = 0; $num = 0;
        for ($i = 0; $i < $now; $i++) {
            if (!empty($planFlags[$i])) {
                $den++;
                if (!empty($actualFlags[$i])) $num++;
            }
        }
        if ($den === 0) return 0.0;
        return ($num / $den) * 100.0;
    }

    /** ======================== Helpers umum ======================== */
    private function getCreateViewData(): array
    {
        return [
            'entities' => MasterEntity::select('entity_code as code', 'name')->get(),
            'plants'   => MasterPlant::select('plant_code as code', 'name', 'entity_code')->get(),
        ];
    }

    private function findByUuidOrFail(string $uuid): K3Program
    {
        if (Schema::hasColumn('k3_programs', 'uuid')) {
            return K3Program::where('uuid', $uuid)->firstOrFail();
        }
        if (is_numeric($uuid)) {
            return K3Program::findOrFail((int) $uuid);
        }
        abort(404);
    }

    /** Build payload sections+items untuk FE */
    private function buildSectionsPayload(K3Program|int|string $programInput): array
    {
        // Normalisasi $program
        if ($programInput instanceof K3Program) {
            $program = $programInput;
        } elseif (is_numeric($programInput)) {
            $program = K3Program::findOrFail((int) $programInput);
        } else {
            if (Schema::hasColumn('k3_programs', 'uuid')) {
                $program = K3Program::where('uuid', (string) $programInput)->firstOrFail();
            } else {
                abort(404);
            }
        }

        $hasSections = Schema::hasTable('k3_program_sections')
            && Schema::hasColumn('k3_program_sections', 'program_id')
            && Schema::hasTable('k3_program_items')
            && Schema::hasColumn('k3_program_items', 'section_id');

        // Dengan tabel sections
        if ($hasSections) {
            $secQuery = DB::table('k3_program_sections')->where('program_id', $program->id);
            if (Schema::hasColumn('k3_program_sections', 'order_no')) {
                $secQuery->orderBy('order_no');
            } else {
                $secQuery->orderBy('id');
            }
            $sections = $secQuery->get(['id','title','target_pct','order_no']);

            $result = [];
            foreach ($sections as $sec) {
                $itQ = DB::table('k3_program_items')->where('section_id', $sec->id);
                if (Schema::hasColumn('k3_program_items', 'order_no')) {
                    $itQ->orderBy('order_no');
                } else {
                    $itQ->orderBy('id');
                }

                $items = $itQ->get()->map(function ($row) {
                    $row = (array) $row;

                    [$planFlags, $actualFlags] = $this->decodeFlagsForRow($row);

                    $unit = (string)($row['unit_type'] ?? 'monthly');
                    $tgt  = isset($row['target_units']) ? (int)$row['target_units'] : null;

                    // PLAN: 100% kalau ada plan (berapa pun bulan yang dipilih)
                    $planPct = $this->percentPlanRelToPlan($planFlags, $unit, $tgt);
                    // ACTUAL: to-date relatif ke plan
                    $actualPct = $this->actualPercentToDateAgainstPlan($planFlags, $actualFlags);

                    if (Schema::hasTable('k3_program_item_docs')) {
                        $docs = DB::table('k3_program_item_docs')
                            ->where('item_id', $row['id'])
                            ->orderBy('month')
                            ->get(['month','evidence','plan_note','actual_note']);
                        $row['docs'] = $docs;
                    } else {
                        $row['docs'] = [];
                    }

                    $row['plan_flags']     = $planFlags;
                    $row['actual_flags']   = $actualFlags;
                    $row['plan_percent']   = round($planPct, 2);
                    $row['actual_percent'] = round($actualPct, 2);

                    return $row;
                })->all();

                $result[] = [
                    'id'         => $sec->id,
                    'title'      => $sec->title,
                    'target_pct' => (int) ($sec->target_pct ?? 0),
                    'items'      => $items,
                ];
            }

            if (empty($result)) {
                return [[ 'id' => 1, 'title' => 'Sasaran', 'target_pct' => 100, 'items' => [] ]];
            }

            return $result;
        }

        // Tanpa tabel sections
        if (!Schema::hasTable('k3_program_items')) {
            return [[ 'id' => 1, 'title' => 'Sasaran', 'target_pct' => 100, 'items' => [] ]];
        }

        $itQ = DB::table('k3_program_items');
        if (Schema::hasColumn('k3_program_items', 'program_id')) {
            $itQ->where('program_id', $program->id);
        } else {
            if (Schema::hasColumn('k3_program_items', 'year'))        $itQ->where('year', $program->year);
            if (Schema::hasColumn('k3_program_items', 'entity_code')) $itQ->where('entity_code', $program->entity_code);
            if (Schema::hasColumn('k3_program_items', 'plant_code'))  $itQ->where('plant_code', $program->plant_code);
        }
        if (Schema::hasColumn('k3_program_items', 'order_no')) {
            $itQ->orderBy('order_no');
        } else {
            $itQ->orderBy('id');
        }

        $items = $itQ->get()->map(function ($row) {
            $row = (array) $row;

            [$planFlags, $actualFlags] = $this->decodeFlagsForRow($row);

            $unit = (string)($row['unit_type'] ?? 'monthly');
            $tgt  = isset($row['target_units']) ? (int)$row['target_units'] : null;

            $planPct   = $this->percentPlanRelToPlan($planFlags, $unit, $tgt);
            $actualPct = $this->actualPercentToDateAgainstPlan($planFlags, $actualFlags);

            if (Schema::hasTable('k3_program_item_docs')) {
                $docs = DB::table('k3_program_item_docs')
                    ->where('item_id', $row['id'])
                    ->orderBy('month')
                    ->get(['month','evidence','plan_note','actual_note']);
                $row['docs'] = $docs;
            } else {
                $row['docs'] = [];
            }

            $row['plan_flags']     = $planFlags;
            $row['actual_flags']   = $actualFlags;
            $row['plan_percent']   = round($planPct, 2);
            $row['actual_percent'] = round($actualPct, 2);

            return $row;
        })->all();

        $hasSectionTitle = Schema::hasColumn('k3_program_items', 'section_title');
        $hasSectionPct   = Schema::hasColumn('k3_program_items', 'section_target_pct');

        if (!$hasSectionTitle) {
            return [[ 'id' => 1, 'title' => 'Sasaran', 'target_pct' => 100, 'items' => $items ]];
        }

        $groups = [];
        foreach ($items as $it) {
            $title = $it['section_title'] ?? 'Sasaran';
            if (!isset($groups[$title])) {
                $groups[$title] = [
                    'id'         => count($groups) + 1,
                    'title'      => $title,
                    'target_pct' => $hasSectionPct ? (int)($it['section_target_pct'] ?? 0) : 0,
                    'items'      => [],
                ];
            }
            $groups[$title]['items'][] = $it;
        }
        return array_values($groups);
    }

    /** Decode 12-flag dari kolom *_flags (tanpa *_json). */
    private function decodeFlagsForRow(array $row): array
    {
        $plan = [];
        if (array_key_exists('plan_flags', $row) && $row['plan_flags'] !== null) {
            $plan = is_array($row['plan_flags'])
                ? $row['plan_flags']
                : (array) json_decode((string) $row['plan_flags'], true);
        }

        $actual = [];
        if (array_key_exists('actual_flags', $row) && $row['actual_flags'] !== null) {
            $actual = is_array($row['actual_flags'])
                ? $row['actual_flags']
                : (array) json_decode((string) $row['actual_flags'], true);
        }

        $plan   = $this->ensureBool12($plan);
        $actual = $this->ensureBool12($actual);

        return [$plan, $actual];
    }

    private function ensureBool12($v): array
    {
        $base = is_array($v) ? array_values($v) : [];
        $out  = [];
        for ($i = 0; $i < 12; $i++) {
            $out[] = (bool)($base[$i] ?? false);
        }
        return $out;
    }

    private function resolveMonthlyFlags(array $it, string $mKey, string $qKey): array
    {
        if (!empty($it[$mKey]) && is_array($it[$mKey]) && count($it[$mKey]) === 12) {
            return array_map(fn ($v) => (bool) $v, array_values($it[$mKey]));
        }

        if (!empty($it[$qKey]) && is_array($it[$qKey]) && count($it[$qKey]) === 4) {
            $q = array_map(fn ($v) => (bool) $v, array_values($it[$qKey]));
            return [
                $q[0], $q[0], $q[0],
                $q[1], $q[1], $q[1],
                $q[2], $q[2], $q[2],
                $q[3], $q[3], $q[3],
            ];
        }

        return array_fill(0, 12, false);
    }
}
