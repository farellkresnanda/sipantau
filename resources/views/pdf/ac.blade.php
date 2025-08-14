<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Kartu Pemeliharaan AC - {{ $masterAc->inventory_code }}</title>
    <style>
        body { 
            font-family: "Helvetica", "DejaVu Sans", sans-serif; 
            font-size: 10px; 
            margin: 20px 25px;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
        }
        th, td { 
            border: 1px solid black; 
            padding: 4px; 
            vertical-align: middle; 
        }
        .details-table td { 
            border: none; 
            padding: 1.5px 0;
            vertical-align: top;
        }
        .main-table th { text-align: center; }
        .main-table td { text-align: center; height: 20px; }
        .text-left { text-align: left; }
    </style>
</head>
<body>

    <table style="width: 100%; border: none; margin-bottom: 15px;">
        <tr>
            <td style="width: 25%; border: none; vertical-align: top;">
                @php
                    $logoPath = public_path('images/logo-kf.png');
                @endphp
                @if(file_exists($logoPath))
                    <img src="{{ $logoPath }}" alt="Logo" style="width: 100px;">
                @endif
            </td>
            <td style="width: 50%; border: none; text-align: center; vertical-align: top;">
                <h3 style="margin: 0; font-size: 16px; text-decoration: underline;"><br><br>KARTU PEMELIHARAAN AC</h3>
            </td>
            <td style="width: 25%; border: none;">
                {{-- Kolom kosong untuk keseimbangan --}}
            </td>
        </tr>
    </table>

    <table class="details-table">
        <tr>
            <td style="width: 15%;"><strong>Nomor Inventaris</strong></td>
            <td style="width: 35%;">: {{ $masterAc->inventory_code ?? '-' }}</td>
            <td style="width: 15%;"><strong>Ruang</strong></td>
            <td style="width: 35%;">: {{ $masterAc->room ?? '-' }}</td>
        </tr>
        <tr>
            <td><strong>Nomor Seri</strong></td>
            <td>: {{ $masterAc->serial_number ?? '-' }}</td>
            <td><strong>Jenis AC</strong></td>
            <td>: {{ $masterAc->ac_type ?? '-' }}</td>
        </tr>
        <tr>
            <td><strong>Merk</strong></td>
            <td>: {{ $masterAc->merk ?? '-' }}</td>
            <td><strong>Tahun Pembelian</strong></td>
            <td>: {{ $masterAc->purchase_year ?? '-' }}</td>
        </tr>
    </table>

    <table class="main-table">
        <thead>
            <tr>
                <th rowspan="2" style="width: 5%;">No.</th>
                <th rowspan="2" style="width: 12%;">Tanggal</th>
                <th rowspan="2">Perbaikan / Perawatan</th>
                <th colspan="2">Kondisi</th>
                <th rowspan="2">Keterangan</th>
                <th rowspan="2" style="width: 15%;">Stempel/Paraf Petugas</th>
            </tr>
            <tr>
                <th style="width: 7%;">Baik</th>
                <th style="width: 7%;">Rusak</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($inspectionHistory as $index => $inspection)
                @php
                    $item = $inspection->items->first();
                @endphp
                @if ($item)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ \Carbon\Carbon::parse($inspection->inspection_date)->format('d/m/y') }}</td>
                        <td class="text-left">{{ $item->maintenance_status ?? '-' }}</td>
                        <td>{{ $item->condition_status === 'Baik' ? '✓' : '' }}</td>
                        <td>{{ $item->condition_status === 'Rusak' ? '✓' : '' }}</td>
                        <td class="text-left">{{ $item->notes ?? '-' }}</td>
                        
                        <td>
                            @if ($inspection->qr_code_path && file_exists(storage_path('app/public/' . $inspection->qr_code_path)))
                                <img src="{{ storage_path('app/public/' . $inspection->qr_code_path) }}" alt="QR Code" style="width: 30px; height: 30px; margin: auto;">
                            @else
                                {{ $inspection->createdBy->name ?? '' }}
                            @endif
                        </td>
                    </tr>
                @endif
            @endforeach
            
            {{-- Loop untuk mengisi baris kosong hingga total 15 baris --}}
            @for ($i = $inspectionHistory->count(); $i < 15; $i++)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            @endfor
        </tbody>
    </table>
</body>
</html>