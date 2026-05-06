<?php

namespace App\Http\Controllers\TV;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use App\Models\Room;
use App\Models\ChatMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceRequestController extends Controller
{
    /**
     * Create a service request from the TV dashboard.
     */
    public function store(Request $request, string $roomId): JsonResponse
    {
        $request->validate([
            'service_id' => 'nullable|string',
            'items' => 'nullable|array',
            'notes' => 'nullable|string|max:500',
            'total_price' => 'nullable|numeric|min:0',
        ]);

        $room = $request->attributes->get('room') ?: Room::findOrFail($roomId);

        if ($request->service_id) {
            $exists = \App\Models\Service::where('hotel_id', $room->hotel_id)
                ->where('id', $request->service_id)
                ->exists();
            if (!$exists) {
                return response()->json(['error' => 'Invalid service for this room'], 422);
            }
        }

        $serviceRequest = ServiceRequest::create([
            'room_id' => $room->id,
            'hotel_id' => $room->hotel_id,
            'service_id' => $request->service_id,
            'items' => $request->items,
            'notes' => $request->notes,
            'total_price' => $request->total_price,
            'status' => 'pending',
        ]);

        $summary = collect($request->items ?? [])
            ->map(fn ($item) => '- ' . ($item['quantity'] ?? 1) . 'x ' . ($item['name'] ?? 'Item'))
            ->join("\n");

        if ($summary) {
            ChatMessage::create([
                'room_id' => $room->id,
                'sender' => 'guest',
                'message' => "New service request\n\n{$summary}",
                'is_read' => false,
            ]);
        }

        return response()->json(['service_request' => $serviceRequest], 201);
    }

    /**
     * Get service requests for a room.
     */
    public function index(string $roomId): JsonResponse
    {
        $room = request()->attributes->get('room') ?: Room::findOrFail($roomId);
        $requests = ServiceRequest::where('room_id', $room->id)
            ->with('service')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        return response()->json(['service_requests' => $requests]);
    }

    /**
     * Guest confirms on TV that a completed order was received (trust / SLA signal).
     */
    public function guestAcknowledge(string $roomId, string $serviceRequestId): JsonResponse
    {
        $room = request()->attributes->get('room') ?: Room::findOrFail($roomId);

        $serviceRequest = ServiceRequest::where('room_id', $room->id)
            ->where('id', $serviceRequestId)
            ->firstOrFail();

        if ($serviceRequest->status !== 'completed') {
            return response()->json(['error' => 'Only completed requests can be acknowledged by the guest'], 422);
        }

        $serviceRequest->update(['guest_acknowledged_at' => now()]);

        return response()->json(['service_request' => $serviceRequest->fresh()]);
    }
}
