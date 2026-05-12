<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TV\SplashController;
use App\Http\Controllers\TV\DashboardController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Staff\FrontOfficeController;
use App\Http\Controllers\Staff\ServicesController;
use App\Http\Controllers\Staff\SettingsController;
use App\Http\Controllers\Staff\OnboardingController;
use App\Http\Controllers\Staff\GuideController as StaffGuideController;
use App\Http\Controllers\Staff\TeamController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\GuideController as AdminGuideController;
use App\Http\Controllers\Mobile\PortalController as MobilePortalController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () { return inertia('Welcome'); });
Route::get('/portal', function () { return inertia('Welcome'); })->name('portal');
Route::get('/launcher', function () { return inertia('Launcher'); })->name('launcher');

// TV Routes — `/d/{slug}/preview` must be registered before `/d/{slug}/{code}` or "preview" is treated as a room code
Route::get('/d/{slug}/preview', [DashboardController::class, 'preview'])->middleware('auth');
Route::get('/d/{slug}/{code}', [SplashController::class, 'show']);
Route::get('/d/{slug}/{code}/main', [DashboardController::class, 'show']);
Route::get('/setup-stb', fn() => inertia('TV/SetupSTB'));

Route::get('/{slug}/mobile/{sessionId}', [MobilePortalController::class, 'home'])->name('mobile.home');
Route::get('/{slug}/mobile/{sessionId}/services', [MobilePortalController::class, 'services'])->name('mobile.services');
Route::get('/{slug}/mobile/{sessionId}/chat', [MobilePortalController::class, 'chat'])->name('mobile.chat');


// Auth
Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

