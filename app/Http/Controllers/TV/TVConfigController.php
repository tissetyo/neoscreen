<?php

namespace App\Http\Controllers\TV;

use App\Http\Controllers\Controller;
use App\Http\Middleware\EnsureRoomSession;
use App\Models\Hotel;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TVConfigController extends Controller
{
    /**
     * Get TV configuration for a hotel.
     * Polled by STB to check for config updates.
     */
    public function show(Request $request, string $slug): JsonResponse
    {
        $hotel = Hotel::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$hotel) {
            return response()->json(['error' => 'Hotel not found'], 404);
        }

        $roomId = $request->query('roomId');
        $room = $roomId ? Room::where('hotel_id', $hotel->id)->find($roomId) : null;
        if (!$room || !$room->room_session_token) {
            return response()->json(['error' => 'Room session required'], 401);
        }

        $token = $request->bearerToken()
            ?: $request->header('X-Room-Token')
            ?: $request->cookie(EnsureRoomSession::cookieName($room->id));

        if (!$token || !hash_equals($room->room_session_token, $token)) {
            return response()->json(['error' => 'Invalid room session'], 401);
        }

        // Get active promos
        $promos = $hotel->promos()
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('end_date')
                  ->orWhere('end_date', '>=', now());
            })
            ->get();

        // Get active services
        $services = $hotel->services()
            ->where('is_active', true)
            ->with('options')
            ->get();

        // Get active announcements
        $announcements = $hotel->announcements()
            ->where('is_active', true)
            ->get();

        return response()->json([
            'hotel' => [
                'id' => $hotel->id,
                'name' => $hotel->name,
                'slug' => $hotel->slug,
                'location' => $hotel->location,
                'timezone' => $hotel->timezone,
                'wifi_ssid' => $hotel->wifi_ssid,
                'wifi_password' => $hotel->wifi_password,
                'wifi_username' => $hotel->wifi_username,
                'default_background_url' => $hotel->default_background_url,
                'featured_image_url' => $hotel->featured_image_url,
                'startup_video_url' => $hotel->startup_video_url,
                'airport_iata_code' => $hotel->airport_iata_code,
                'latitude' => $hotel->latitude,
                'longitude' => $hotel->longitude,
                'clock_timezone_1' => $hotel->clock_timezone_1,
                'clock_timezone_2' => $hotel->clock_timezone_2,
                'clock_timezone_3' => $hotel->clock_timezone_3,
                'clock_label_1' => $hotel->clock_label_1,
                'clock_label_2' => $hotel->clock_label_2,
                'clock_label_3' => $hotel->clock_label_3,
                'tv_layout_config' => $hotel->tv_layout_config,
            ],
            'tvLayoutConfig' => $hotel->tv_layout_config,
            'featuredImageUrl' => $hotel->featured_image_url,
            'promos' => $promos,
            'services' => $services,
            'announcements' => $announcements,
        ]);
    }
}
