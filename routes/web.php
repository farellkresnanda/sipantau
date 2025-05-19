<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', function () {
        return Inertia::render('home');
    })->name('home');

    Route::get('home', function () {
        return Inertia::render('home');
    })->name('home');

    Route::resource('users', UserController::class);

    Route::get('about-us', function () {
        return Inertia::render('about-us');
    })->name('about-us');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
