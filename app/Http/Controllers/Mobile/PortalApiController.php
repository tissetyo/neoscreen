<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\Hotel;
use App\Models\MobileSession;
use App\Models\Service;
use App\Models\ServiceOption;
use App\Models\ServiceRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortalApiController extends Controller
{
    public function services(string $slug): JsonResponse
    {
        $hotel = Hotel::where('slug', $slug)->where('is_active', true)->firstOrFail();

        $services = Service::where('hotel_id', $hotel->id)
            ->where('is_active', true)
            ->with('options')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json(['services' => $services]);
    }

    public function serviceOptions(string $serviceId): JsonResponse
    {
        $options = ServiceOption::where('service_id', $serviceId)
            ->orderBy('name')
            ->get();

        return response()->json(['options' => $options]);
    }

    public function chat(string $sessionId): JsonResponse
    {
        $session = $this->validSession($sessionId);
        $room = $session->room;

        $messages = $room->chatMessages()
            ->orderBy('created_at')
            ->limit(100)
            ->get();

        ChatMessage::where('room_id', $room->id)
            ->where('sender', 'staff')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['messages' => $messages]);
    }

    public function sendChat(Request $request, string $sessionId): JsonResponse
    {
        $data = $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $session = $this->validSession($sessionId);

        $message = ChatMessage::create([
            'room_id' => $session->room_id,
            'sender' => 'guest',
            'message' => $data['message'],
            'is_read' => false,
        ]);

        return response()->json(['message' => $message], 201);
    }

    public function storeServiceRequest(Request $request, string $sessionId): JsonResponse
    {
        $data = $request->validate([
            'service_id' => 'required|string',
            'items' => 'required|array|min:1',
            'notes' => 'nullable|string|max:500',
            'total_price' => 'nullable|numeric|min:0',
        ]);

        $session = $this->validSession($sessionId);
        $room = $session->room;

        $service = Service::where('hotel_id', $room->hotel_id)
            ->where('id', $data['service_id'])
            ->firstOrFail();

        $serviceRequest = ServiceRequest::create([
            'room_id' => $room->id,
            'hotel_id' => $room->hotel_id,
            'service_id' => $service->id,
            'items' => $data['items'],
            'notes' => $data['notes'] ?? null,
            'total_price' => $data['total_price'] ?? null,
            'status' => 'pending',
        ]);

        $summary = collect($data['items'])
            ->map(fn ($item) => '- ' . ($item['quantity'] ?? 1) . 'x ' . ($item['name'] ?? 'Item'))
            ->join("\n");

        ChatMessage::create([
            'room_id' => $room->id,
            'sender' => 'guest',
            'message' => "New service request: {$service->name}\n\n{$summary}",
            'is_read' => false,
        ]);

        return response()->json(['service_request' => $serviceRequest], 201);
    }

    private function validSession(string $sessionId): MobileSession
    {
        $session = MobileSession::with('room.hotel')
            ->where('session_id', $sessionId)
            ->first();

        if (!$session || $session->isExpired()) {
            abort(404, 'Mobile session not found or expired.');
        }

        return $session;
    }
}
