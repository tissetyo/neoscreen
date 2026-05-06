<?php

namespace App\Http\Controllers\TV;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    /**
     * Get chat messages for a room.
     */
    public function index(string $roomId): JsonResponse
    {
        $room = request()->attributes->get('room') ?: Room::findOrFail($roomId);

        $messages = $room->chatMessages()
            ->orderBy('created_at', 'asc')
            ->limit(100)
            ->get();

        // Mark staff messages as read (guest is viewing)
        ChatMessage::where('room_id', $roomId)
            ->where('sender', 'staff')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['messages' => $messages]);
    }

    /**
     * Send a chat message from guest.
     */
    public function store(Request $request, string $roomId): JsonResponse
    {
        $request->validate(['message' => 'required|string|max:1000']);

        $room = $request->attributes->get('room') ?: Room::findOrFail($roomId);

        $message = ChatMessage::create([
            'room_id' => $room->id,
            'sender' => 'guest',
            'message' => $request->message,
        ]);

        return response()->json(['message' => $message], 201);
    }
}
