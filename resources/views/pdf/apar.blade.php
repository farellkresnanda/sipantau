<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Inspeksi APAR</title>
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
            font-size: 14px;
            display: inline-block;
            vertical-align: top;
        }

        .header-info div {
            margin-bottom: 3px;
        }

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
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        th, td {
            border: 1px solid black;
            padding: 6px;
            text-align: center;
            vertical-align: middle;
        }
        .no-border td {
            border: none;
        }
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
        .note {
            font-size: 12px;
            margin-top: 15px;
        }
        .small-text {
            font-size: 10px;
        }
    </style>
</head>
<body>

<!-- Header -->
<div class="header-container">
    <!-- Bagian kiri (info) -->
    <div class="header-info" style="font-size: 12px;">
        <div>Copy No :</div>
        <div>Kode Form. : CMD131-UPC-001/01</div>
        <div>Tgl. Revisi : 11 DES 2023</div>
        <div>Tgl. Berlaku : 20 DES 2023</div>
    </div>

    <!-- Bagian kanan (logo) -->
    <div class="logo">
        <img src="images/logo-kf.png" alt="KF Logo">
    </div>
</div>

<!-- Title -->
<div class="title">INSPEKSI <br> ALAT PEMADAM API RINGAN</div>

<!-- Informasi Umum -->
<table class="info">
    <tr>
        <td style="width: 20%;">Periode</td>
        <td>: {{ $aparInspection->periode ?? '2025' }}</td>
        <td style="width: 20%;">Nomor APAR</td>
        <td>: {{ $aparInspection->apar->inventory_code ?? '-' }}</td>
    </tr>
    <tr>
        <td>Lokasi</td>
        <td>: {{ $aparInspection->apar->location ?? '-' }}</td>
        <td>Tipe APAR</td>
        <td>: {{ $aparInspection->apar->type ?? '-' }}</td>
    </tr>
    <tr>
        <td></td>
        <td></td>
        <td>Tahun Kadaluarsa</td>
        <td>: {{ $aparInspection->expired_year ?? '-' }}</td>
    </tr>
</table>

<!-- Tabel Pemeriksaan -->
<table>
    <thead>
    <tr>
        <th rowspan="2">Bulan</th>
        <th colspan="5">Pemeriksaan</th>
        <th rowspan="2">Paraf</th>
    </tr>
    <tr>
        <th>Segel</th>
        <th>Hose</th>
        <th>Tekanan</th>
        <th>Tabung</th>
        <th>Berat (CO₂)</th>
    </tr>
    </thead>
    <tbody>
    @php
        $months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
    @endphp
    @foreach ($months as $month)
        @php
            $fields = collect($aparInspection->items)
                ->where('month', $month)
                ->pluck('value', 'field'); // ['segel' => '✓', ...]
            $condition = new \App\Helpers\ConditionHelper;
            $isApproved = $fields->filter(fn($v, $k) => in_array($k, ['Segel', 'Hose', 'Tekanan', 'Dibalik', 'Berat (CO₂)']) && $v !== null && $v !== '')->isNotEmpty();
            $qrCodePath = $aparInspection->qr_code_path ?? null;
        @endphp
        <tr>
            <td>{{ $month }}</td>
            <td>{{ $condition::formatCondition($fields['Segel'] ?? '') }}</td>
            <td>{{ $condition::formatCondition($fields['Hose'] ?? '') }}</td>
            <td>{{ $condition::formatCondition($fields['Tekanan'] ?? '') }}</td>
            <td>{{ $condition::formatCondition($fields['Dibalik'] ?? '') }}</td>
            <td>{{ $condition::formatCondition($fields['Berat (CO₂)'] ?? '') }}</td>
            <td style="text-align: center; vertical-align: middle;">
                @if ($isApproved && $qrCodePath)
                    <div>
                        <img src="file://{{ public_path('storage/' . $qrCodePath) }}"
                             alt="QR Code"
                             style="width: 30px; height: 30px; display: block; margin: 0 auto;">
                    </div>
                @endif
            </td>

        </tr>
    @endforeach

    </tbody>
</table>

<!-- Catatan -->
<div class="note">
    <strong>Catatan:</strong><br>
    @if ($aparInspection->note)
        {{ $aparInspection->note }}
    @else
        Tidak ada catatan.
    @endif
</div>

</body>
</html>
