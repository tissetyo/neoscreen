<?php

namespace App\Http\Controllers\TV;

use App\Http\Controllers\Controller;
use App\Models\MobileSession;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MobileSessionController extends Controller
{
    /**
     * Create or retrieve a mobile session for a TV room
     */
    public function store(Request $request, string $roomId): JsonResponse
    {
        $room = $request->attributes->get('room') ?: Room::findOrFail($roomId);

        // First clean up expired sessions for this room
        MobileSession::where('room_id', $room->id)
            ->where('expires_at', '<', now())
            ->delete();

        // Get an existing valid session, or create a new one
        $session = MobileSession::where('room_id', $room->id)
            ->where('expires_at', '>', now())
            ->first();

        if (!$session) {
            $session = MobileSession::create([
                'room_id' => $room->id,
                'session_id' => Str::uuid()->toString(),
                'guest_name' => $room->guest_name,
                'expires_at' => now()->addHours(24), // Session lives for 24 hours
            ]);
        }

        return response()->json([
            'sessionId' => $session->session_id,
            'expiresAt' => $session->expires_at,
        ], 201);
    }
}
