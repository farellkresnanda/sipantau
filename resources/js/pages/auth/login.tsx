import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

declare global {
    interface Window {
        grecaptcha: {
            ready: (cb: () => void) => void;
            execute: (siteKey: string, options: { action: string }) => Promise<string>;
        };
    }
}

const SITE_KEY = import.meta.env.VITE_RECAPTCHAV3_SITEKEY;

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
    'g-recaptcha-response': string;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
        'g-recaptcha-response': '', // Pastikan ini dimulai kosong
    });

    const [isRecaptchaReady, setIsRecaptchaReady] = useState(false);
    const [recaptchaError, setRecaptchaError] = useState<string | null>(null);

    useEffect(() => {
        if (!SITE_KEY) {
            console.error('❌ SITE_KEY reCAPTCHA tidak tersedia. Periksa .env (VITE_RECAPTCHAV3_SITEKEY).');
            setRecaptchaError('Kunci verifikasi keamanan tidak ditemukan. Mohon hubungi administrator.');
            return;
        }

        const scriptId = 'recaptcha-script';
        if (document.getElementById(scriptId)) {
            if (typeof window.grecaptcha !== 'undefined') {
                window.grecaptcha.ready(() => {
                    console.log('✅ reCAPTCHA client is already ready (from existing script).');
                    setIsRecaptchaReady(true);
                    setRecaptchaError(null);
                });
            } else {
                console.error('❌ Script reCAPTCHA ditemukan, tetapi objek grecaptcha tidak tersedia.');
                setRecaptchaError('Verifikasi keamanan gagal dimuat. Mohon coba lagi.');
            }
            return;
        }

        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
        script.async = true;
        script.defer = true;
        script.id = 'recaptcha-script';

        script.onload = () => {
            console.log('✅ Script reCAPTCHA berhasil dimuat.');
            if (typeof window.grecaptcha !== 'undefined') {
                window.grecaptcha.ready(() => {
                    console.log('✅ reCAPTCHA client is now ready (from new script).');
                    setIsRecaptchaReady(true);
                    setRecaptchaError(null);
                });
            } else {
                console.error('❌ Objek grecaptcha tidak ditemukan setelah script dimuat.');
                setRecaptchaError('Gagal menginisialisasi verifikasi keamanan setelah pemuatan.');
                setData('g-recaptcha-response', ''); // ✅ Kosongkan token jika grecaptcha tidak ditemukan
            }
        };

        script.onerror = () => {
            console.error('❌ Gagal memuat script reCAPTCHA');
            setRecaptchaError('Gagal memuat verifikasi keamanan. Mohon coba lagi.');
            setData('g-recaptcha-response', ''); // ✅ Kosongkan token jika script gagal dimuat
            const existingScript = document.getElementById(scriptId);
            if (existingScript) {
                document.body.removeChild(existingScript);
            }
        };

        document.body.appendChild(script);

        return () => {
            const existingScript = document.getElementById(scriptId);
            if (existingScript && existingScript.parentNode) {
                existingScript.parentNode.removeChild(existingScript);
            }
        };
    }, []);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        // ✅ Pastikan token di-reset ke string kosong sebelum setiap percobaan eksekusi
        // Ini adalah poin krusial untuk mencegah pengiriman token lama yang sudah tidak valid
        // jika reCAPTCHA tidak berhasil dieksekusi ulang.
        setData('g-recaptcha-response', ''); // **INITIALLY CLEAR THE TOKEN**

        if (!isRecaptchaReady || typeof window.grecaptcha === 'undefined') {
            console.error('reCAPTCHA belum siap atau tidak tersedia. Tidak bisa submit.');
            setRecaptchaError('Verifikasi keamanan (reCAPTCHA) belum siap. Mohon tunggu atau refresh halaman.');
            // Karena kita sudah mengosongkan di awal, tidak perlu setData lagi di sini
            post(route('login')); // Tetap coba kirim agar validasi backend berjalan
            return;
        }

        try {
            const token = await window.grecaptcha.execute(SITE_KEY, { action: 'login' });
            setData('g-recaptcha-response', token); // Set token yang baru didapat

            post(route('login'), {
                onFinish: () => reset('password'),
                onError: (backendErrors) => {
                    if (backendErrors['g-recaptcha-response']) {
                        setRecaptchaError(backendErrors['g-recaptcha-response']);
                    }
                }
            });
        } catch (error) {
            console.error('❌ Error saat mengeksekusi reCAPTCHA:', error);
            // Token sudah dikosongkan di awal, jadi ini hanya memastikan error ditampilkan
            setRecaptchaError('Verifikasi reCAPTCHA gagal. Silakan coba lagi.');
            post(route('login')); // Tetap coba kirim agar validasi backend berjalan
        }
    };

    return (
        <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
            <Head title="Log in" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@kimiafarma.co.id"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <InputError message={errors['g-recaptcha-response']} />
                    {recaptchaError && <InputError message={recaptchaError} />}

                    <Button
                        type="submit"
                        className="mt-4 w-full"
                        tabIndex={4}
                        // Nonaktifkan tombol hanya jika processing atau ada error reCAPTCHA
                        // Kita tetap izinkan submit jika isRecaptchaReady false
                        // karena kita akan mengosongkan token secara eksplisit
                        // yang akan ditangkap oleh validasi backend.
                        disabled={processing || !!recaptchaError}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Log in
                    </Button>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}