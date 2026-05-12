<?php

namespace App\Http\Controllers\TV;

use App\Http\Controllers\Controller;
use App\Models\StbPairingCode;
use App\Models\Hotel;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class STBController extends Controller
{
    /**
     * Generate a 6-digit pairing code for STB setup.
     * Called when STB first boots and shows pairing screen.
     */
    public function generateCode(): JsonResponse
    {
        // Clean up expired codes
        StbPairingCode::where('expires_at', '<', now())->delete();

        // Generate unique 6-digit code
        do {
            $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        } while (StbPairingCode::where('code', $code)->exists());

        $pairing = StbPairingCode::create([
            'code' => $code,
            'expires_at' => now()->addMinutes(10),
        ]);

        return response()->json([
            'code' => $pairing->code,
            'expires_at' => $pairing->expires_at->toISOString(),
        ]);
    }

    /**
     * Pair an STB with a hotel room.
     * Called from admin/staff panel when entering the pairing code.
     */
    public function pair(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
            'hotel_slug' => 'required_without:hotelSlug|string',
            'hotelSlug' => 'required_without:hotel_slug|string',
            'room_code' => 'required_without:roomCode|string',
            'roomCode' => 'required_without:room_code|string',
        ]);

        $hotelSlug = $request->input('hotel_slug', $request->input('hotelSlug'));
        $roomCode = $request->input('room_code', $request->input('roomCode'));

        $hotel = Hotel::where('slug', $hotelSlug)->where('is_active', true)->firstOrFail();
        $user = Auth::user();
        if (!$user || (!$user->isSuperAdmin() && $user->hotel_id !== $hotel->id)) {
            return response()->json(['error' => 'Unauthorized hotel access'], 403);
        }

        $room = Room::where('hotel_id', $hotel->id)->where('room_code', $roomCode)->first();
        if (!$room) {
            return response()->json(['error' => 'Room not found'], 404);
        }

        if (!$room->room_session_token) {
            $room->forceFill(['room_session_token' => Str::random(64)])->save();
        }

        $pairing = StbPairingCode::where('code', $request->code)
            ->where('is_paired', false)
            ->first();

        if (!$pairing) {
            return response()->json(['error' => 'Invalid pairing code'], 404);
        }

        if ($pairing->isExpired()) {
            $pairing->delete();
            return response()->json(['error' => 'Pairing code expired'], 410);
        }

        $pairing->update([
            'hotel_id' => $hotel->id,
            'hotel_slug' => $hotel->slug,
            'room_code' => $room->room_code,
            'is_paired' => true,
        ]);

        $room->update([
            'stb_device_id' => 'PAIR-' . $pairing->code,
            'stb_status' => 'paired',
            'stb_paired_at' => now(),
            'stb_last_seen_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }

    /**
     * Poll for pairing status.
     * Called by STB every 3s to check if admin has entered the code.
     */
    public function poll(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string']);

        $pairing = StbPairingCode::where('code', $request->code)->first();

        if (!$pairing) {
            return response()->json(['status' => 'not_found'], 404);
        }

        if ($pairing->isExpired()) {
            $pairing->delete();
            return response()->json(['status' => 'expired'], 410);
        }

        if ($pairing->is_paired) {
            Room::where('hotel_id', $pairing->hotel_id)
                ->where('room_code', $pairing->room_code)
                ->update([
                    'stb_status' => 'online',
                    'stb_last_seen_at' => now(),
                ]);

            $room = Room::where('hotel_id', $pairing->hotel_id)
                ->where('room_code', $pairing->room_code)
                ->first();

            return response()->json([
                'status' => 'paired',
                'hotel_slug' => $pairing->hotel_slug,
                'room_code' => $pairing->room_code,
                'room_session_token' => $room?->room_session_token,
            ]);
        }

        return response()->json(['status' => 'waiting']);
    }
}
