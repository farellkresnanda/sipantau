<?php

namespace App\Http\Requests\Auth;

use App\Rules\Recaptcha;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException; // Pastikan ini ada

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules()
    {
        // ✅ LOGGING INCOMING DATA SANGAT PENTING
        Log::debug('LoginRequest: Full incoming request data:', $this->all());
        Log::debug('LoginRequest: g-recaptcha-response value received:', ['value' => $this->input('g-recaptcha-response')]);

        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            // ✅ Aturan 'required' ini harus MENANGKAP jika field dihapus total
            // ✅ new Recaptcha() ini harus MENANGKAP jika field ada tapi kosong/invalid
            'g-recaptcha-response' => ['required', new Recaptcha],
        ];
    }

    public function messages(): array
    {
        return [
            'g-recaptcha-response.required' => 'Verifikasi keamanan (reCAPTCHA) tidak ditemukan. Mohon refresh halaman.',
            'g-recaptcha-response.string' => 'Format verifikasi keamanan tidak valid.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     * Override method ini untuk log error validasi secara spesifik.
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        Log::warning('LoginRequest: Validation failed for login attempt.', $validator->errors()->toArray());
        throw (new ValidationException($validator))
            ->errorBag($this->errorBag)
            ->redirectTo($this->getRedirectUrl());
    }

    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        // ✅ Log sebelum mencoba otentikasi
        Log::debug('LoginRequest: Attempting authentication for email: '.$this->input('email'));

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            Log::warning('LoginRequest: Authentication failed (credentials) for email: '.$this->input('email'));
            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        Log::info('LoginRequest: User authenticated successfully: '.$this->input('email'));
        RateLimiter::clear($this->throttleKey());
    }

    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->input('email')).'|'.$this->ip());
    }

    protected function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }
}
