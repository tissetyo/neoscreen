<?php

namespace App\Http\Controllers\TV;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;

class RoomStatusController extends Controller
{
    /**
     * Get current room status.
     * Polled by STB every 60s to check for updates.
     */
    public function show(string $roomId): JsonResponse
    {
        $authorizedRoom = request()->attributes->get('room');
        $room = Room::with(['hotel', 'roomType'])->find($authorizedRoom?->id ?? $roomId);

        if (!$room) {
            return response()->json(['error' => 'Room not found'], 404);
        }

        // Latest unread notification (since we want to show it on screen)
        $latestNotification = Notification::where('hotel_id', $room->hotel_id)
            ->where(function ($q) use ($roomId) {
                $q->where('room_id', $roomId)
                  ->orWhereNull('room_id');
            })
            ->where('is_read', false)
            ->latest()
            ->first();

        // Unread chat messages
        $unreadMessages = $room->chatMessages()
            ->where('sender', 'staff')
            ->where('is_read', false)
            ->count();

        // Active alarms
        $activeAlarms = $room->alarms()
            ->where('is_active', true)
            ->get();

        // Pending service requests
        $pendingRequests = $room->serviceRequests()
            ->whereIn('status', ['pending', 'confirmed'])
            ->count();

        return response()->json([
            'roomDetails' => [
                'id' => $room->id,
                'room_code' => $room->room_code,
                'guest_name' => $room->guest_name,
                'is_occupied' => $room->is_occupied,
                'checkout_date' => $room->checkout_date?->format('Y-m-d'),
                'is_checkout_day' => $room->is_checkout_day,
                'background_url' => $room->background_url,
                'custom_welcome_message' => $room->custom_welcome_message,
                'guest_photo_url' => $room->guest_photo_url,
            ],
            'latestNotification' => $latestNotification,
            'unreadChatCount' => $unreadMessages,
            'active_alarms' => $activeAlarms,
            'pending_service_requests' => $pendingRequests,
        ]);
    }
}
