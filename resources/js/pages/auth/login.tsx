import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

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
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
        'g-recaptcha-response': '',
    } as LoginForm);

    useEffect(() => {
        const loadRecaptcha = async () => {
            const script = document.createElement('script');
            script.src = 'https://www.google.com/recaptcha/api.js?render=' + import.meta.env.VITE_RECAPTCHAV3_SITEKEY;
            script.async = true;
            script.onload = () => {
                // Pre-execute recaptcha to avoid delay during form submission
                (window as any).grecaptcha.ready(() => {
                    (window as any).grecaptcha.execute(import.meta.env.VITE_RECAPTCHAV3_SITEKEY, { action: 'login' }).then((token: string) => {
                        setData('g-recaptcha-response', token);
                    });
                });
            };
            document.body.appendChild(script);
        };
        loadRecaptcha();

        return () => {
            document.querySelectorAll('script[src*="recaptcha"]').forEach((script) => script.remove());
        };
    }, []);

    const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();

        try {
            const grecaptcha = (window as any).grecaptcha;
            if (!grecaptcha) {
                throw new Error('reCAPTCHA not loaded');
            }

            const token = await grecaptcha.execute(import.meta.env.VITE_RECAPTCHAV3_SITEKEY, { action: 'login' });

            if (!token) {
                throw new Error('Failed to get reCAPTCHA token');
            }

            setData('g-recaptcha-response', token);
            post(route('login'));
        } catch (error) {
            console.error('reCAPTCHA error:', error);
            setData('g-recaptcha-response', '');
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('email', e.target.value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('password', e.target.value);
    };

    const handleRememberChange = () => {
        setData('remember', !data.remember);
    };

    return (
        <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
            <Head title="Log in" />

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
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
                            onChange={handleEmailChange}
                            placeholder="mail@kimiafarma.co.id"
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
                            onChange={handlePasswordChange}
                            placeholder="********"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox id="remember" name="remember" checked={data.remember} onClick={handleRememberChange} tabIndex={3} />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <InputError message={errors['g-recaptcha-response']} />

                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Log in
                    </Button>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
