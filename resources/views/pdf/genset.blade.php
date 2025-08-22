{{-- resources/views/pdf/genset.blade.php --}}
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>CHECKLIST PEMELIHARAAN GENSET</title>
    <style>
        /* --- Base --- */
        @page { size: A4 landscape; margin: 22px 20px; }
        body { font-family: "Helvetica", "DejaVu Sans", sans-serif; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 3px; vertical-align: middle; }
        .no-border { border: none !important; }
        .text-left { text-align: left; }
        .text-center { text-align: center; }

        /* --- Header box kiri atas --- */
        .meta-table td { border: none; padding: 2px 4px; }
        .meta-box { border: 1px solid #000; padding: 6px 8px; display: inline-block; }

        /* --- Judul --- */
        .title {
            text-align: center;
            margin: 8px 0 10px;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 16px;
            text-decoration: underline;
            line-height: 1.2;
        }

        /* --- Info kecil bawah judul --- */
        .sub-info { display: inline-block; font-size: 10px; margin: 0 0 6px; }
        .sub-info .meta-table td { padding: 1px 4px; }

        /* --- Grid bulan --- */
        .head-month { background: #a9c4ff; font-weight: 700; }
        .head-week  { background: #cbd8ff; font-weight: 700; }

        /* --- Lebar kolom --- */
        .col-no { width: 18px; }
        .col-item { width: 26%; }
        .col-waktu { width: 58px; }

        /* --- Halaman 2 --- */
        .page-break { page-break-before: always; }

        /* Tabel luar 3 kolom: tanggal kiri, QR center, kanan spacer (stabil DomPDF) */
        .sign-outer { width: 100%; border: none; }
        .sign-outer td { border: none; vertical-align: top; padding: 0; }

        .dates-col {
            width: 60mm; text-align: left; line-height: 1.35;
            padding-top: 4mm;
        }
        .dates-col b { font-weight: 700; }

        .center-col { text-align: center; }

        .qr-table { border-collapse: collapse; margin: 0 auto; } /* center stabil DomPDF */
        .qr-cell { border: none; padding: 0 15mm; text-align: center; } /* jarak antar QR */

        .sign-square {
            width: 30mm; height: 30mm; border: 1px solid #000;
            display: block; margin: 0 auto;
        }
        .sign-square img { width: 100%; height: 100%; object-fit: contain; display: block; }

        .sign-label {
            font-weight: 600; margin-top: 4px; width: 30mm; text-align: center;
            display: block; margin-left: auto; margin-right: auto;
        }

        .right-spacer { width: 60mm; }
    </style>
</head>
<body>

    <!-- Kotak metadata kiri atas + logo kanan -->
    <table class="meta-table" style="margin-bottom: 6px; width:100%;">
        <tr>
            <td class="no-border" style="width: 55%;">
                <div class="meta-box">
                    <table class="meta-table">
                        <tr><td>Copy No</td><td>:</td><td>{{ $copyNo ?? '' }}</td></tr>
                        <tr><td>Kode Form</td><td>:</td><td>{{ $formCode ?? 'CMD141-UPC-001/00' }}</td></tr>
                        <tr><td>Tanggal Revisi</td><td>:</td><td>{{ $revisiDate ?? '11 DES 2023' }}</td></tr>
                        <tr><td>Tanggal Berlaku</td><td>:</td><td>{{ $effectiveDate ?? '20 DES 2023' }}</td></tr>
                    </table>
                </div>
            </td>
            <td class="no-border" style="width: 45%; text-align:right;">
                @php $logo = public_path('images/logo-kf.png'); @endphp
                @if (file_exists($logo))
                    <img src="{{ $logo }}" alt="logo" style="height:38px;">
                @endif
            </td>
        </tr>
    </table>

    <div class="title">Checklist Pemeliharaan Genset</div>

@php
    use Carbon\Carbon;

    /* ==============================
       RESOLVER DATA DI BLADE (tanpa ubah controller)
       ============================== */

    // Header inspeksi dari variabel yang mungkin tersedia
    $header = $gensetInspection
        ?? $inspection
        ?? (isset($inspectionHistory)
            ? (is_array($inspectionHistory) ? ($inspectionHistory[0] ?? null)
               : (method_exists($inspectionHistory, 'first') ? $inspectionHistory->first() : null))
            : null);

    // Paksa muat relasi jika Eloquent Model (kadang belum eager loaded)
    if ($header && method_exists($header, 'loadMissing')) {
        $header->loadMissing(['plant', 'entity', 'genset', 'items.workStandard']);
    }

    // ==== Plant ====
    $plantCandidates = collect([
        data_get($header, 'plant.plant_name'),
        data_get($header, 'plant.name'),
        data_get($header, 'plant.nama'),
        data_get($header, 'plant.plant_desc'),
        data_get($header, 'plant.description'),
        data_get($header, 'entity.entity_name'),
        data_get($header, 'entity.name'),
        data_get($header, 'entity.nama'),
        data_get($header, 'plant_code'),
        data_get($header, 'entity_code'),
    ])->filter(fn($v) => filled($v))->values();

    $resolvedPlant = $plantName
        ?? $plant
        ?? ($plantCandidates->first() ?? '');

    // ==== Merk Genset (brand + model bila ada) ====
    $g = data_get($header, 'genset');
    $brand = collect([
        data_get($g, 'brand'),
        data_get($g, 'merk'),
        data_get($g, 'brand_name'),
        data_get($g, 'merk_name'),
        data_get($g, 'name'),
        data_get($g, 'nama'),
    ])->first(fn($v) => filled($v));

    $model = collect([
        data_get($g, 'model'),
        data_get($g, 'type'),
        data_get($g, 'tipe'),
        data_get($g, 'series'),
        data_get($g, 'model_name'),
    ])->first(fn($v) => filled($v));

    $resolvedGensetBrand = $gensetBrand
        ?? $gensetMerk
        ?? (filled($brand) && filled($model) ? trim($brand.' '.$model) : ($brand ?? ''));

    if ($resolvedGensetBrand === '' && filled(data_get($header, 'genset_id'))) {
        $resolvedGensetBrand = 'ID: '.data_get($header, 'genset_id'); // terakhir banget supaya tidak "-"
    }

    // Set variabel yang dipakai markup
    $plantName   = $resolvedPlant;
    $plant       = $resolvedPlant;
    $gensetBrand = $resolvedGensetBrand;
    $gensetMerk  = $resolvedGensetBrand;

    // ==== Tanggal ====
    if (!isset($inspectionDate)) {
        $inspectionDate = data_get($header, 'inspection_date') ?? data_get($header, 'created_at');
    }
    if (!isset($verificationDate)) {
        $verificationDate = data_get($header, 'approved_at') ?? data_get($header, 'verified_at');
    }

    // ==== Bulan (hindari Undefined $months) ====
    if (!isset($months)) {
        $months = [
            1=>'Januari', 2=>'Februari', 3=>'Maret', 4=>'April',
            5=>'Mei', 6=>'Juni', 7=>'Juli', 8=>'Agustus',
            9=>'September', 10=>'Oktober', 11=>'November', 12=>'Desember'
        ];
    }

    // ==== Data grid checklist (sesuai logic kamu) ====
    $norm = function (?string $p) {
        $t = mb_strtolower(trim($p ?? ''));
        if (str_contains($t, 'minggu')) return 'Mingguan';
        if (str_contains($t, '3'))      return '3 Bulanan';
        if (str_contains($t, '6') || str_contains($t,'semester')) return '6 Bulanan';
        if (str_contains($t, 'tahun'))  return 'Tahunan';
        if (str_contains($t, 'bulan'))  return 'Bulanan';
        return 'Bulanan';
    };

    $standards = collect($workStandards ?? []);
    if ($standards->isEmpty() && isset($inspectionHistory)) {
        $standards = collect($inspectionHistory)
            ->flatMap(fn($ins) => $ins->items ?? [])
            ->pluck('workStandard')->filter()->unique('id')->values();
    }

    $groups = ['Mingguan'=>[], 'Bulanan'=>[], '3 Bulanan'=>[], '6 Bulanan'=>[], 'Tahunan'=>[]];
    foreach ($standards as $ws) { $groups[$norm($ws->period)][] = $ws; }
    foreach ($groups as $k => $arr) { usort($arr, fn($a,$b)=>strcmp($a->work_item,$b->work_item)); $groups[$k] = $arr; }

    $markWeek = $markMonth = $markQ = $markH = $markY = [];
    if (isset($inspectionHistory)) {
        foreach ($inspectionHistory as $ins) {
            $date = $ins->inspection_date ? Carbon::parse($ins->inspection_date) : null;
            if (!$date) continue;
            $m = (int) $date->month;
            $w = min(4, (int) ceil($date->day / 7)); // minggu 1..4
            $q = (int) ceil($m / 3);                 // kuartal 1..4
            $h = $m <= 6 ? 1 : 2;                    // semester 1..2

            foreach (($ins->items ?? []) as $it) {
                $ws = $it->workStandard ?? null;
                if (!$ws) continue;
                $id  = $ws->id;
                $pid = $norm($ws->period);

                if     ($pid === 'Mingguan')  { $markWeek[$id][$m][$w] = true; }
                elseif ($pid === 'Bulanan')   { $markMonth[$id][$m]    = true; }
                elseif ($pid === '3 Bulanan') { $markQ[$id][$q]        = true; }
                elseif ($pid === '6 Bulanan') { $markH[$id][$h]        = true; }
                elseif ($pid === 'Tahunan')   { $markY[$id]            = true; }
            }
        }
    }

    $rowNo = 0;
@endphp

    {{-- Info Plant & Merk (rata kiri) --}}
    <div class="sub-info">
        <table class="meta-table">
            <tr>
                <td><strong>Plant</strong></td><td>:</td>
                <td>{{ $plantName ?? $plant ?? '-' }}</td>
            </tr>
            <tr>
                <td><strong>Merk Genset</strong></td><td>:</td>
                <td>{{ $gensetBrand ?? $gensetMerk ?? '-' }}</td>
            </tr>
        </table>
    </div>

    {{-- ===== TABEL CHECKLIST ===== --}}
    <table>
        <thead>
            <tr>
                <th class="col-no" rowspan="2">No</th>
                <th class="col-item" rowspan="2">ITEM PEKERJAAN</th>
                <th class="col-waktu" rowspan="2">WAKTU</th>
                @foreach ($months as $m => $name)
                    <th class="head-month text-center" colspan="4">{{ $name }}</th>
                @endforeach
            </tr>
            <tr>
                @for ($i=1; $i<=12; $i++)
                    <th class="head-week text-center">1</th>
                    <th class="head-week text-center">2</th>
                    <th class="head-week text-center">3</th>
                    <th class="head-week text-center">4</th>
                @endfor
            </tr>
        </thead>
        <tbody>

            {{-- Mingguan --}}
            @if (!empty($groups['Mingguan']))
                @php $rowspan = count($groups['Mingguan']); $first = true; @endphp
                @foreach ($groups['Mingguan'] as $ws)
                    @php $rowNo++; @endphp
                    <tr>
                        <td class="text-center">{{ $rowNo }}</td>
                        <td class="text-left">{{ $ws->work_item }}</td>
                        @if ($first)
                            <td class="text-center" rowspan="{{ $rowspan }}">Mingguan</td>
                            @php $first = false; @endphp
                        @endif
                        @for ($m=1; $m<=12; $m++)
                            @for ($w=1; $w<=4; $w++)
                                <td class="text-center">{{ !empty($markWeek[$ws->id][$m][$w]) ? '✓' : '' }}</td>
                            @endfor
                        @endfor
                    </tr>
                @endforeach
            @endif

            {{-- Bulanan --}}
            @if (!empty($groups['Bulanan']))
                @php $rowspan = count($groups['Bulanan']); $first = true; @endphp
                @foreach ($groups['Bulanan'] as $ws)
                    @php $rowNo++; @endphp
                    <tr>
                        <td class="text-center">{{ $rowNo }}</td>
                        <td class="text-left">{{ $ws->work_item }}</td>
                        @if ($first)
                            <td class="text-center" rowspan="{{ $rowspan }}">Bulanan</td>
                            @php $first = false; @endphp
                        @endif
                        @for ($m=1; $m<=12; $m++)
                            <td class="text-center" colspan="4">{{ !empty($markMonth[$ws->id][$m]) ? '✓' : '' }}</td>
                        @endfor
                    </tr>
                @endforeach
            @endif

            {{-- 3 Bulanan --}}
            @if (!empty($groups['3 Bulanan']))
                @php $rowspan = count($groups['3 Bulanan']); $first = true; @endphp
                @foreach ($groups['3 Bulanan'] as $ws)
                    @php $rowNo++; @endphp
                    <tr>
                        <td class="text-center">{{ $rowNo }}</td>
                        <td class="text-left">{{ $ws->work_item }}</td>
                        @if ($first)
                            <td class="text-center" rowspan="{{ $rowspan }}">3 Bulanan</td>
                            @php $first = false; @endphp
                        @endif
                        @for ($q=1; $q<=4; $q++)
                            <td class="text-center" colspan="12">{{ !empty($markQ[$ws->id][$q]) ? '✓' : '' }}</td>
                        @endfor
                    </tr>
                @endforeach
            @endif

            {{-- 6 Bulanan --}}
            @if (!empty($groups['6 Bulanan']))
                @php $rowspan = count($groups['6 Bulanan']); $first = true; @endphp
                @foreach ($groups['6 Bulanan'] as $ws)
                    @php $rowNo++; @endphp
                    <tr>
                        <td class="text-center">{{ $rowNo }}</td>
                        <td class="text-left">{{ $ws->work_item }}</td>
                        @if ($first)
                            <td class="text-center" rowspan="{{ $rowspan }}">6 Bulanan</td>
                            @php $first = false; @endphp
                        @endif
                        <td class="text-center" colspan="24">{{ !empty($markH[$ws->id][1]) ? '✓' : '' }}</td>
                        <td class="text-center" colspan="24">{{ !empty($markH[$ws->id][2]) ? '✓' : '' }}</td>
                    </tr>
                @endforeach
            @endif

            {{-- Tahunan --}}
            @if (!empty($groups['Tahunan']))
                @php $rowspan = count($groups['Tahunan']); $first = true; @endphp
                @foreach ($groups['Tahunan'] as $ws)
                    @php $rowNo++; @endphp
                    <tr>
                        <td class="text-center">{{ $rowNo }}</td>
                        <td class="text-left">{{ $ws->work_item }}</td>
                        @if ($first)
                            <td class="text-center" rowspan="{{ $rowspan }}">Tahunan</td>
                            @php $first = false; @endphp
                        @endif
                        <td class="text-center" colspan="48">{{ !empty($markY[$ws->id]) ? '✓' : '' }}</td>
                    </tr>
                @endforeach
            @endif

        </tbody>
    </table>

    {{-- ===== HALAMAN 2: TANGGAL PALING KIRI, 2 QR + LABEL CENTER ===== --}}
    <div class="page-break"></div>
    <table class="sign-outer">
        <tr>
            <!-- Kolom kiri: tanggal (paling kiri) -->
            <td class="dates-col">
                <div><b>Tanggal Inspeksi:</b>
                    {{ !empty($inspectionDate) ? \Carbon\Carbon::parse($inspectionDate)->translatedFormat('d M Y') : '' }}
                </div>
                <div><b>Tanggal Verifikasi:</b>
                    {{ !empty($verificationDate) ? \Carbon\Carbon::parse($verificationDate)->translatedFormat('d M Y') : '' }}
                </div>
            </td>

            <!-- Kolom tengah: 2 QR + label (center) -->
            <td class="center-col">
                <table class="qr-table">
                    <tr>
                        <td class="qr-cell">
                            <div class="sign-square">
                                @if(!empty($makerQrDataUri))
                                    <img src="{{ $makerQrDataUri }}" alt="QR Dibuat oleh">
                                @endif
                            </div>
                            <span class="sign-label">Dibuat oleh</span>
                        </td>
                        <td class="qr-cell">
                            <div class="sign-square">
                                @if(!empty($validatorQrDataUri))
                                    <img src="{{ $validatorQrDataUri }}" alt="QR Diketahui oleh">
                                @endif
                            </div>
                            <span class="sign-label">Diketahui oleh</span>
                        </td>
                    </tr>
                </table>
            </td>

            <!-- Kolom kanan: spacer agar center simetris -->
            <td class="right-spacer">&nbsp;</td>
        </tr>
    </table>

</body>
</html>
