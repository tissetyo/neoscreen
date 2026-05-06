<?php

namespace App\Http\Controllers\TV;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\Room;
use App\Http\Middleware\EnsureRoomSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RoomLoginController extends Controller
{
    /**
     * Authenticate a room via PIN code.
     * Called by STB after pairing to enter the dashboard.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'hotel_slug' => 'required|string',
            'room_code' => 'required|string',
            'pin' => 'required|string',
        ]);

        $hotel = Hotel::where('slug', $request->hotel_slug)
            ->where('is_active', true)
            ->first();

        if (!$hotel) {
            return response()->json(['error' => 'Hotel not found'], 404);
        }

        $room = Room::where('hotel_id', $hotel->id)
            ->where('room_code', $request->room_code)
            ->first();

        if (!$room) {
            return response()->json(['error' => 'Room not found'], 404);
        }

        if ($room->pin !== $request->pin) {
            return response()->json(['error' => 'Invalid PIN'], 401);
        }

        if (!$room->room_session_token) {
            $room->forceFill(['room_session_token' => Str::random(64)])->save();
        }

        // Return room + hotel data for the TV dashboard
        return response()->json([
            'success' => true,
            'room' => [
                'id' => $room->id,
                'room_code' => $room->room_code,
                'guest_name' => $room->guest_name,
                'guest_photo_url' => $room->guest_photo_url,
                'background_url' => $room->background_url,
                'checkout_date' => $room->checkout_date?->format('Y-m-d'),
                'custom_welcome_message' => $room->custom_welcome_message,
                'is_occupied' => $room->is_occupied,
                'room_type' => $room->roomType?->name,
                'room_session_token' => $room->room_session_token,
            ],
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
        ])->withCookie(cookie(
            EnsureRoomSession::cookieName($room->id),
            $room->room_session_token,
            60 * 24 * 30,
            '/',
            null,
            $request->isSecure(),
            true,
            false,
            'Lax'
        ));
    }
}
