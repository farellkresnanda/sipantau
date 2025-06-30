<?php

use App\Http\Controllers\K3InfoController;
use App\Http\Controllers\K3TemuanController;
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
        Route::resource('users', UserController::class);
    });

    Route::get('about-us', function () {
        return Inertia::render('about-us');
    })->name('about-us');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
