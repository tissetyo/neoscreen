<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    private function getHotel(string $slug): Hotel
    {
        return Hotel::where('slug', $slug)->firstOrFail();
    }

    public function index(string $slug)
    {
        $hotel = $this->getHotel($slug);
        $announcements = Announcement::where('hotel_id', $hotel->id)
            ->orderBy('created_at', 'desc')
            ->get(['id', 'text', 'is_active']);

        return Inertia::render('Staff/Settings', [
            'slug' => $slug,
            'hotel' => $hotel,
            'announcements' => $announcements,
        ]);
    }

    public function update(Request $request, string $slug)
    {
        $hotel = $this->getHotel($slug);
        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'timezone' => 'nullable|string|max:100',
            'airport_iata_code' => 'nullable|string|max:10',
            'wifi_ssid' => 'nullable|string|max:100',
            'wifi_password' => 'nullable|string|max:100',
            'wifi_username' => 'nullable|string|max:100',
            'clock_label_1' => 'nullable|string|max:50',
            'clock_timezone_1' => 'nullable|string|max:100',
            'clock_label_2' => 'nullable|string|max:50',
            'clock_timezone_2' => 'nullable|string|max:100',
            'clock_label_3' => 'nullable|string|max:50',
            'clock_timezone_3' => 'nullable|string|max:100',
        ]);

        $hotel->update($data);
        return back()->with('success', 'Settings saved.');
    }

    public function updateTv(Request $request, string $slug)
    {
        $hotel = $this->getHotel($slug);
        $data = $request->validate(['screenMode' => 'required|in:grid,slideshow']);

        $config = $hotel->tv_layout_config ?? [];
        $config['screenMode'] = $data['screenMode'];
        $hotel->update(['tv_layout_config' => $config]);

        return back()->with('success', 'TV settings saved.');
    }

    public function addAnnouncement(Request $request, string $slug)
    {
        $hotel = $this->getHotel($slug);
        $data = $request->validate(['text' => 'required|string|max:500']);

        Announcement::create(['hotel_id' => $hotel->id, 'text' => $data['text'], 'is_active' => true]);
        return back()->with('success', 'Announcement added.');
    }

    public function deleteAnnouncement(string $slug, string $id)
    {
        $hotel = $this->getHotel($slug);
        Announcement::where('hotel_id', $hotel->id)->findOrFail($id)->delete();
        return back()->with('success', 'Announcement deleted.');
    }
}
