<?php

use App\Http\Controllers\K3InfoController;
use App\Http\Controllers\K3TemuanController;
use App\Http\Controllers\Master\MasterAcController;
use App\Http\Controllers\Master\MasterAparController;
use App\Http\Controllers\Master\MasterApdController;
use App\Http\Controllers\Master\MasterEntitasController;
use App\Http\Controllers\Master\MasterGedungController;
use App\Http\Controllers\Master\MasterGensetController;
use App\Http\Controllers\Master\MasterJenisKetidaksesuaianController;
use App\Http\Controllers\Master\MasterJenisKetidaksesuaianSubController;
use App\Http\Controllers\Master\MasterK3lController;
use App\Http\Controllers\Master\MasterKonsekuensiController;
use App\Http\Controllers\Master\MasterLaporanUjiRiksaFasilitasController;
use App\Http\Controllers\Master\MasterLaporanUjiRiksaPeralatanController;
use App\Http\Controllers\Master\MasterLokasiController;
use App\Http\Controllers\Master\MasterP3KController;
use App\Http\Controllers\Master\MasterPlantController;
use App\Http\Controllers\Master\MasterProbabilitasController;
use App\Http\Controllers\Master\MasterRumusLtifrController;
use App\Http\Controllers\Master\MasterSertifikasiK3Controller;
use App\Http\Controllers\Master\MasterSkalaPrioritasController;
use App\Http\Controllers\Master\MasterStandarKerjaGedungController;
use App\Http\Controllers\Master\MasterStandarKerjaGensetController;
use App\Http\Controllers\Master\MasterStatistikK3Controller;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    // Set the title for the home page
    Route::get('/', function () {
        return Inertia::render('home');
    })->name('home');

    // Dashboard route
    Route::get('home', function () {
        return Inertia::render('home');
    })->name('home');

    // Temuan routes
    Route::resource('k3temuan', K3TemuanController::class);

    // K3 Info routes
    Route::prefix('reports')->group(function () {
        Route::resource('k3info', K3InfoController::class);
    });

    // Role Admin and Super Admin routes
    Route::group(['middleware' => ['role:Admin|Super Admin']], function () {

        // Master Data routes
        Route::resource('users', UserController::class);
        Route::prefix('master')->group(function () {
            Route::resource('entitas', MasterEntitasController::class);
            Route::resource('ac', MasterAcController::class);
            Route::resource('apar', MasterAparController::class);
            Route::resource('apd', MasterApdController::class);
            Route::resource('gedung', MasterGedungController::class);
            Route::resource('genset', MasterGensetController::class);
            Route::resource('k3l', MasterK3lController::class);
            Route::resource('p3k', MasterP3KController::class);
            Route::resource('jenis-ketidaksesuaian', MasterJenisKetidaksesuaianController::class);
            Route::resource('jenis-ketidaksesuaian-sub', MasterJenisKetidaksesuaianSubController::class);
            Route::resource('konsekuensi', MasterKonsekuensiController::class);
            Route::resource('uji-riksa-fasilitas', MasterLaporanUjiRiksaFasilitasController::class);
            Route::resource('uji-riksa-peralatan', MasterLaporanUjiRiksaPeralatanController::class);
            Route::resource('lokasi', MasterLokasiController::class);
            Route::resource('plant', MasterPlantController::class);
            Route::resource('probabilitas', MasterProbabilitasController::class);
            Route::resource('rumus-ltifr', MasterRumusLtifrController::class);
            Route::resource('sertifikasi-k3', MasterSertifikasiK3Controller::class);
            Route::resource('skala-prioritas', MasterSkalaPrioritasController::class);
            Route::resource('standar-kerja-gedung', MasterStandarKerjaGedungController::class);
            Route::resource('standar-kerja-genset', MasterStandarKerjaGensetController::class);
            Route::resource('statistik-k3', MasterStatistikK3Controller::class);
        });
    });

    Route::get('about-us', function () {
        return Inertia::render('about-us');
    })->name('about-us');

});

Route::get('/test-error', function () {
    abort(500);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
