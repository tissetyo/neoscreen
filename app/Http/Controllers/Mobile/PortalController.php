<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Models\MobileSession;
use App\Models\Service;
use Inertia\Inertia;
use Inertia\Response;

class PortalController extends Controller
{
    public function home(string $slug, string $sessionId): Response
    {
        $session = $this->validSession($slug, $sessionId);

        return Inertia::render('Mobile/Home', [
            'session' => $this->sessionPayload($session),
        ]);
    }

    public function services(string $slug, string $sessionId): Response
    {
        $session = $this->validSession($slug, $sessionId);
        $hotel = $session->room->hotel;

        $services = Service::where('hotel_id', $hotel->id)
            ->where('is_active', true)
            ->with('options')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Mobile/Services', [
            'session' => $this->sessionPayload($session),
            'services' => $services,
        ]);
    }

    public function chat(string $slug, string $sessionId): Response
    {
        $session = $this->validSession($slug, $sessionId);

        return Inertia::render('Mobile/Chat', [
            'session' => $this->sessionPayload($session),
        ]);
    }

    private function validSession(string $slug, string $sessionId): MobileSession
    {
        $session = MobileSession::with(['room.hotel'])
            ->where('session_id', $sessionId)
            ->first();

        if (!$session || $session->isExpired() || $session->room->hotel->slug !== $slug) {
            abort(404, 'Mobile session not found or expired.');
        }

        return $session;
    }

    private function sessionPayload(MobileSession $session): array
    {
        $room = $session->room;
        $hotel = $room->hotel;

        return [
            'id' => $session->session_id,
            'expires_at' => $session->expires_at?->toIso8601String(),
            'room' => [
                'id' => $room->id,
                'room_code' => $room->room_code,
                'guest_name' => $room->guest_name,
            ],
            'hotel' => [
                'id' => $hotel->id,
                'slug' => $hotel->slug,
                'name' => $hotel->name,
                'location' => $hotel->location,
                'wifi_ssid' => $hotel->wifi_ssid,
                'wifi_password' => $hotel->wifi_password,
                'wifi_username' => $hotel->wifi_username,
                'featured_image_url' => $hotel->featured_image_url,
            ],
        ];
    }
}
