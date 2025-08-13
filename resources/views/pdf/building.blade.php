<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Inspeksi Gedung</title>
    <style>
        body {
            font-family: "Times New Roman", Times, "DejaVu Sans", sans-serif;
            margin: 20px;
            font-size: 14px;
        }
        /* HEADER LAYOUT */
        .header-container {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
        }
        .header-info {
            font-size: 12px;
            display: inline-block;
            vertical-align: top;
        }
        .header-info div { margin-bottom: 3px; }
        .logo {
            display: inline-block;
            vertical-align: top;
            align-items: flex-end;
            float: right;
        }
        .logo img {
            height: 50px;
            width: auto;
            margin-left: 20px;
        }

        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th, td { border: 1px solid black; padding: 6px; text-align: left; vertical-align: top; }
        .no-border td { border: none; }
        .title {
            text-align: center;
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 20px;
            text-decoration: underline;
        }
        .info td {
            text-align: left;
            border: none;
            padding: 3px;
        }
        .note { font-size: 12px; margin-top: 15px; }
        .small-text { font-size: 10px; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .nowrap { white-space: nowrap; }
        .wrap { white-space: normal; word-break: break-word; }
    </style>
</head>
<body>

@php
    // Helper kecil untuk ceklis/silang
    $mark = function ($bool) {
        if (is_null($bool)) return '';
        return $bool ? '✔' : '';
    };

    $cond = function ($good, $broken) {
        if ($good) return 'BAIK';
        if ($broken) return 'RUSAK';
        return '';
    };

    $formatDate = function ($date) {
        try {
            return \Carbon\Carbon::parse($date)->translatedFormat('d F Y');
        } catch (\Throwable $e) {
            return $date;
        }
    };

    $periode = $buildingInspection->periode ?? (\Carbon\Carbon::parse($buildingInspection->inspection_date ?? now())->format('Y'));
    $entityName = $buildingInspection->building->entity->name ?? '-';
    $plantName = $buildingInspection->building->plant->name ?? ($buildingInspection->building->location_name ?? '-');
    $buildingName = $buildingInspection->building->location_name ?? '-';
    $freq = $buildingInspection->frequency ?? '-';

    // Ada temuan jika ada action/condition terisi
    $hasFindings = collect($buildingInspection->items ?? [])->contains(function ($it) {
        return ($it->action_repair ?? 0) || ($it->action_maintenance ?? 0) || ($it->condition_good ?? 0) || ($it->condition_broken ?? 0);
    });

    $qrCodePath = $buildingInspection->qr_code_path ?? null;
@endphp

    <!-- Header -->
<div class="header-container">
    <div class="header-info">
        <div>Copy No :</div>
        <div>Kode Form. : CMD131-UPC-002/01</div>
        <div>Tgl. Revisi : 11 DES 2023</div>
        <div>Tgl. Berlaku : 20 DES 2023</div>
    </div>
    <div class="logo">
        <img src="{{ public_path('images/logo-kf.png') }}" alt="KF Logo">
    </div>
</div>

<!-- Title -->
<div class="title">INSPEKSI GEDUNG</div>

<!-- Informasi Umum -->
<table class="info">
    <tr>
        <td style="width: 20%;">Periode</td>
        <td>: {{ $periode }}</td>
        <td style="width: 20%;">Tanggal Inspeksi</td>
        <td>: {{ $formatDate($buildingInspection->inspection_date ?? now()) }}</td>
    </tr>
    <tr>
        <td>Entitas</td>
        <td>: {{ $entityName }}</td>
        <td>Plant / Lokasi</td>
        <td>: {{ $plantName }}</td>
    </tr>
    <tr>
        <td>Frekuensi</td>
        <td>: {{ \Illuminate\Support\Str::of($freq)->lower()->contains('week') ? 'Mingguan' : 'Bulanan' }}</td>
        <td>Gedung</td>
        <td>: {{ $buildingName }}</td>
    </tr>
</table>

<!-- Tabel Item Pemeriksaan -->
<table>
    <thead>
    <tr>
        <th class="text-center" style="width: 30px;">#</th>
        <th class="text-center" style="width: 28%;">Pekerjaan</th>
        <th class="text-center" style="width: 32%;">Deskripsi Standar</th>
        <th class="text-center" style="width: 9%;">Perbaikan</th>
        <th class="text-center" style="width: 10%;">Perawatan</th>
        <th class="text-center" style="width: 9%;">Kondisi</th>
        <th class="text-center" style="width: 12%;">Catatan</th>
    </tr>
    </thead>
    <tbody>
    @forelse ($buildingInspection->items ?? [] as $i => $it)
        <tr>
            <td class="text-center">{{ $i + 1 }}</td>
            <td class="wrap">{{ $it->job_name ?? ($it->workStandard->job_name ?? '-') }}</td>
            <td class="wrap">{{ $it->standard_description ?? ($it->workStandard->standard_description ?? '-') }}</td>
            <td class="text-center nowrap">{{ $mark($it->action_repair ?? 0) }}</td>
            <td class="text-center nowrap">{{ $mark($it->action_maintenance ?? 0) }}</td>
            <td class="text-center nowrap">{{ $cond($it->condition_good ?? 0, $it->condition_broken ?? 0) }}</td>
            <td class="wrap">{{ $it->remarks ?? '' }}</td>
        </tr>
    @empty
        <tr>
            <td colspan="7" class="text-center">Tidak ada item inspeksi.</td>
        </tr>
    @endforelse
    </tbody>
</table>

<!-- Paraf/QR (opsional) -->
<table class="no-border">
    <tr>
        <td class="no-border" style="width: 70%;"></td>
        <td class="no-border" style="width: 30%; text-align: center;">
            @if ($hasFindings && $qrCodePath)
                <div class="small-text" style="margin-bottom: 4px;">Paraf / Verifikasi</div>
                <img src="file://{{ public_path('storage/' . $qrCodePath) }}" alt="QR Code" style="width: 60px; height: 60px;">
            @endif
        </td>
    </tr>
</table>

<!-- Catatan -->
<div class="note">
    <strong>Catatan:</strong><br>
    @php
        $note = $buildingInspection->note_validator
            ?? $buildingInspection->note
            ?? null;
    @endphp
    @if ($note)
        {!! nl2br(e($note)) !!}
    @else
        Tidak ada catatan.
    @endif
</div>

</body>
</html>
