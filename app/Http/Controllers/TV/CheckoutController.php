<?php

namespace App\Http\Controllers\TV;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    public function store(Request $request, string $roomId): JsonResponse
    {
        $data = $request->validate([
            'pin' => 'required|string',
        ]);

        $room = $request->attributes->get('room') ?: Room::findOrFail($roomId);

        if ($room->pin !== $data['pin']) {
            return response()->json(['error' => 'Invalid PIN'], 401);
        }

        $room->update([
            'guest_name' => null,
            'guest_photo_url' => null,
            'custom_welcome_message' => null,
            'checkin_date' => null,
            'checkout_date' => null,
            'is_occupied' => false,
        ]);

        return response()->json(['room' => $room->fresh()]);
    }
}
