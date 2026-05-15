<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\Announcement;
use App\Models\HotelMedia;
use App\Models\Room;
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
            'rooms' => Room::where('hotel_id', $hotel->id)
                ->orderBy('room_code')
                ->get(['id', 'room_code', 'guest_name']),
            'mediaItems' => HotelMedia::where('hotel_id', $hotel->id)
                ->orderBy('sort_order')
                ->orderBy('created_at', 'desc')
                ->get(),
        ]);
    }

    public function update(Request $request, string $slug)
    {
        $hotel = $this->getHotel($slug);
	        $data = $request->validate([
	            'name' => 'nullable|string|max:255',
	            'location' => 'nullable|string|max:255',
	            'logo_url' => 'nullable|string|max:1000',
	            'description' => 'nullable|string|max:2000',
	            'website_url' => 'nullable|string|max:500',
	            'phone' => 'nullable|string|max:80',
	            'email' => 'nullable|email|max:255',
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

	        if (array_key_exists('logo_url', $data)) {
	            $config = $hotel->tv_layout_config ?? [];
	            $config['theme'] = array_merge($config['theme'] ?? [], [
	                'logoUrl' => $data['logo_url'],
	                'showLogo' => !empty($data['logo_url']),
	            ]);
	            $config['layout'] = array_merge($config['layout'] ?? [], [
	                'brandLogo' => array_merge($config['layout']['brandLogo'] ?? [], [
	                    'visible' => !empty($data['logo_url']),
	                    'followGlobalStyle' => false,
	                    'bgOpacity' => 0,
	                ]),
	            ]);
	            $data['tv_layout_config'] = $config;
	        }

	        $hotel->update($data);
	        return back()->with('success', 'Settings saved.');
	    }

    public function updateTv(Request $request, string $slug)
    {
        $hotel = $this->getHotel($slug);
        $data = $request->validate([
            'screenMode' => 'required|in:grid,slideshow',
            'slideshow' => 'nullable|array',
            'slideshow.autoAdvanceSeconds' => 'nullable|integer|min:5|max:120',
            'slideshow.widgetDismissSeconds' => 'nullable|integer|min:3|max:60',
            'slideshow.transition' => 'nullable|string|in:crossfade,slide,zoom',
            'slideshow.showFloatingClock' => 'nullable|boolean',
            'startup_video_url' => 'nullable|string|max:1000',
        ]);

        $config = $hotel->tv_layout_config ?? [];
        $config['screenMode'] = $data['screenMode'];
        if (isset($data['slideshow'])) {
            $config['slideshow'] = array_merge($config['slideshow'] ?? [], $data['slideshow']);
        }

        $hotel->update([
            'tv_layout_config' => $config,
            'startup_video_url' => $data['startup_video_url'] ?? $hotel->startup_video_url,
        ]);

        return back()->with('success', 'TV settings saved.');
    }

    public function storeMedia(Request $request, string $slug)
    {
        $hotel = $this->getHotel($slug);
        $data = $this->validateMedia($request, $hotel);

        HotelMedia::create([
            ...$data,
            'hotel_id' => $hotel->id,
        ]);

        return back()->with('success', 'Media added.');
    }

    public function updateMedia(Request $request, string $slug, string $mediaId)
    {
        $hotel = $this->getHotel($slug);
        $media = HotelMedia::where('hotel_id', $hotel->id)->findOrFail($mediaId);
        $media->update($this->validateMedia($request, $hotel));

        return back()->with('success', 'Media updated.');
    }

    public function deleteMedia(string $slug, string $mediaId)
    {
        $hotel = $this->getHotel($slug);
        HotelMedia::where('hotel_id', $hotel->id)->findOrFail($mediaId)->delete();

        return back()->with('success', 'Media deleted.');
    }

    private function validateMedia(Request $request, Hotel $hotel): array
    {
        $roomIds = Room::where('hotel_id', $hotel->id)->pluck('id')->all();

        return $request->validate([
            'title' => 'nullable|string|max:255',
            'type' => 'required|in:image,video',
            'url' => 'required|string|max:1000',
            'source_type' => 'required|in:upload,youtube,url',
            'room_ids' => 'nullable|array',
            'room_ids.*' => ['string', 'in:' . implode(',', $roomIds)],
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'is_slideshow' => 'boolean',
            'sort_order' => 'nullable|integer|min:0|max:10000',
        ]);
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
