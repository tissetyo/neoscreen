<?php

namespace App\Http\Controllers\TV;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Room;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    /**
     * Get notifications for a room.
     */
    public function index(string $roomId): JsonResponse
    {
        $room = request()->attributes->get('room') ?: Room::findOrFail($roomId);

        $notifications = Notification::where('hotel_id', $room->hotel_id)
            ->where(function ($query) use ($roomId) {
                $query->where('room_id', $roomId)
                      ->orWhereNull('room_id');
            })
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        return response()->json(['notifications' => $notifications]);
    }
}
