<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TV\RoomLoginController;
use App\Http\Controllers\TV\RoomStatusController;
use App\Http\Controllers\TV\TVConfigController;
use App\Http\Controllers\TV\STBController;
use App\Http\Controllers\TV\ChatController;
use App\Http\Controllers\TV\AlarmController;
use App\Http\Controllers\TV\ServiceRequestController;
use App\Http\Controllers\TV\MobileSessionController;
use App\Http\Controllers\TV\CheckoutController;
use App\Http\Controllers\Mobile\PortalApiController;
use App\Http\Controllers\UploadController;

/*
|--------------------------------------------------------------------------
| API Routes — Stateless JSON endpoints
|--------------------------------------------------------------------------
| Used by STB for polling, chat, alarms, and service requests.
*/

// Room authentication (PIN login)
Route::post('/room/login', [RoomLoginController::class, 'login'])->middleware('throttle:10,1');

// Room status (polled every 60s by STB)
Route::middleware(['room.session', 'throttle:120,1'])->prefix('/room/{roomId}')->group(function () {
    Route::get('/status', [RoomStatusController::class, 'show']);
    Route::get('/chat', [ChatController::class, 'index']);
    Route::post('/chat', [ChatController::class, 'store']);
    Route::get('/alarm', [AlarmController::class, 'index']);
    Route::post('/alarm', [AlarmController::class, 'store']);
    Route::delete('/alarm/{alarmId}', [AlarmController::class, 'destroy']);
    Route::patch('/alarm/{alarmId}/toggle', [AlarmController::class, 'toggle']);
    Route::get('/notifications', [App\Http\Controllers\TV\NotificationController::class, 'index']);
    Route::get('/service-requests', [ServiceRequestController::class, 'index']);
    Route::post('/service-request', [ServiceRequestController::class, 'store']);
    Route::patch('/service-request/{serviceRequestId}/guest-ack', [ServiceRequestController::class, 'guestAcknowledge']);
    Route::post('/mobile-session', [MobileSessionController::class, 'store']);
    Route::post('/checkout', [CheckoutController::class, 'store']);
});

// Hotel TV config
Route::get('/hotel/{slug}/tv-config', [TVConfigController::class, 'show']);

// STB pairing flow
Route::post('/stb/generate-code', [STBController::class, 'generateCode'])->middleware('throttle:20,1');
Route::post('/stb/pair', [STBController::class, 'pair'])->middleware(['web', 'auth', 'throttle:20,1']);
Route::get('/stb/poll', [STBController::class, 'poll'])->middleware('throttle:60,1');

Route::get('/hotel/{slug}/services', [PortalApiController::class, 'services'])->middleware('throttle:120,1');
Route::get('/services/{serviceId}/options', [PortalApiController::class, 'serviceOptions'])->middleware('throttle:120,1');
Route::get('/mobile/{sessionId}/chat', [PortalApiController::class, 'chat'])->middleware('throttle:120,1');
Route::post('/mobile/{sessionId}/chat', [PortalApiController::class, 'sendChat'])->middleware('throttle:60,1');
Route::post('/mobile/{sessionId}/service-request', [PortalApiController::class, 'storeServiceRequest'])->middleware('throttle:30,1');

// File uploads
Route::post('/upload/{type}', [UploadController::class, 'store'])->middleware(['web', 'auth', 'throttle:30,1']);

// Weather proxy
Route::get('/weather', function (\Illuminate\Http\Request $request) {
    $lat = $request->query('lat');
    $lon = $request->query('lon');
    $key = config('services.openweather.key');
    if (!$key || !$lat || !$lon) {
        return response()->json(['error' => 'Missing params'], 400);
    }
    $response = \Illuminate\Support\Facades\Http::get(
        "https://api.openweathermap.org/data/2.5/weather?lat={$lat}&lon={$lon}&appid={$key}&units=metric"
    );
    return response()->json($response->json());
});

// Flights proxy
Route::get('/flights', function (\Illuminate\Http\Request $request) {
    $iata = $request->query('iata');
    $key = config('services.aviationstack.key');
    if (!$key || !$iata) {
        return response()->json(['error' => 'Missing params'], 400);
    }
    $response = \Illuminate\Support\Facades\Http::get(
        "http://api.aviationstack.com/v1/flights?access_key={$key}&arr_iata={$iata}&limit=10"
    );
    return response()->json($response->json());
});
