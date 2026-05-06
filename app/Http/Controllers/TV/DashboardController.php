<?php

namespace App\Http\Controllers\TV;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\Room;
use App\Http\Middleware\EnsureRoomSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Render the main TV dashboard page (Grid or Slideshow mode).
     * This is the primary page loaded by the STB WebView.
     */
    public function show(string $slug, string $code): Response|RedirectResponse
    {
        $hotel = Hotel::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $room = Room::where('hotel_id', $hotel->id)
            ->where('room_code', $code)
            ->with('roomType')
            ->firstOrFail();

        $token = request()->cookie(EnsureRoomSession::cookieName($room->id));
        if (!$room->room_session_token || !$token || !hash_equals($room->room_session_token, $token)) {
            return redirect("/d/{$slug}/{$code}");
        }

        $promos = $hotel->promos()
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('end_date')
                  ->orWhere('end_date', '>=', now());
            })
            ->get();

        $services = $hotel->services()
            ->where('is_active', true)
            ->with('options')
            ->get();

        $announcements = $hotel->announcements()
            ->where('is_active', true)
            ->pluck('text');

        $notifications = collect([]);
        if ($room->id !== 'preview-' . $code) {
            $notifications = $room->notifications()
                ->where('is_read', false)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
        }

        $tvConfig = $hotel->tv_layout_config ?? [];

        return Inertia::render('TV/Dashboard', [
            'hotel' => $hotel,
            'room' => $room,
            'promos' => $promos,
            'services' => $services,
            'announcements' => $announcements,
            'notifications' => $notifications,
            'screenMode' => $tvConfig['screenMode'] ?? 'grid',
            'slideshowConfig' => $tvConfig['slideshow'] ?? null,
        ]);
    }

    /**
     * Preview mode — render the dashboard for admin without needing a room code.
     * Uses room 101 if it exists, otherwise creates a mock room.
     */
    public function preview(string $slug): Response
    {
        $hotel = Hotel::where('slug', $slug)->firstOrFail();
        $user = Auth::user();
        if ($user && !$user->isSuperAdmin() && $user->hotel_id !== $hotel->id) {
            abort(403, 'Unauthorized hotel preview.');
        }

        // Try to find any room, fall back to mock
        $room = Room::where('hotel_id', $hotel->id)->first();

        if (!$room) {
            $room = new Room([
                'room_code' => '101',
                'guest_name' => 'Preview Mode',
                'guest_photo_url' => null,
                'background_url' => null,
                'checkout_date' => null,
                'is_occupied' => false,
            ]);
            $room->id = 'preview-101';
        }

        $promos = $hotel->promos()->where('is_active', true)->get();
        $services = $hotel->services()->where('is_active', true)->with('options')->get();
        $announcements = $hotel->announcements()->where('is_active', true)->pluck('text');
        $tvConfig = $hotel->tv_layout_config ?? [];

        return Inertia::render('TV/Dashboard', [
            'hotel' => $hotel,
            'room' => $room,
            'promos' => $promos,
            'services' => $services,
            'announcements' => $announcements,
            'notifications' => [],
            'screenMode' => $tvConfig['screenMode'] ?? 'grid',
            'slideshowConfig' => $tvConfig['slideshow'] ?? null,
        ]);
    }
}
