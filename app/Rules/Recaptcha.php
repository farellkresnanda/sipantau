<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log; // Pastikan ini ada

class Recaptcha implements Rule
{
    public function passes($attribute, $value)
    {
        Log::debug('Recaptcha Rule: Starting validation for attribute ['.$attribute.']. Value: '.(is_string($value) ? substr($value, 0, 20).'...' : 'Not a string or empty'));

        // ✅ KUNCI PERTAMA: Cek jika nilai benar-benar kosong
        if (empty($value)) {
            Log::warning('Recaptcha Rule: Token is empty or null/undefined for attribute: '.$attribute.' from IP: '.request()->ip());

            return false;
        }

        $secretKey = Config::get('services.recaptcha.secret');
        if (empty($secretKey)) {
            Log::error('Recaptcha Rule: Secret key is missing or empty from config/services.php. Check RECAPTCHAV3_SECRET in .env');

            return false; // Gagal jika secret key tidak ditemukan
        }

        try {
            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $secretKey,
                'response' => $value,
                'remoteip' => request()->ip(),
            ]);

            $result = $response->json();

            // ✅ KUNCI KEDUA: Log seluruh respons dari Google reCAPTCHA API
            Log::debug('Recaptcha Rule: Google API verification result for IP '.request()->ip().':', $result);

            $isSuccess = ($result['success'] ?? false);
            $score = ($result['score'] ?? 0);
            $action = ($result['action'] ?? 'unknown');

            Log::debug("Recaptcha Rule: Verification details - Success: {$isSuccess}, Score: {$score}, Action: {$action}");

            // ✅ KUNCI KETIGA: Pastikan both success dan score terpenuhi
            if (! $isSuccess) {
                Log::warning('Recaptcha Rule: Google verification reported non-success. Errors: '.json_encode($result['error-codes'] ?? []));

                return false;
            }
            if ($score < 0.5) {
                Log::warning('Recaptcha Rule: Google verification score too low: '.$score.' for IP: '.request()->ip());

                return false;
            }

            return true; // Hanya lulus jika semua pengecekan berhasil

        } catch (\Throwable $e) { // Catch Throwable untuk menangkap Error dan Exception
            Log::critical('Recaptcha Rule: CRITICAL Exception during API verification: '.$e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString(), // Log trace untuk detail
            ]);

            return false;
        }
    }

    public function message()
    {
        return 'Verifikasi keamanan gagal. Silakan coba lagi.';
    }
}
