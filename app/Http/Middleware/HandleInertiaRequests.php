<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
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
            "Keselamatan bukan hanya prioritas, tetapi nilai dasar yang tidak bisa dikompromikan. - B.J. Habibie",
            "Tidak ada pekerjaan yang terlalu penting hingga kita harus mengorbankan keselamatan seseorang. - Nelson Mandela",
            "Tempat kerja yang aman menciptakan pikiran yang tenang dan hasil kerja yang hebat. - Mahatma Gandhi",
            "Keselamatan kerja adalah investasi untuk masa depan, bukan beban hari ini. - Ir. Soekarno",
            "Pekerja yang sehat dan selamat adalah aset terbaik perusahaan. - Jack Welch",
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
        ];
    }

}
