<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TemuanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (range(1, 10) as $i) {
            DB::table('k3_temuan')->insert([
                'status_temuan'           => fake()->randomElement(['Open', 'In Progress', 'Closed']),
                'status_approval'         => fake()->randomElement(['Approved', 'Pending', 'Rejected']),
                'nomor_car_auto'          => 'CAR-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'tanggal'                 => fake()->date(),

                'jenis_ketidaksesuaian_id'=> fake()->numberBetween(1, 5),
                'deskripsi_temuan'        => fake()->paragraph(),
                'foto_temuan_sebelum'     => 'temuan_sebelum_' . $i . '.jpg',
                'detail_lokasi_temuan'    => fake()->address(),
                'akar_masalah'            => fake()->sentence(),
                'nomor_car_manual'        => 'MAN-' . strtoupper(Str::random(5)),
                'rencana_perbaikan'       => fake()->sentence(),
                'batas_waktu_perbaikan'   => fake()->dateTimeBetween('+1 week', '+1 month'),
                'tindakan_perbaikan'      => fake()->sentence(),
                'verifikasi_perbaikan'    => fake()->randomElement(['Sudah Diverifikasi', 'Belum Diverifikasi']),
                'tanggal_verifikasi'      => fake()->dateTimeBetween('-1 week', 'now'),
                'catatan'                 => fake()->sentence(),
                'foto_temuan_sesudah'     => 'temuan_sesudah_' . $i . '.jpg',

                'created_at'              => Carbon::now(),
                'updated_at'              => Carbon::now(),
            ]);
        }
    }
}
