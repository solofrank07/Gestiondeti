<?php

use Illuminate\Support\Facades\Route;
use App\Controllers\AuthController;
use App\Controllers\MapController;
use App\Controllers\ReportController;
use App\Controllers\GeofenceController;
use App\Controllers\DashboardController;
use App\Controllers\PanicController;
use App\Controllers\Admin\UserController;
use App\Controllers\Admin\ETLController;
use App\Controllers\Admin\SettingsController;
use App\Controllers\Admin\RiskZoneController;
use App\Controllers\AIController;

// Health check
Route::get('health', function () {
    return response()->json([
        'status' => 'ok',
        'version' => '1.0.0',
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::prefix('v1')->group(function () {

    // Auth - Public
    Route::post('auth/register', [AuthController::class, 'register'])->middleware('throttle:5,60');
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,60');
    Route::post('auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:3,60');
    Route::post('auth/refresh', [AuthController::class, 'refresh'])->middleware('throttle:10,1');

    // Public map
    Route::get('map/risk-zones', [MapController::class, 'getRiskZones']);
    Route::get('map/heatmap', [MapController::class, 'getHeatmap']);
    Route::get('map/heatmap/tile/{z}/{x}/{y}', [MapController::class, 'getHeatmapTile']);
    Route::get('map/clusters', [MapController::class, 'getClusters']);
    Route::get('map/regions', [MapController::class, 'getRegions']);
    Route::get('map/provinces/{regionId}', [MapController::class, 'getProvinces']);
    Route::get('map/districts/{provinceId}', [MapController::class, 'getDistricts']);

    // AI — public read endpoints
    Route::get('ai/insights', [AIController::class, 'insights']);
    Route::get('ai/patterns', [AIController::class, 'detectPatterns']);
    Route::get('ai/safe-route', [AIController::class, 'safeRoute']);
    Route::get('ai/critical-zones', [AIController::class, 'predictCriticalZones']);

    // Reports (public read — nearby only)
    Route::get('reports/nearby', [ReportController::class, 'nearby']);

    // Public settings
    Route::get('settings/public', [\App\Controllers\Admin\SettingsController::class, 'public']);

    // Authenticated
    Route::middleware('auth:sanctum')->group(function () {

        // Crime types (authenticated)
        Route::get('crime-types', [\App\Controllers\CrimeTypeController::class, 'index']);

        // Auth profile & security
        Route::get('auth/profile', [AuthController::class, 'profile']);
        Route::put('auth/profile', [AuthController::class, 'updateProfile']);
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::post('auth/logout-all', [AuthController::class, 'logoutAll']);
        Route::post('auth/change-password', [AuthController::class, 'changePassword']);

        // AI — authenticated
        Route::post('ai/classify-report/{reportId}', [AIController::class, 'classifyReport']);
        Route::get('ai/predict-zone/{zoneId}', [AIController::class, 'predictRiskZone']);
        Route::get('ai/detect-false/{reportId}', [AIController::class, 'detectFalseReport']);

        // Reports (auth)
        Route::get('reports', [ReportController::class, 'index']);
        Route::get('reports/{id}', [ReportController::class, 'show']);
        Route::post('reports', [ReportController::class, 'store']);
        Route::put('reports/{id}', [ReportController::class, 'update']);
        Route::delete('reports/{id}', [ReportController::class, 'destroy']);

        // Geofencing
        Route::post('geofence/check', [GeofenceController::class, 'check']);
        Route::post('geofence/batch-check', [GeofenceController::class, 'batchCheck']);
        Route::get('geofence/history', [GeofenceController::class, 'history']);
        Route::get('geofence/zones/{lat}/{lng}', [GeofenceController::class, 'getZones']);

        // Panic
        Route::post('panic', [PanicController::class, 'store']);
        Route::get('panic/history', [PanicController::class, 'history']);

        // Dashboard (Autoridad+)
        Route::middleware('role:Autoridad,Administrador')->group(function () {
            Route::get('dashboard/full', [DashboardController::class, 'full']);
            Route::get('dashboard/summary', [DashboardController::class, 'summary']);
            Route::get('dashboard/statistics', [DashboardController::class, 'statistics']);
            Route::get('dashboard/crime-types', [DashboardController::class, 'crimeTypes']);
            Route::get('dashboard/reports-by-period', [DashboardController::class, 'reportsByPeriod']);
            Route::get('dashboard/zone-stats', [DashboardController::class, 'zoneStats']);
            Route::get('dashboard/reports-by-province/{regionId}', [DashboardController::class, 'reportsByProvince']);
            Route::get('dashboard/reports-by-district/{provinceId}', [DashboardController::class, 'reportsByDistrict']);
            Route::get('dashboard/evolution', [DashboardController::class, 'evolution']);
            Route::get('dashboard/critical-zones', [DashboardController::class, 'criticalZones']);
            Route::post('reports/{id}/verify', [ReportController::class, 'verify']);
            Route::post('reports/{id}/reject', [ReportController::class, 'reject']);
            Route::get('panic/active', [PanicController::class, 'active']);
            Route::post('panic/{id}/attend', [PanicController::class, 'attend']);
        });

        // Admin only
        Route::middleware('role:Administrador')->group(function () {
            Route::get('admin/users', [UserController::class, 'index']);
            Route::get('admin/users/{id}', [UserController::class, 'show']);
            Route::put('admin/users/{id}/role', [UserController::class, 'updateRole']);
            Route::post('admin/etl/import-csv', [ETLController::class, 'importCsv']);
            Route::post('admin/etl/import-api', [ETLController::class, 'importApi']);
            Route::post('admin/etl/fetch', [ETLController::class, 'fetch']);
            Route::get('admin/etl/history', [ETLController::class, 'history']);
            Route::get('admin/etl/imports/{id}', [ETLController::class, 'show']);
            Route::get('admin/settings', [SettingsController::class, 'index']);
            Route::put('admin/settings', [SettingsController::class, 'update']);
            Route::get('admin/settings/{group}', [SettingsController::class, 'getGroup']);
            // Risk zone management
            Route::get('admin/risk-zones', [RiskZoneController::class, 'index']);
            Route::post('admin/risk-zones', [RiskZoneController::class, 'store']);
            Route::get('admin/risk-zones/{id}', [RiskZoneController::class, 'show']);
            Route::put('admin/risk-zones/{id}', [RiskZoneController::class, 'update']);
            Route::delete('admin/risk-zones/{id}', [RiskZoneController::class, 'destroy']);
            Route::get('admin/risk-levels', [RiskZoneController::class, 'riskLevels']);
            // Admin report management
            Route::get('admin/reports', [\App\Controllers\Admin\ReportController::class, 'index']);
        });
    });
});
