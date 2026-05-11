<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\IptvCountry;
use App\Models\User;
use App\Models\Room;
use App\Models\Announcement;
use App\Support\IptvCatalogHealth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        $totalHotels = Hotel::count();
        $totalRooms = Room::count();
        $totalUsers = User::whereIn('role', ['manager', 'frontoffice'])->count();
        $activeHotels = Hotel::where('is_active', true)->count();
        $pairedStbs = Room::whereNotNull('stb_paired_at')->count();
        $onlineStbs = Room::where('stb_status', 'online')
            ->where('stb_last_seen_at', '>=', now()->subMinutes(10))
            ->count();
        $overdueHotels = Hotel::whereIn('payment_status', ['overdue', 'suspended'])->count();
        $monthlyRecurring = Hotel::withCount('rooms')
            ->get()
            ->sum(fn (Hotel $hotel) => $this->estimatedBillingAmount($hotel, (int) $hotel->rooms_count));

        $hotels = Hotel::withCount('rooms')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'totalHotels' => $totalHotels,
            'totalRooms' => $totalRooms,
            'totalUsers' => $totalUsers,
            'activeHotels' => $activeHotels,
            'pairedStbs' => $pairedStbs,
            'onlineStbs' => $onlineStbs,
            'overdueHotels' => $overdueHotels,
            'monthlyRecurring' => $monthlyRecurring,
            'hotels' => $hotels,
        ]);
    }

    public function hotels()
    {
        $hotels = Hotel::withCount('rooms')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Hotels', [
            'hotels' => $hotels,
        ]);
    }

    public function createHotel(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:100|unique:hotels,slug',
            'location' => 'nullable|string|max:255',
            'timezone' => 'nullable|string|max:100',
            'manager_name' => 'nullable|string|max:255',
            'manager_email' => 'nullable|email|unique:users,email',
            'manager_password' => 'nullable|string|min:6',
        ]);

        $hotel = Hotel::create([
            'name' => $data['name'],
            'slug' => $data['slug'],
            'location' => $data['location'] ?? null,
            'timezone' => $data['timezone'] ?? 'Asia/Jakarta',
            'is_active' => true,
            'tv_layout_config' => [
                'screenMode' => 'grid',
                'apps' => $this->defaultTvApps(),
            ],
        ]);

        // Seed default services
        $defaultServices = [
            ['name' => 'Room Service', 'category' => 'dining', 'is_active' => true],
            ['name' => 'Laundry', 'category' => 'laundry', 'is_active' => true],
            ['name' => 'Spa & Wellness', 'category' => 'wellness', 'is_active' => true],
            ['name' => 'Housekeeping', 'category' => 'housekeeping', 'is_active' => true],
        ];
        foreach ($defaultServices as $service) {
            \App\Models\Service::create(array_merge($service, ['hotel_id' => $hotel->id]));
        }

        // Create manager account
        if (!empty($data['manager_email']) && !empty($data['manager_password'])) {
            User::create([
                'name' => $data['manager_name'] ?? 'Hotel Manager',
                'email' => $data['manager_email'],
                'password' => Hash::make($data['manager_password']),
                'role' => 'manager',
                'hotel_id' => $hotel->id,
            ]);
        }

        return back()->with('success', "Hotel '{$hotel->name}' created successfully.");
    }

    public function toggleHotel(string $hotelId)
    {
        $hotel = Hotel::findOrFail($hotelId);
        $hotel->update(['is_active' => !$hotel->is_active]);
        return back()->with('success', 'Hotel status updated.');
    }

    public function accounts()
    {
        $users = User::with('hotel')
            ->whereIn('role', ['manager', 'frontoffice'])
            ->orderBy('created_at', 'desc')
            ->get();

        $hotels = Hotel::orderBy('name')->get(['id', 'name', 'slug']);

        return Inertia::render('Admin/Accounts', [
            'users' => $users,
            'hotels' => $hotels,
        ]);
    }

    public function createAccount(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:manager,frontoffice',
            'hotel_id' => 'required|exists:hotels,id',
        ]);

        User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
            'hotel_id' => $data['hotel_id'],
        ]);

        return back()->with('success', 'Account created successfully.');
    }

    public function toggleSuspend(string $userId)
    {
        $user = User::findOrFail($userId);
        $user->update(['is_suspended' => !$user->is_suspended]);
        return back()->with('success', 'Account status updated.');
    }

    public function announcements()
    {
        $announcements = Announcement::with('hotel')
            ->orderBy('created_at', 'desc')
            ->get();

        $hotels = Hotel::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Announcements', [
            'announcements' => $announcements,
            'hotels' => $hotels,
        ]);
    }

    public function storeAnnouncement(Request $request)
    {
        $data = $request->validate([
            'hotel_id' => 'required|exists:hotels,id',
            'text' => 'required|string|max:500',
            'is_active' => 'boolean',
        ]);

        Announcement::create($data);
        return back()->with('success', 'Announcement created.');
    }

    public function deleteAnnouncement(string $id)
    {
        Announcement::findOrFail($id)->delete();
        return back()->with('success', 'Announcement deleted.');
    }

    public function hotelDetail(string $hotelId)
    {
        $hotel = Hotel::withCount(['rooms', 'services'])->findOrFail($hotelId);
        $staff = \App\Models\User::where('hotel_id', $hotelId)
            ->whereIn('role', ['manager', 'frontoffice'])
            ->get(['id', 'name', 'email', 'role', 'is_suspended']);

        return Inertia::render('Admin/HotelDetail', [
            'hotel' => $hotel,
            'staff' => $staff,
        ]);
    }

    public function updateTvConfig(Request $request, string $hotelId)
    {
        $data = $request->validate(['screenMode' => 'required|in:grid,slideshow']);
        $hotel = Hotel::findOrFail($hotelId);
        $config = $hotel->tv_layout_config ?? [];
        $config['screenMode'] = $data['screenMode'];
        $hotel->update(['tv_layout_config' => $config]);
        return back()->with('success', 'TV config saved.');
    }

    /**
     * Same fields as Front Office → Settings; TVs read these via /api/hotel/{slug}/tv-config.
     */
    public function updateHotelWifi(Request $request, string $hotelId)
    {
        $hotel = Hotel::findOrFail($hotelId);
        $data = $request->validate([
            'wifi_ssid' => 'nullable|string|max:100',
            'wifi_username' => 'nullable|string|max:100',
            'wifi_password' => 'nullable|string|max:100',
        ]);
        $hotel->update($data);
        return back()->with('success', 'WiFi credentials saved.');
    }

    public function updateHotelIptv(Request $request, string $hotelId)
    {
        $data = $request->validate([
            'iptv_enabled' => 'required|boolean',
        ]);

        Hotel::findOrFail($hotelId)->update($data);

        return back()->with('success', $data['iptv_enabled'] ? 'IPTV enabled for this hotel.' : 'IPTV disabled for this hotel.');
    }

    public function iptv()
    {
        $countries = IptvCountry::orderBy('sort_order')->orderBy('name')->get();
        $hotels = Hotel::orderBy('name')->get(['id', 'name', 'slug', 'iptv_enabled']);

        return Inertia::render('Admin/Iptv', [
            'countries' => $countries,
            'hotels' => $hotels,
            'source' => [
                'name' => 'iptv-org/iptv',
                'url' => 'https://github.com/iptv-org/iptv',
            ],
            'iptvHealth' => IptvCatalogHealth::summary($countries),
        ]);
    }

    public function updateIptvCountry(Request $request, string $code)
    {
        $data = $request->validate([
            'is_enabled' => 'required|boolean',
        ]);

        IptvCountry::findOrFail(strtolower($code))->update($data);

        return back()->with('success', 'IPTV country availability updated.');
    }

    public function tvCanvas(string $hotelId)
    {
        $hotel = Hotel::findOrFail($hotelId);
        return Inertia::render('Admin/TvCanvas', [
            'hotel' => $hotel,
        ]);
    }

    public function saveTvCanvas(Request $request, string $hotelId)
    {
        $hotel = Hotel::findOrFail($hotelId);
        $data = $request->validate([
            'tv_layout_config' => 'required|array',
            'startup_video_url' => 'nullable|string|max:500',
        ]);

        $hotel->update([
            'tv_layout_config' => $data['tv_layout_config'],
            'startup_video_url' => $data['startup_video_url'] ?? $hotel->startup_video_url,
        ]);

        return back()->with('success', 'TV dashboard configuration saved.');
    }

    public function stbFleet()
    {
        $rooms = Room::with('hotel:id,name,slug')
            ->orderBy('stb_status')
            ->orderBy('room_code')
            ->get();

        $summary = [
            'totalRooms' => Room::count(),
            'paired' => Room::whereNotNull('stb_paired_at')->count(),
            'online' => Room::where('stb_status', 'online')->where('stb_last_seen_at', '>=', now()->subMinutes(10))->count(),
            'unpaired' => Room::where(function ($q) {
                $q->whereNull('stb_paired_at')->orWhere('stb_status', 'unpaired');
            })->count(),
        ];

        return Inertia::render('Admin/StbFleet', [
            'rooms' => $rooms,
            'summary' => $summary,
        ]);
    }

    public function updateStb(Request $request, string $roomId)
    {
        $data = $request->validate([
            'stb_status' => 'required|in:unpaired,paired,online,offline,maintenance',
            'stb_device_id' => 'nullable|string|max:100',
        ]);

        $room = Room::findOrFail($roomId);
        $room->update([
            'stb_status' => $data['stb_status'],
            'stb_device_id' => $data['stb_device_id'] ?? $room->stb_device_id,
            'stb_paired_at' => $data['stb_status'] === 'unpaired' ? null : ($room->stb_paired_at ?? now()),
            'stb_last_seen_at' => $data['stb_status'] === 'online' ? now() : $room->stb_last_seen_at,
        ]);

        return back()->with('success', 'STB status updated.');
    }

    public function billing()
    {
        $hotels = Hotel::withCount(['rooms'])
            ->orderBy('name')
            ->get()
            ->map(function (Hotel $hotel) {
                $hotel->estimated_amount = $this->estimatedBillingAmount($hotel, (int) $hotel->rooms_count);
                $hotel->paired_stbs_count = Room::where('hotel_id', $hotel->id)->whereNotNull('stb_paired_at')->count();
                return $hotel;
            });

        return Inertia::render('Admin/Billing', [
            'hotels' => $hotels,
            'summary' => [
                'mrr' => $hotels->sum('estimated_amount'),
                'trial' => $hotels->where('payment_status', 'trial')->count(),
                'active' => $hotels->where('payment_status', 'active')->count(),
                'overdue' => $hotels->whereIn('payment_status', ['overdue', 'suspended'])->count(),
            ],
        ]);
    }

    public function updateBilling(Request $request, string $hotelId)
    {
        $data = $request->validate([
            'billing_plan' => 'required|in:starter,standard,premium,enterprise',
            'billing_cycle' => 'required|in:monthly,annual',
            'billing_unit' => 'required|in:per_hotel,per_room,per_stb,hybrid',
            'billing_currency' => 'required|in:IDR,USD,SGD,AUD',
            'billing_base_price' => 'nullable|numeric|min:0',
            'billing_room_price' => 'nullable|numeric|min:0',
            'billing_stb_price' => 'nullable|numeric|min:0',
            'payment_status' => 'required|in:trial,active,overdue,suspended,cancelled',
            'next_billing_date' => 'nullable|date',
        ]);

        Hotel::findOrFail($hotelId)->update($data);

        return back()->with('success', 'Billing configuration saved.');
    }

    private function estimatedBillingAmount(Hotel $hotel, int $roomCount): float
    {
        $pairedStbs = Room::where('hotel_id', $hotel->id)->whereNotNull('stb_paired_at')->count();
        $base = (float) ($hotel->billing_base_price ?? 0);
        $roomPrice = (float) ($hotel->billing_room_price ?? 0);
        $stbPrice = (float) ($hotel->billing_stb_price ?? 0);

        $amount = match ($hotel->billing_unit ?? 'per_room') {
            'per_hotel' => $base,
            'per_stb' => $base + ($pairedStbs * $stbPrice),
            'hybrid' => $base + ($roomCount * $roomPrice) + ($pairedStbs * $stbPrice),
            default => $base + ($roomCount * $roomPrice),
        };

        return ($hotel->billing_cycle ?? 'monthly') === 'annual' ? round($amount / 12, 2) : round($amount, 2);
    }

    private function defaultTvApps(): array
    {
        return [
            ['id' => 'netflix', 'name' => 'Netflix', 'url' => 'com.netflix.ninja', 'icon' => '', 'subtitle' => 'Streaming', 'brandColor' => '#e50914', 'iconScale' => 1, 'enabled' => true, 'embeddable' => false],
            ['id' => 'youtube', 'name' => 'YouTube', 'url' => 'com.google.android.youtube.tv', 'icon' => '', 'subtitle' => 'Video', 'brandColor' => '#ff0000', 'iconScale' => 1, 'enabled' => true, 'embeddable' => false],
            ['id' => 'disney', 'name' => 'Disney+', 'url' => 'com.disney.disneyplus', 'icon' => '', 'subtitle' => 'Streaming', 'brandColor' => '#113ccf', 'iconScale' => 1, 'enabled' => true, 'embeddable' => false],
            ['id' => 'prime', 'name' => 'Prime Video', 'url' => 'com.amazon.amazonvideo.livingroom', 'icon' => '', 'subtitle' => 'Streaming', 'brandColor' => '#00a8e1', 'iconScale' => 1, 'enabled' => true, 'embeddable' => false],
            ['id' => 'spotify', 'name' => 'Spotify', 'url' => 'com.spotify.tv.android', 'icon' => '', 'subtitle' => 'Music', 'brandColor' => '#1db954', 'iconScale' => 1, 'enabled' => true, 'embeddable' => false],
        ];
    }
}
