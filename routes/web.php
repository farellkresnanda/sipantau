<?php

use App\Http\Controllers\AparInspectionController;
use App\Http\Controllers\FindingController;
use App\Http\Controllers\HseInformationController;
use App\Http\Controllers\FirstAidInspectionController;
use App\Http\Controllers\Master\MasterAcController;
use App\Http\Controllers\Master\MasterAparController;
use App\Http\Controllers\Master\MasterApdController;
use App\Http\Controllers\Master\MasterBuildingController;
use App\Http\Controllers\Master\MasterBuildingWorkStandardController;
use App\Http\Controllers\Master\MasterConsequenceController;
use App\Http\Controllers\Master\MasterEntityController;
use App\Http\Controllers\Master\MasterGensetController;
use App\Http\Controllers\Master\MasterGensetWorkStandardController;
use App\Http\Controllers\Master\MasterHseCertificationController;
use App\Http\Controllers\Master\MasterHseStatisticController;
use App\Http\Controllers\Master\MasterK3lController;
use App\Http\Controllers\Master\MasterLokasiController;
use App\Http\Controllers\Master\MasterNonconformityTypeController;
use App\Http\Controllers\Master\MasterP3kController;
use App\Http\Controllers\Master\MasterPlantController;
use App\Http\Controllers\Master\MasterPriorityScaleController;
use App\Http\Controllers\Master\MasterProbabilityController;
use App\Http\Controllers\Master\MasterTestEquipmentReportController;
use App\Http\Controllers\Master\MasterTestFacilityReportController;
use App\Http\Controllers\ModuleManagerController;
use App\Http\Controllers\PpeInspectionController;
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
    Route::post('finding/verify/{uiid}', [FindingController::class, 'verify'])->name('finding.verify');
    Route::resource('finding', FindingController::class);

    // Inspection routes
    Route::prefix('inspection')->group(function () {
        // First Aid Inspection routes
        Route::resource('first-aid', FirstAidInspectionController::class)->names('inspection.first-aid');
        Route::resource('apar', AparInspectionController::class)->names('inspection.apar');
    });


    // PPE Inspection routes
    Route::post('ppe/verify/{uiid}', [PpeInspectionController::class, 'verify'])->name('inspection.ppe.verify');
    Route::resource('ppe', PpeInspectionController::class)->names('inspection.ppe');
});

// Analysis routes
Route::prefix('analysis')->group(function () {
    Route::resource('hse-information', HseInformationController::class);
});

// Login as user routes
Route::get('users/login-revert', [UserController::class, 'loginRevert'])->name('login-as.revert');
Route::get('users/login-as/{id}', [UserController::class, 'loginAs'])->name('login.as')->middleware('role:Admin|SuperAdmin');

// Role Admin and SuperAdmin routes
Route::group(['middleware' => ['role:Admin|SuperAdmin']], function () {

    // User Management routes
    Route::resource('users', UserController::class);
    // Module Manager routes
    Route::resource('module-managers', ModuleManagerController::class);
    // Master Data routes
    Route::prefix('master')->group(function () {
        Route::resource('entity', MasterEntityController::class);
        Route::get('ac/export', [MasterAcController::class, 'export'])->name('ac.export');
        Route::get('ac/import', [MasterAcController::class, 'import'])->name('ac.import');
        Route::post('ac/import', [MasterAcController::class, 'action_import'])->name('ac.action_import');
        Route::resource('ac', MasterAcController::class);
        Route::get('apar/export', [MasterAparController::class, 'export'])->name('apar.export');
        Route::get('apar/import', [MasterAparController::class, 'import'])->name('apar.import');
        Route::post('apar/import', [MasterAparController::class, 'action_import'])->name('apar.action_import');
        Route::resource('apar', MasterAparController::class);
        Route::resource('apd', MasterApdController::class);
        Route::resource('building', MasterBuildingController::class);
        Route::resource('genset', MasterGensetController::class);
        Route::resource('k3l', MasterK3lController::class);
        Route::get('p3k/export', [MasterP3kController::class, 'export'])->name('p3k.export');
        Route::get('p3k/import', [MasterP3kController::class, 'import'])->name('p3k.import');
        Route::post('p3k/import', [MasterP3kController::class, 'action_import'])->name('p3k.action_import');
        Route::resource('p3k', MasterP3kController::class);
        Route::resource('nonconformity-type', MasterNonconformityTypeController::class);
        Route::resource('consequence', MasterConsequenceController::class);
        Route::resource('test-facility-report', MasterTestFacilityReportController::class);
        Route::resource('test-equipment-report', MasterTestEquipmentReportController::class);
        Route::resource('location', MasterLokasiController::class);
        Route::resource('plant', MasterPlantController::class);
        Route::resource('probability', MasterProbabilityController::class);
        Route::resource('hse-certification', MasterHseCertificationController::class);
        Route::resource('priority-scale', MasterPriorityScaleController::class);
        Route::resource('building-work-standard', MasterBuildingWorkStandardController::class);
        Route::resource('genset-work-standard', MasterGensetWorkStandardController::class);
        Route::resource('hse-statistic', MasterHseStatisticController::class);
        Route::resource('probability', MasterProbabilityController::class);
    });
});

Route::get('about-us', function () {
    return Inertia::render('about-us');
})->name('about-us');


Route::get('/test-error', function () {
    abort(500);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
