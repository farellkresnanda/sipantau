<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Inspeksi Kotak P3K</title>
    <style>
        body {
            /* Mengadopsi font dari template referensi, termasuk DejaVu Sans untuk kompatibilitas karakter */
            font-family: "Times New Roman", Times, "DejaVu Sans", sans-serif;
            margin: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            /* Ukuran font tabel disamakan menjadi 14px */
            font-size: 14px;
        }

        th, td {
            border: 1px solid black;
            /* Padding disamakan menjadi 8px */
            padding: 8px;
            vertical-align: top;
            text-align: left;
        }

        /* Menambahkan perataan justify pada sel data */
        td {
            text-align: justify;
            text-justify: inter-word;
        }

        .title {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 20px;
            /* Menambahkan garis bawah pada judul */
            text-decoration: underline;
        }

        .note {
            font-size: 12px; /* Sedikit diperbesar agar konsisten */
            margin-top: 10px;
        }

        .signature {
            margin-top: 40px;
            text-align: left;
        }
    </style>
</head>
<body>

    <table style="border: none;">
        <tr style="border: none;">
            <td style="border: none; vertical-align: top; font-size: 12px;">
                <div>Copy No. : </div>
                <div>Kode Form : CMD125-UPC-003</div>
                <div>Tgl. Revisi : 11 Des 2023</div>
                <div>Tgl. Berlaku : 20 Des 2023</div>
            </td>
            <td style="border: none; text-align: right;">
                <img src="{{ public_path('images/logo-kf.png') }}" alt="Logo" style="height: 50px;">
            </td>
        </tr>
    </table>

    <div class="title">INSPEKSI KOTAK P3K</div>

    <!-- Info Umum -->
    <table>
        <tr>
            <td style="width: 25%;">Hari, Tanggal</td>
            <td>{{ \Carbon\Carbon::parse($inspection->inspection_date)->translatedFormat('l, d F Y') }}</td>
        </tr>
        <tr>
            <td>Proyek</td>
            <td>{{ $inspection->project_name ?? '-' }}</td>
        </tr>
        <tr>
            <td>Lokasi</td>
            <td>{{ $inspection->location->location ?? '-' }}</td>
        </tr>
        <tr>
            <td>Kode Inventaris</td>
            <td>{{ $inspection->location->inventory_code ?? '-' }}</td>
        </tr>
    </table>

    <!-- Tabel Detail Obat -->
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nama Obat</th>
                <th>Jumlah</th>
                <th>Satuan</th>
                <th>Kondisi</th>
                <th>Masa Berlaku</th>
                <th>Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($inspectorNotes as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $item['item_name'] ?? '-' }}</td>
                    <td>{{ $item['quantity_found'] ?? '-' }}</td>
                    <td>pcs</td>
                    <td>{{ ucfirst($item['condition']) ?? 'N/A' }}</td>
                    <td>
                        {{ !empty($item['expired_at']) ? \Carbon\Carbon::parse($item['expired_at'])->format('d-m-Y') : '-' }}
                    </td>
                    <td>{{ $item['note'] ?? '-' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Catatan -->
    <div class="note">
        <p>Catatan</p>
        <p>- Pemeriksaan harus dilakukan setiap bulan demi keselamatan bersama.</p>
        <p>- Kode pengisian kondisi:</p>
        <p>(o) Baik / Rusak / Tidak ada (N/A)</p>
        <p>- Jika ada obat yang tidak ada/ rusak/ kadaluarsa segera dilaporkan pada bagian Umum dan/atau K3L agar segera dibuatkan perintah
penggantian</p>
    </div>

    <div class="signature">
    <p>Diperiksa oleh,</p>

    {{-- KODE UNTUK MENAMPILKAN QR CODE --}}
    @if ($inspection->qr_code_path && file_exists(storage_path('app/public/' . $inspection->qr_code_path)))
        {{-- Jika path QR ada di DB DAN file-nya ada di storage, tampilkan gambar --}}
        <div style="margin-top: 10px; margin-bottom: 10px;">
            <img src="{{ storage_path('app/public/' . $inspection->qr_code_path) }}" alt="QR Code Verifikasi" style="width: 100px; height: 100px;">
        </div>
    @else
        {{-- Jika QR code tidak ada, berikan spasi agar layout tidak rusak --}}
        <br><br><br>
    @endif
    {{-- AKHIR KODE QR CODE --}}

    <p><strong>(Ety Maryati)</strong><br>Petugas P3K</p>
</div>