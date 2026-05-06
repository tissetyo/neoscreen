<?php

namespace App\Http\Middleware;

use App\Models\Room;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRoomSession
{
    public function handle(Request $request, Closure $next): Response
    {
        $roomId = $request->route('roomId');
        $room = $roomId ? Room::find($roomId) : null;

        if (!$room || !$room->room_session_token) {
            return response()->json(['error' => 'Room session required'], 401);
        }

        $token = $request->bearerToken()
            ?: $request->header('X-Room-Token')
            ?: $request->cookie($this->cookieName($room->id));

        if (!$token || !hash_equals($room->room_session_token, $token)) {
            return response()->json(['error' => 'Invalid room session'], 401);
        }

        $request->attributes->set('room', $room);

        return $next($request);
    }

    public static function cookieName(string $roomId): string
    {
        return 'neotiv_room_session';
    }
}
