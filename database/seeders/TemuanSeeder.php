<?php

namespace Database\Seeders;

use Carbon\Carbon;
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
            DB::table('finding')->insert([
                'status_finding' => fake()->randomElement(['Open', 'In Progress', 'Closed']),
                'approval_status' => fake()->randomElement(['Approved', 'Pending', 'Rejected']),
                'car_number_auto' => 'CAR-'.str_pad($i, 4, '0', STR_PAD_LEFT),
                'date' => fake()->date(),

                'nonconformity_type_id' => fake()->numberBetween(1, 5),
                'finding_description' => fake()->paragraph(),
                'photo_before' => 'finding_sebelum_'.$i.'.jpg',
                'location_details' => fake()->address(),
                'root_cause' => fake()->sentence(),
                'car_number_manual' => 'MAN-'.strtoupper(Str::random(5)),
                'corrective_plan' => fake()->sentence(),
                'corrective_due_date' => fake()->dateTimeBetween('+1 week', '+1 month'),
                'corrective_action' => fake()->sentence(),
                'verifikasi_perbaikan' => fake()->randomElement(['Sudah Diverifikasi', 'Belum Diverifikasi']),
                'date_verifikasi' => fake()->dateTimeBetween('-1 week', 'now'),
                'note' => fake()->sentence(),
                'photo_after' => 'finding_sesudah_'.$i.'.jpg',

                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }
}