Route::middleware(['auth'])->group(function () {

    // ── Front Office (frontoffice + manager) ─────────────────────────────
    Route::prefix('{slug}/frontoffice')->middleware(['role:frontoffice,manager', 'hotel.access'])->name('staff.')->group(function () {

        // Dashboard
        Route::get('/', [FrontOfficeController::class, 'home'])->name('home');

        // Onboarding & help
        Route::get('/onboarding', [OnboardingController::class, 'show'])->name('onboarding');
        Route::patch('/onboarding/dismiss', [OnboardingController::class, 'dismiss'])->name('onboarding.dismiss');
        Route::patch('/onboarding/step', [OnboardingController::class, 'markStep'])->name('onboarding.step');
        Route::get('/guide', [StaffGuideController::class, 'frontOffice'])->name('guide');

        // Rooms
        Route::get('/rooms', [FrontOfficeController::class, 'rooms'])->name('rooms');
        Route::post('/rooms', [FrontOfficeController::class, 'storeRoom'])->name('rooms.store');
        Route::put('/rooms/{roomId}', [FrontOfficeController::class, 'updateRoom'])->name('rooms.update');
        Route::delete('/rooms/{roomId}', [FrontOfficeController::class, 'deleteRoom'])->name('rooms.delete');
        Route::get('/stb', [FrontOfficeController::class, 'stb'])->name('stb');
        Route::get('/iptv', [FrontOfficeController::class, 'iptv'])->name('iptv');

        // Chat
        Route::get('/chat', [FrontOfficeController::class, 'chat'])->name('chat');
        Route::get('/chat/{roomId}/messages', [FrontOfficeController::class, 'getChatMessages'])->name('chat.messages');
        Route::post('/chat/{roomId}/messages', [FrontOfficeController::class, 'sendChatMessage'])->name('chat.send');

        // Notifications
        Route::get('/notifications', [FrontOfficeController::class, 'notifications'])->name('notifications');
        Route::post('/notifications', [FrontOfficeController::class, 'sendNotification'])->name('notifications.send');
        Route::patch('/notifications/{notifId}/acknowledge', [FrontOfficeController::class, 'acknowledgeNotification'])->name('notifications.acknowledge');
        Route::delete('/notifications/{notifId}', [FrontOfficeController::class, 'deleteNotification'])->name('notifications.delete');

        // Alarms
        Route::get('/alarms', [FrontOfficeController::class, 'alarms'])->name('alarms');
        Route::patch('/alarms/{alarmId}/acknowledge', [FrontOfficeController::class, 'acknowledgeAlarm'])->name('alarms.acknowledge');

        // Service Requests
        Route::get('/requests', [FrontOfficeController::class, 'serviceRequests'])->name('requests');
        Route::patch('/requests/{requestId}/acknowledge', [FrontOfficeController::class, 'acknowledgeServiceRequest'])->name('requests.acknowledge');
        Route::patch('/requests/{requestId}', [FrontOfficeController::class, 'updateServiceRequest'])->name('requests.update');

        // Promos
        Route::get('/promos', [FrontOfficeController::class, 'promos'])->name('promos');
        Route::post('/promos', [FrontOfficeController::class, 'storePromo'])->name('promos.store');
        Route::patch('/promos/{promoId}/toggle', [FrontOfficeController::class, 'togglePromo'])->name('promos.toggle');
        Route::delete('/promos/{promoId}', [FrontOfficeController::class, 'deletePromo'])->name('promos.delete');

        Route::middleware('role:manager')->group(function () {
            // Services (Manager only)
            Route::get('/services', [ServicesController::class, 'index'])->name('services');
            Route::post('/services', [ServicesController::class, 'store'])->name('services.store');
            Route::delete('/services/{serviceId}', [ServicesController::class, 'destroy'])->name('services.delete');
            Route::post('/services/{serviceId}/options', [ServicesController::class, 'storeOption'])->name('services.options.store');
            Route::delete('/services/{serviceId}/options/{optionId}', [ServicesController::class, 'destroyOption'])->name('services.options.delete');

            // Settings (Manager only)
            Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
            Route::patch('/settings', [SettingsController::class, 'update'])->name('settings.update');
            Route::patch('/settings/tv', [SettingsController::class, 'updateTv'])->name('settings.tv');
            Route::post('/settings/media', [SettingsController::class, 'storeMedia'])->name('settings.media.store');
            Route::patch('/settings/media/{mediaId}', [SettingsController::class, 'updateMedia'])->name('settings.media.update');
            Route::delete('/settings/media/{mediaId}', [SettingsController::class, 'deleteMedia'])->name('settings.media.delete');
            Route::post('/settings/announcements', [SettingsController::class, 'addAnnouncement'])->name('settings.announcements.store');
            Route::delete('/settings/announcements/{id}', [SettingsController::class, 'deleteAnnouncement'])->name('settings.announcements.delete');
            Route::get('/team', [TeamController::class, 'index'])->name('team');
            Route::post('/team', [TeamController::class, 'store'])->name('team.store');
            Route::patch('/team/{userId}/suspend', [TeamController::class, 'toggleSuspend'])->name('team.suspend');
        });

        // Analytics
        Route::get('/analytics', [FrontOfficeController::class, 'analytics'])->name('analytics');
    });

    // ── Super Admin ───────────────────────────────────────────────────────
    Route::prefix('admin')->middleware('role:superadmin')->name('admin.')->group(function () {
        Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');
        Route::get('/guide', [AdminGuideController::class, 'show'])->name('guide');

        // Hotels
        Route::get('/hotels', [AdminController::class, 'hotels'])->name('hotels');
        Route::post('/hotels', [AdminController::class, 'createHotel'])->name('hotels.store');
        Route::get('/hotels/{hotelId}', [AdminController::class, 'hotelDetail'])->name('hotels.show');
        Route::patch('/hotels/{hotelId}/toggle', [AdminController::class, 'toggleHotel'])->name('hotels.toggle');
        Route::patch('/hotels/{hotelId}/tv-config', [AdminController::class, 'updateTvConfig'])->name('hotels.tv-config');
        Route::patch('/hotels/{hotelId}/wifi', [AdminController::class, 'updateHotelWifi'])->name('hotels.wifi');
        Route::patch('/hotels/{hotelId}/iptv', [AdminController::class, 'updateHotelIptv'])->name('hotels.iptv');
        Route::get('/hotels/{hotelId}/tv-canvas', [AdminController::class, 'tvCanvas'])->name('hotels.tv-canvas');
        Route::put('/hotels/{hotelId}/tv-canvas', [AdminController::class, 'saveTvCanvas'])->name('hotels.tv-canvas.save');
        Route::get('/stb-fleet', [AdminController::class, 'stbFleet'])->name('stb-fleet');
        Route::patch('/stb-fleet/{roomId}', [AdminController::class, 'updateStb'])->name('stb-fleet.update');
        Route::get('/billing', [AdminController::class, 'billing'])->name('billing');
        Route::patch('/billing/{hotelId}', [AdminController::class, 'updateBilling'])->name('billing.update');

        // Accounts
        Route::get('/accounts', [AdminController::class, 'accounts'])->name('accounts');
        Route::post('/accounts', [AdminController::class, 'createAccount'])->name('accounts.store');
        Route::patch('/accounts/{userId}/suspend', [AdminController::class, 'toggleSuspend'])->name('accounts.suspend');

        // Announcements
        Route::get('/announcements', [AdminController::class, 'announcements'])->name('announcements');
        Route::post('/announcements', [AdminController::class, 'storeAnnouncement'])->name('announcements.store');
        Route::delete('/announcements/{id}', [AdminController::class, 'deleteAnnouncement'])->name('announcements.delete');
        Route::get('/iptv', [AdminController::class, 'iptv'])->name('iptv');
        Route::patch('/iptv/countries/{code}', [AdminController::class, 'updateIptvCountry'])->name('iptv.countries.update');
    });
});
