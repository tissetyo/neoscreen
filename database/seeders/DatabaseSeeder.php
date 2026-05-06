<?php

namespace Database\Seeders;

use App\Models\Hotel;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\User;
use App\Models\Service;
use App\Models\ServiceOption;
use App\Models\Promo;
use App\Models\Announcement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Super Admin ─────────────────────────────
        $admin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@neoscreen.site',
            'password' => Hash::make('admin123'),
            'role' => 'superadmin',
        ]);

        // ─── Demo Hotel ──────────────────────────────
        $hotel = Hotel::create([
            'name' => 'Grand Neoscreen Hotel',
            'slug' => 'grand-neoscreen',
            'location' => 'Jakarta, Indonesia',
            'timezone' => 'Asia/Jakarta',
            'wifi_ssid' => 'GrandNeo_Guest',
            'wifi_password' => 'welcome2024',
            'airport_iata_code' => 'CGK',
            'latitude' => -6.2088,
            'longitude' => 106.8456,
            'clock_timezone_1' => 'America/New_York',
            'clock_timezone_2' => 'Europe/London',
            'clock_timezone_3' => 'Asia/Tokyo',
            'clock_label_1' => 'New York',
            'clock_label_2' => 'London',
            'clock_label_3' => 'Tokyo',
            'default_background_url' => 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1920&auto=format&fit=crop',
            'featured_image_url' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1920&auto=format&fit=crop',
            'billing_plan' => 'premium',
            'billing_cycle' => 'monthly',
            'billing_unit' => 'hybrid',
            'billing_currency' => 'IDR',
            'billing_base_price' => 2500000,
            'billing_room_price' => 175000,
            'billing_stb_price' => 85000,
            'payment_status' => 'active',
            'next_billing_date' => now()->addMonth()->toDateString(),
            'tv_layout_config' => [
                'screenMode' => 'grid',
                'slideshow' => [
                    'autoAdvanceSeconds' => 10,
                    'widgetDismissSeconds' => 10,
                    'transition' => 'crossfade',
                    'images' => [
                        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1920&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1920&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1920&auto=format&fit=crop'
                    ],
                    'showFloatingClock' => true,
                ],
                'theme' => [
                    'bgUrl' => 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1920&auto=format&fit=crop',
                    'focusColor' => '#d4af37',
                ]
            ],
            'is_active' => true,
        ]);

        // ─── Staff for demo hotel ────────────────────
        $manager = User::create([
            'name' => 'Hotel Manager',
            'email' => 'manager@grand-neoscreen.com',
            'password' => Hash::make('manager123'),
            'role' => 'manager',
            'hotel_id' => $hotel->id,
        ]);

        $frontoffice = User::create([
            'name' => 'Front Office',
            'email' => 'fo@grand-neoscreen.com',
            'password' => Hash::make('staff123'),
            'role' => 'frontoffice',
            'hotel_id' => $hotel->id,
        ]);

        // ─── Room Types ──────────────────────────────
        $deluxe = RoomType::create([
            'hotel_id' => $hotel->id,
            'name' => 'Deluxe Room',
            'description' => 'Spacious room with city view',
        ]);

        $suite = RoomType::create([
            'hotel_id' => $hotel->id,
            'name' => 'Executive Suite',
            'description' => 'Premium suite with living area',
        ]);

        // ─── Sample Rooms ────────────────────────────
        $rooms = [
            ['code' => '101', 'pin' => '1234', 'type' => $deluxe, 'guest' => 'John Smith', 'occupied' => true],
            ['code' => '102', 'pin' => '5678', 'type' => $deluxe, 'guest' => null, 'occupied' => false],
            ['code' => '201', 'pin' => '1111', 'type' => $suite, 'guest' => 'Sarah Johnson', 'occupied' => true],
            ['code' => '202', 'pin' => '2222', 'type' => $suite, 'guest' => null, 'occupied' => false],
            ['code' => '301', 'pin' => '3333', 'type' => $deluxe, 'guest' => 'Mike Chen', 'occupied' => true],
        ];

        foreach ($rooms as $index => $r) {
            Room::create([
                'hotel_id' => $hotel->id,
                'room_code' => $r['code'],
                'pin' => $r['pin'],
                'room_type_id' => $r['type']->id,
                'guest_name' => $r['guest'],
                'is_occupied' => $r['occupied'],
                'checkout_date' => $r['occupied'] ? now()->addDays(rand(1, 5))->format('Y-m-d') : null,
                'stb_device_id' => $index < 3 ? 'STB-GRAND-' . $r['code'] : null,
                'stb_status' => $index === 0 ? 'online' : ($index < 3 ? 'paired' : 'unpaired'),
                'stb_paired_at' => $index < 3 ? now()->subDays(7 - $index) : null,
                'stb_last_seen_at' => $index === 0 ? now()->subMinutes(2) : ($index < 3 ? now()->subHours($index) : null),
            ]);
        }

        // ─── Services ────────────────────────────────
        $roomService = Service::create([
            'hotel_id' => $hotel->id,
            'name' => 'Room Service',
            'description' => 'Order food and beverages to your room',
            'category' => 'dining',
            'is_active' => true,
        ]);

        ServiceOption::create(['service_id' => $roomService->id, 'name' => 'Club Sandwich', 'price' => 15.00]);
        ServiceOption::create(['service_id' => $roomService->id, 'name' => 'Caesar Salad', 'price' => 12.00]);
        ServiceOption::create(['service_id' => $roomService->id, 'name' => 'Mineral Water', 'price' => 3.00]);

        $housekeeping = Service::create([
            'hotel_id' => $hotel->id,
            'name' => 'Housekeeping',
            'description' => 'Room cleaning and supplies',
            'category' => 'housekeeping',
            'is_active' => true,
        ]);

        ServiceOption::create(['service_id' => $housekeeping->id, 'name' => 'Extra Towels', 'price' => 0]);
        ServiceOption::create(['service_id' => $housekeeping->id, 'name' => 'Extra Pillows', 'price' => 0]);
        ServiceOption::create(['service_id' => $housekeeping->id, 'name' => 'Room Cleaning', 'price' => 0]);

        Service::create([
            'hotel_id' => $hotel->id,
            'name' => 'Laundry',
            'description' => 'Express laundry and dry cleaning',
            'category' => 'laundry',
            'price' => 10.00,
            'is_active' => true,
        ]);

        Service::create([
            'hotel_id' => $hotel->id,
            'name' => 'Spa & Wellness',
            'description' => 'Book massage and spa treatments',
            'category' => 'wellness',
            'price' => 50.00,
            'is_active' => true,
        ]);

        // ─── Promos ──────────────────────────────────
        Promo::create([
            'hotel_id' => $hotel->id,
            'title' => 'Weekend Brunch Special',
            'description' => 'Enjoy 20% off our signature brunch every weekend',
            'is_active' => true,
            'start_date' => now()->subDays(7),
            'end_date' => now()->addDays(30),
        ]);

        Promo::create([
            'hotel_id' => $hotel->id,
            'title' => 'Spa Package Deal',
            'description' => 'Book 2 treatments, get 1 free',
            'is_active' => true,
            'start_date' => now(),
            'end_date' => now()->addDays(60),
        ]);

        // ─── Announcements ───────────────────────────
        Announcement::create([
            'hotel_id' => $hotel->id,
            'text' => 'Welcome to Grand Neoscreen Hotel! Pool hours: 7AM - 10PM. Breakfast served at Restaurant Aura, Floor 2.',
            'is_active' => true,
        ]);

        Announcement::create([
            'hotel_id' => $hotel->id,
            'text' => 'Free yoga class every morning at 6:30 AM at the rooftop garden.',
            'is_active' => true,
        ]);
    }
}
