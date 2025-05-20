<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    private function quotes()
    {
        return collect([
            'Keselamatan kerja adalah kunci utama dalam menjaga kualitas layanan dan keberlanjutan bisnis Kimia Farma. - Direktur Utama',
            'Di industri farmasi, satu kelalaian bisa berdampak besar. Budaya K3 wajib jadi DNA setiap insan Kimia Farma. - Direktur Keuangan & Manajemen Risiko',
            'Penerapan K3 yang konsisten mencerminkan integritas dan profesionalisme Kimia Farma sebagai perusahaan kesehatan nasional. -  Direktur Komersial',
            'Kami tidak hanya memproduksi obat, kami juga menjaga kehidupan — dimulai dari keselamatan para pekerjanya. - Direktur Sumber Daya Manusia',
            'Lingkungan kerja yang aman dan sehat adalah bentuk kepedulian nyata Kimia Farma kepada seluruh karyawan dan pelanggan. - Tim K3 Kimia Farma',
        ]);
    }

    public function share(Request $request): array
    {
        [$message, $author] = str($this->quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'message' => fn () => $request->session()->get('message'),
            ],
        ];
    }
}
