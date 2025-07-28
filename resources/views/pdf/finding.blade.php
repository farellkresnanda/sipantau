<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Corrective Action Report</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('logo/favicon.png') }}">

    <style>
        body {
            font-family: "Times New Roman", Times, "DejaVu Sans", sans-serif;
            margin: 20px;
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

        /* FORM STYLING (tetap sama) */
        .form-title {
            text-align: center;
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 20px;
            text-decoration: underline;
        }

        .field-label {
            font-weight: bold;
            display: block;
            margin-bottom: 4px;
        }

        .field-content {
            white-space: pre-line; /* menjaga line break dari teks yang panjang */
            text-align: justify;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 14px;
        }

        table, th, td {
            border: 1px solid black;
        }

        th, td {
            padding: 8px;
            text-align: left;
            vertical-align: top;
        }

        td {
            text-align: justify;
            text-justify: inter-word;
        }

        .checkbox-options {
            display: flex;
            margin: 10px 0;
            font-size: 14px;
        }

        .checkbox-option {
            display: inline-block;
            margin-right: 15px;
        }

        .signature-qr img {
            margin-top: 10px;
            width: 100px;
            height: 100px;
        }
    </style>
</head>
<body>
<!-- HEADER: Info kiri + Logo kanan dalam SATU GARIS -->
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

<div class="form-title">CORRECTIVE ACTION REPORT</div>

<table style="table-layout: fixed;">
    <tr>
        <td style="width: 70%;">Nomor : {{ $finding->car_number_auto }}</td>
        <td style="width: 30%;">Tanggal : {{ \Carbon\Carbon::parse($finding->date)->format('d-m-Y') }}</td>
    </tr>
</table>

<div class="checkbox-options">
    <strong class="checkbox-option">Jenis ketidaksesuaian:</strong>
    <strong class="checkbox-option">
        {{ $finding->nonconformityType?->name ? '[v]' : '[ ]' }} {{ $finding->nonconformityType?->name ?? 'Temuan audit' }}
    </strong>
    <strong class="checkbox-option">
        {{ $finding->nonconformitySubType?->name ? '[v]' : '[ ]' }} {{ $finding->nonconformitySubType?->name ?? 'Komplain' }}
    </strong>
</div>

<table style="table-layout: fixed;">
    <tr>
        <td style="width: 70%; margin-bottom: 2px;">
            <div class="field-label">Temuan ketidaksesuaian:</div>
            <div class="field-content">{{ $finding->finding_description }}</div>
        </td>
        <td style="width: 30%;">
            <div class="field-label">Penemu:</div>
            <div class="field-content">{{ ucwords(strtolower($finder)) ?? 'Tidak diketahui' }}</div>
        </td>
    </tr>
</table>

<table style="table-layout: fixed;">
    <tr>
        <td style="width: 70%;">
            <div class="field-label">Akar masalah:</div>
            <div class="field-content">{{ $finding->root_cause ?? '-' }}</div>
        </td>
        <td style="width: 30%;">
            <div class="field-label">Penerima:</div>
            <div class="field-content">{{  ucwords(strtolower($receiver)) ?? 'Tidak diketahui' }}</div>
        </td>
    </tr>
</table>

<table style="table-layout: fixed;">
    <tr>
        <td style="width: 70%;">
            <div class="field-label">Rencana perbaikan:</div>
            <div class="field-content" style="margin-bottom: 2px;">{{ $finding->corrective_plan ?? '-' }}</div>
            <div class="field-label">Batas Waktu Perbaikan:</div>
            <div class="field-content">{{ \Carbon\Carbon::parse($finding->corrective_due_date)->format('d-m-Y') }}</div>
        </td>
        <td style="width: 30%;">
            <div class="field-label">Penanggungjawab:</div>
            <div class="field-content">{{ ucwords(strtolower($personInCharge)) ?? 'Tidak diketahui' }}</div>
        </td>
    </tr>
</table>

<table style="table-layout: fixed;">
    <tr>
        <td style="width: 70%;">
            <div class="field-label">Lokasi:</div>
            <div class="field-content">{{ $finding->location_details ?? '-' }}</div>
        </td>
        <td style="width: 30%;">
            <div class="field-label">Tanggal temuan:</div>
            <div class="field-content">{{ \Carbon\Carbon::parse($finding->date)->format('d-m-Y') }}</div>
        </td>
    </tr>
</table>

<table style="table-layout: fixed;">
    <tr>
        <td style="width: 70%;">
            <div class="field-label">Tindakan perbaikan yang dilakukan:</div>
            <div class="field-content">{{ $finding->corrective_action ?? '-' }}</div>
        </td>
        <td style="width: 30%;">
            <div class="field-label">Penanggungjawab:</div>
            <div class="field-content">{{ ucwords(strtolower($personInCharge)) ?? 'Tidak diketahui' }}</div>
        </td>
    </tr>
</table>

<div class="checkbox-options">
    <strong>Verifikasi: </strong>
    <div class="checkbox-option">
        {!! $finding->findingStatus?->name == 'Close/Efektif' ? '<strong>[v] Close/Efektif</strong>' : '[ ] Close/Efektif' !!}
    </div>
    <div class="checkbox-option">
        {!! $finding->findingStatus?->name == 'Tidak efektif' ? '<strong>[v] Tidak efektif</strong>' : '[ ] Tidak efektif' !!}
    </div>
    <div class="checkbox-option">
        {!! $finding->findingStatus?->name == 'Perbaikan' ? '<strong>[v] Perbaikan</strong>' : '[ ] Perbaikan' !!}
    </div>
</div>

<table>
    <tr>
        <td style="width: 70%;"><strong>Tanggal Verifikasi</strong></td>
        <td style="width: 30%;">{{ $verifiedAt ?? '-' }}</td>
    </tr>
</table>

<table style="table-layout: fixed; width: 100%; border-collapse: collapse;" border="1">
    <tr>
        <td style="width: 40%; vertical-align: top; padding: 5px;">
            <div class="field-label"><strong>Catatan:</strong></div>
            <div class="field-content">{{ $verifierNote ?? '-' }}</div>
        </td>
        <td style="width: 30%; padding: 5px; text-align: center; vertical-align: top;">
            <div style="text-align: center; margin-bottom: 5px;">
                <span>Disetujui Oleh:</span>
            </div>
            @if(isset($verifierQR))
                <img src="file://{{ public_path('storage/' . $verifierQR) }}"
                     alt="Verifier QR Code"
                     style="max-width: 80px; max-height: 80px; display: block; margin: 0 auto 5px auto;">
            @else
                <span style="color:red; margin-bottom: 3px">Menunggu...</span>
            @endif
            <div style="text-align: center;">
                @if(isset($verifierQR))
                <strong>{{ ucwords(strtolower($verifier)) }}</strong><br>
                @endif
                <span>Verifikator</span>
            </div>
        </td>
        <td style="width: 30%; padding: 5px; text-align: center; vertical-align: top;">
            <div style="text-align: center; margin-bottom: 5px;">
                <span>Disetujui Oleh:</span>
            </div>
            @if(isset($receiverQr))
                <img src="file://{{ public_path('storage/' . $receiverQr) }}"
                     alt="Receiver QR Code"
                     style="max-width: 80px; max-height: 80px; display: block; margin: 0 auto 5px auto;">
            @else
                <span style="color:red; margin-bottom: 3px">Menunggu...</span>
            @endif
            <div style="text-align: center;">
                @if(isset($receiverQr))
                <strong>{{ ucwords(strtolower($receiver)) }}</strong><br>
                @endif
                <span>Sekretaris P2K3</span>
            </div>
        </td>
    </tr>
</table>

<!-- FOOTER -->
<div style="position: fixed; bottom: 20px; left: 20px; right: 20px; font-size: 12px; text-align: right; font-style: italic; border-top: 1px solid #000; padding-top: 5px;">
    Dicetak oleh: {{ auth()->user()->name ?? 'Pengguna tidak dikenal' }} pada {{ \Carbon\Carbon::now()->format('d-m-Y H:i:s') }}
    <br>
    © {{ date('Y') }} SiPantau - PT. Kimia Farma Tbk. All rights reserved.
</div>

</body>
</html>
