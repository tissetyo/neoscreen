<?php

namespace App\Http\Controllers\TV;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\Room;
use Inertia\Inertia;
use Inertia\Response;

class SplashController extends Controller
{
    /**
     * Render the splash/welcome screen.
     * Shows startup video → PIN entry → welcome message.
     */
    public function show(string $slug, string $code): Response
    {
        $hotel = Hotel::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $room = Room::where('hotel_id', $hotel->id)
            ->where('room_code', $code)
            ->firstOrFail();

        return Inertia::render('TV/Splash', [
            'hotel' => [
                'name' => $hotel->name,
                'slug' => $hotel->slug,
                'startup_video_url' => $hotel->startup_video_url,
                'featured_image_url' => $hotel->featured_image_url,
                'default_background_url' => $hotel->default_background_url,
            ],
            'room' => [
                'code' => $room->room_code,
                'guest_name' => $room->guest_name,
                'is_occupied' => $room->is_occupied,
            ],
        ]);
    }
}
