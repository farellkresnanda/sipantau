<?php

use App\Http\Controllers\K3InfoController;
use App\Http\Controllers\K3TemuanController;
use App\Http\Controllers\Master\MasterEntitasController;
use App\Http\Controllers\MasterInspeksiGensetController;
use App\Http\Controllers\MasterInspeksiK3lController;
use App\Http\Controllers\MasterInspeksiK3lDeskripsiController;
use App\Http\Controllers\MasterInspeksiP3kController;
use App\Http\Controllers\MasterJenisKetidaksesuaianController;
use App\Http\Controllers\MasterJenisKetidaksesuaianSubController;
use App\Http\Controllers\MasterKonsekuensiController;
use App\Http\Controllers\MasterLaporanUjiRiksaFasilitasController;
use App\Http\Controllers\MasterLaporanUjiRiksaPeralatanController;
use App\Http\Controllers\MasterLokasiController;
use App\Http\Controllers\MasterPlantController;
use App\Http\Controllers\MasterProbabilitasController;
use App\Http\Controllers\MasterRumusLtifrController;
use App\Http\Controllers\MasterSertifikasiK3Controller;
use App\Http\Controllers\MasterSkalaPrioritasController;
use App\Http\Controllers\MasterStatistikK3Controller;
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

    // K3 Temuan routes
    Route::resource('k3temuan', K3TemuanController::class);

    // K3 Info routes
    Route::prefix('reports')->group(function () {
        Route::resource('k3info', K3InfoController::class);
    });

    // Role Admin and Super Admin routes
    Route::group(['middleware' => ['role:Admin|Super Admin']], function () {

        // Master Data routes
        Route::resource('users', UserController::class);
        Route::resource('master-entitas', MasterEntitasController::class);
        Route::resource('master-inspeksi-genset', MasterInspeksiGensetController::class);
        Route::resource('master-inspeksi-k3l', MasterInspeksiK3lController::class);
        Route::resource('master-inspeksi-k3l-deskripsi', MasterInspeksiK3lDeskripsiController::class);
        Route::resource('master-inspeksi-p3k', MasterInspeksiP3kController::class);
        Route::resource('master-jenis-ketidaksesuaian', MasterJenisKetidaksesuaianController::class);
        Route::resource('master-jenis-ketidaksesuaian-sub', MasterJenisKetidaksesuaianSubController::class);
        Route::resource('master-konsekuensi', MasterKonsekuensiController::class);
        Route::resource('master-laporan-uji-riksa-fasilitas', MasterLaporanUjiRiksaFasilitasController::class);
        Route::resource('master-laporan-uji-riksa-peralatan', MasterLaporanUjiRiksaPeralatanController::class);
        Route::resource('master-lokasi', MasterLokasiController::class);
        Route::resource('master-plant', MasterPlantController::class);
        Route::resource('master-probabilitas', MasterProbabilitasController::class);
        Route::resource('master-rumus-ltifr', MasterRumusLtifrController::class);
        Route::resource('master-sertifikasi-k3', MasterSertifikasiK3Controller::class);
        Route::resource('master-skela-prioritas', MasterSkalaPrioritasController::class);
        Route::resource('master-statistik-k3', MasterStatistikK3Controller::class);
    });

    Route::get('about-us', function () {
        return Inertia::render('about-us');
    })->name('about-us');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
