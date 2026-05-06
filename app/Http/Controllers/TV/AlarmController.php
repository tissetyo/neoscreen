<?php

namespace App\Http\Controllers\TV;

use App\Http\Controllers\Controller;
use App\Models\Alarm;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlarmController extends Controller
{
    /**
     * Get alarms for a room.
     */
    public function index(string $roomId): JsonResponse
    {
        $room = request()->attributes->get('room') ?: Room::findOrFail($roomId);
        $alarms = Alarm::where('room_id', $room->id)
            ->orderBy('alarm_time', 'asc')
            ->get();

        return response()->json(['alarms' => $alarms]);
    }

    /**
     * Create or update an alarm.
     */
    public function store(Request $request, string $roomId): JsonResponse
    {
        $request->validate([
            'alarm_time' => 'required|date_format:H:i',
            'is_active' => 'boolean',
        ]);

        $room = $request->attributes->get('room') ?: Room::findOrFail($roomId);
        $alarm = Alarm::create([
            'room_id' => $room->id,
            'alarm_time' => $request->alarm_time,
            'is_active' => $request->input('is_active', true),
        ]);

        return response()->json(['alarm' => $alarm], 201);
    }

    /**
     * Delete an alarm.
     */
    public function destroy(string $roomId, string $alarmId): JsonResponse
    {
        $room = request()->attributes->get('room') ?: Room::findOrFail($roomId);
        Alarm::where('id', $alarmId)
            ->where('room_id', $room->id)
            ->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Toggle alarm active status.
     */
    public function toggle(string $roomId, string $alarmId): JsonResponse
    {
        $room = request()->attributes->get('room') ?: Room::findOrFail($roomId);
        $alarm = Alarm::where('id', $alarmId)
            ->where('room_id', $room->id)
            ->firstOrFail();

        $alarm->update(['is_active' => !$alarm->is_active]);

        return response()->json(['alarm' => $alarm]);
    }
}
