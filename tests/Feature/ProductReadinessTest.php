<?php

namespace Tests\Feature;

use App\Models\Hotel;
use App\Models\IptvCountry;
use App\Models\Room;
use App\Models\Service;
use App\Models\ServiceOption;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ProductReadinessTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_cannot_access_another_hotels_frontoffice(): void
    {
        $hotelA = Hotel::create(['name' => 'A Hotel', 'slug' => 'a-hotel', 'timezone' => 'Asia/Jakarta', 'is_active' => true]);
        $hotelB = Hotel::create(['name' => 'B Hotel', 'slug' => 'b-hotel', 'timezone' => 'Asia/Jakarta', 'is_active' => true]);

        $user = User::create([
            'name' => 'Front Desk',
            'email' => 'front@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'frontoffice',
            'hotel_id' => $hotelA->id,
        ]);

        $this->actingAs($user)
            ->get("/{$hotelB->slug}/frontoffice")
            ->assertForbidden();
    }

    public function test_frontoffice_cannot_access_manager_settings(): void
    {
        $hotel = Hotel::create(['name' => 'A Hotel', 'slug' => 'a-hotel', 'timezone' => 'Asia/Jakarta', 'is_active' => true]);

        $user = User::create([
            'name' => 'Front Desk',
            'email' => 'front@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'frontoffice',
            'hotel_id' => $hotel->id,
        ]);

        $this->actingAs($user)
            ->get("/{$hotel->slug}/frontoffice/settings")
            ->assertForbidden();
    }

    public function test_room_api_requires_valid_room_session_cookie(): void
    {
        $hotel = Hotel::create(['name' => 'A Hotel', 'slug' => 'a-hotel', 'timezone' => 'Asia/Jakarta', 'is_active' => true]);
        $room = Room::create([
            'hotel_id' => $hotel->id,
            'room_code' => '101',
            'pin' => '1234',
            'room_session_token' => 'room-token',
            'is_occupied' => true,
        ]);

        $this->getJson("/api/room/{$room->id}/status")
            ->assertUnauthorized();

        $this->withHeader('X-Room-Token', 'room-token')
            ->getJson("/api/room/{$room->id}/status")
            ->assertOk()
            ->assertJsonPath('roomDetails.room_code', '101');
    }

    public function test_room_login_sets_room_session_cookie(): void
    {
        $hotel = Hotel::create(['name' => 'A Hotel', 'slug' => 'a-hotel', 'timezone' => 'Asia/Jakarta', 'is_active' => true]);
        $room = Room::create([
            'hotel_id' => $hotel->id,
            'room_code' => '101',
            'pin' => '1234',
            'is_occupied' => true,
        ]);

        $response = $this->postJson('/api/room/login', [
            'hotel_slug' => $hotel->slug,
            'room_code' => $room->room_code,
            'pin' => '1234',
        ]);

        $response->assertOk();
        $this->assertNotNull($room->fresh()->room_session_token);
        $response->assertCookie('neotiv_room_session');
    }

    public function test_portal_and_guides_are_reachable_from_product_surfaces(): void
    {
        $hotel = Hotel::create(['name' => 'A Hotel', 'slug' => 'a-hotel', 'timezone' => 'Asia/Jakarta', 'is_active' => true]);
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'superadmin',
        ]);
        $manager = User::create([
            'name' => 'Manager',
            'email' => 'manager@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'manager',
            'hotel_id' => $hotel->id,
        ]);

        $this->get('/portal')->assertOk();

        $this->actingAs($admin)
            ->get('/admin/guide')
            ->assertOk();

        $this->actingAs($manager)
            ->get("/{$hotel->slug}/frontoffice/guide")
            ->assertOk();
    }

    public function test_superadmin_login_persists_session_and_opens_admin_dashboard(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'superadmin',
        ]);

        $this->post('/login', [
            'email' => 'admin@example.com',
            'password' => 'secret123',
        ])->assertRedirect('/admin');

        $this->assertTrue(Auth::check());

        $this->get('/admin')
            ->assertOk();
    }

    public function test_sessions_table_uses_uuid_compatible_user_id(): void
    {
        $userIdColumn = collect(Schema::getColumns('sessions'))
            ->firstWhere('name', 'user_id');

        $this->assertNotNull($userIdColumn);
        $this->assertStringContainsString('char', strtolower($userIdColumn['type_name'] ?? $userIdColumn['type'] ?? ''));
    }

    public function test_superadmin_can_save_canvas_with_tiny_responsive_widget_layouts(): void
    {
        $hotel = Hotel::create(['name' => 'A Hotel', 'slug' => 'a-hotel', 'timezone' => 'Asia/Jakarta', 'is_active' => true]);
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'superadmin',
        ]);

        $layout = [
            'wifiCard' => ['colStart' => 1, 'rowStart' => 1, 'colSpan' => 2, 'rowSpan' => 2, 'visible' => true],
            'guestCard' => ['colStart' => 3, 'rowStart' => 1, 'colSpan' => 4, 'rowSpan' => 2, 'visible' => true],
            'hotelService' => ['colStart' => 7, 'rowStart' => 1, 'colSpan' => 1, 'rowSpan' => 1, 'visible' => true],
        ];

        $this->actingAs($admin)
            ->put("/admin/hotels/{$hotel->id}/tv-canvas", [
                'tv_layout_config' => [
                    'screenMode' => 'grid',
                    'theme' => ['visualStyle' => 'luxury', 'focusColor' => '#d4af37'],
                    'layout' => $layout,
                ],
            ])
            ->assertRedirect();

        $hotel->refresh();
        $this->assertSame(2, $hotel->tv_layout_config['layout']['wifiCard']['colSpan']);
        $this->assertSame(1, $hotel->tv_layout_config['layout']['hotelService']['colSpan']);
    }

    public function test_stb_pairing_connects_staff_room_selection_to_tv_polling(): void
    {
        $hotel = Hotel::create(['name' => 'A Hotel', 'slug' => 'a-hotel', 'timezone' => 'Asia/Jakarta', 'is_active' => true]);
        $room = Room::create([
            'hotel_id' => $hotel->id,
            'room_code' => '101',
            'pin' => '1234',
            'is_occupied' => true,
        ]);
        $manager = User::create([
            'name' => 'Manager',
            'email' => 'manager@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'manager',
            'hotel_id' => $hotel->id,
        ]);

        $code = $this->postJson('/api/stb/generate-code')
            ->assertOk()
            ->json('code');

        $this->actingAs($manager)
            ->postJson('/api/stb/pair', [
                'code' => $code,
                'hotelSlug' => $hotel->slug,
                'roomCode' => $room->room_code,
            ])
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->getJson("/api/stb/poll?code={$code}")
            ->assertOk()
            ->assertJsonPath('status', 'paired')
            ->assertJsonPath('hotel_slug', $hotel->slug)
            ->assertJsonPath('room_code', '101');
    }

    public function test_mobile_portal_session_can_chat_and_create_service_request(): void
    {
        $hotel = Hotel::create(['name' => 'A Hotel', 'slug' => 'a-hotel', 'timezone' => 'Asia/Jakarta', 'is_active' => true]);
        $room = Room::create([
            'hotel_id' => $hotel->id,
            'room_code' => '101',
            'pin' => '1234',
            'room_session_token' => 'room-token',
            'guest_name' => 'Guest One',
            'is_occupied' => true,
        ]);
        $service = Service::create([
            'hotel_id' => $hotel->id,
            'name' => 'Room Service',
            'category' => 'dining',
            'is_active' => true,
        ]);
        ServiceOption::create(['service_id' => $service->id, 'name' => 'Water', 'price' => 3]);

        $sessionId = $this->withHeader('X-Room-Token', 'room-token')
            ->postJson("/api/room/{$room->id}/mobile-session")
            ->assertCreated()
            ->json('sessionId');

        $this->get("/{$hotel->slug}/mobile/{$sessionId}")
            ->assertOk();

        $this->getJson("/api/hotel/{$hotel->slug}/services")
            ->assertOk()
            ->assertJsonPath('services.0.name', 'Room Service');

        $this->postJson("/api/mobile/{$sessionId}/chat", [
            'message' => 'Hello front desk',
        ])->assertCreated()
            ->assertJsonPath('message.sender', 'guest');

        $this->postJson("/api/mobile/{$sessionId}/service-request", [
            'service_id' => $service->id,
            'items' => [['name' => 'Water', 'quantity' => 2, 'price' => 3]],
            'notes' => 'Please send cold water.',
            'total_price' => 6,
        ])->assertCreated()
            ->assertJsonPath('service_request.status', 'pending');

        $this->assertDatabaseHas('service_requests', [
            'room_id' => $room->id,
            'hotel_id' => $hotel->id,
            'service_id' => $service->id,
            'status' => 'pending',
        ]);
    }

    public function test_frontoffice_can_acknowledge_and_complete_mobile_service_request(): void
    {
        $hotel = Hotel::create(['name' => 'A Hotel', 'slug' => 'a-hotel', 'timezone' => 'Asia/Jakarta', 'is_active' => true]);
        $room = Room::create([
            'hotel_id' => $hotel->id,
            'room_code' => '101',
            'pin' => '1234',
            'is_occupied' => true,
        ]);
        $service = Service::create([
            'hotel_id' => $hotel->id,
            'name' => 'Room Service',
            'category' => 'dining',
            'is_active' => true,
        ]);
        $request = ServiceRequest::create([
            'room_id' => $room->id,
            'hotel_id' => $hotel->id,
            'service_id' => $service->id,
            'items' => [['name' => 'Water', 'quantity' => 1]],
            'status' => 'pending',
        ]);
        $frontoffice = User::create([
            'name' => 'Front Desk',
            'email' => 'front@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'frontoffice',
            'hotel_id' => $hotel->id,
        ]);

        $this->actingAs($frontoffice)
            ->patch("/{$hotel->slug}/frontoffice/requests/{$request->id}/acknowledge")
            ->assertRedirect();

        $this->assertNotNull($request->fresh()->staff_acknowledged_at);

        $this->actingAs($frontoffice)
            ->patch("/{$hotel->slug}/frontoffice/requests/{$request->id}", ['status' => 'completed'])
            ->assertRedirect();

        $this->assertSame('completed', $request->fresh()->status);
    }

    public function test_superadmin_can_manage_billing_models_and_stb_fleet(): void
    {
        $hotel = Hotel::create(['name' => 'A Hotel', 'slug' => 'a-hotel', 'timezone' => 'Asia/Jakarta', 'is_active' => true]);
        $room = Room::create([
            'hotel_id' => $hotel->id,
            'room_code' => '101',
            'pin' => '1234',
            'is_occupied' => true,
            'stb_device_id' => 'PAIR-123456',
            'stb_status' => 'paired',
            'stb_paired_at' => now(),
        ]);
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'superadmin',
        ]);

        $this->actingAs($admin)->get('/admin/stb-fleet')->assertOk();
        $this->actingAs($admin)->get('/admin/billing')->assertOk();

        $this->actingAs($admin)
            ->patch("/admin/stb-fleet/{$room->id}", [
                'stb_status' => 'maintenance',
                'stb_device_id' => 'PAIR-123456',
            ])
            ->assertRedirect();

        $this->assertSame('maintenance', $room->fresh()->stb_status);

        $this->actingAs($admin)
            ->patch("/admin/billing/{$hotel->id}", [
                'billing_plan' => 'premium',
                'billing_cycle' => 'annual',
                'billing_unit' => 'hybrid',
                'billing_currency' => 'IDR',
                'billing_base_price' => 12000000,
                'billing_room_price' => 150000,
                'billing_stb_price' => 75000,
                'payment_status' => 'active',
                'next_billing_date' => now()->addMonth()->toDateString(),
            ])
            ->assertRedirect();

        $hotel->refresh();
        $this->assertSame('premium', $hotel->billing_plan);
        $this->assertSame('hybrid', $hotel->billing_unit);
        $this->assertSame('active', $hotel->payment_status);
    }

    public function test_iptv_room_api_uses_default_and_guest_origin_countries(): void
    {
        $hotel = Hotel::create([
            'name' => 'A Hotel',
            'slug' => 'a-hotel',
            'timezone' => 'Asia/Jakarta',
            'is_active' => true,
            'iptv_enabled' => true,
        ]);
        $room = Room::create([
            'hotel_id' => $hotel->id,
            'room_code' => '101',
            'pin' => '1234',
            'room_session_token' => 'room-token',
            'guest_name' => 'John Smith',
            'guest_country_code' => 'th',
            'is_occupied' => true,
        ]);

        foreach ([
            ['id', 'Indonesia', 1],
            ['us', 'United States', 2],
            ['int', 'International', 3],
            ['th', 'Thailand', 4],
        ] as [$code, $name, $sort]) {
            IptvCountry::updateOrCreate(['code' => $code], [
                'name' => $name,
                'region' => 'Default',
                'playlist_url' => "https://iptv-org.github.io/iptv/countries/{$code}.m3u",
                'is_enabled' => true,
                'sort_order' => $sort,
            ]);
        }

        Http::fake([
            'https://iptv-org.github.io/iptv/countries/id.m3u' => Http::response("#EXTM3U\n#EXTINF:-1 tvg-logo=\"https://example.test/id.png\" group-title=\"General\",Bali TV\nhttps://example.test/id.m3u8\n"),
            'https://iptv-org.github.io/iptv/countries/us.m3u' => Http::response("#EXTM3U\n#EXTINF:-1 group-title=\"News\",US News\nhttps://example.test/us.m3u8\n"),
            'https://iptv-org.github.io/iptv/countries/int.m3u' => Http::response("#EXTM3U\n#EXTINF:-1 group-title=\"Global\",World Feed\nhttps://example.test/int.m3u8\n"),
            'https://iptv-org.github.io/iptv/countries/th.m3u' => Http::response("#EXTM3U\n#EXTINF:-1 group-title=\"General\",Thai Live\nhttps://example.test/th.m3u8\n"),
        ]);

        $this->withHeader('X-Room-Token', 'room-token')
            ->getJson("/api/room/{$room->id}/iptv?hotelId={$hotel->id}")
            ->assertOk()
            ->assertJsonPath('enabled', true)
            ->assertJsonPath('defaultCountryCodes.0', 'id')
            ->assertJsonPath('defaultCountryCodes.1', 'us')
            ->assertJsonPath('defaultCountryCodes.2', 'int')
            ->assertJsonPath('defaultCountryCodes.3', 'th')
            ->assertJsonPath('channels.0.name', 'Bali TV')
            ->assertJsonPath('channels.3.countryName', 'Thailand');
    }

    public function test_iptv_is_hidden_from_room_api_when_hotel_disables_it(): void
    {
        $hotel = Hotel::create([
            'name' => 'A Hotel',
            'slug' => 'a-hotel',
            'timezone' => 'Asia/Jakarta',
            'is_active' => true,
            'iptv_enabled' => false,
        ]);
        $room = Room::create([
            'hotel_id' => $hotel->id,
            'room_code' => '101',
            'pin' => '1234',
            'room_session_token' => 'room-token',
            'is_occupied' => true,
        ]);

        $this->withHeader('X-Room-Token', 'room-token')
            ->getJson("/api/room/{$room->id}/iptv?hotelId={$hotel->id}")
            ->assertOk()
            ->assertJsonPath('enabled', false)
            ->assertJsonCount(0, 'countries')
            ->assertJsonCount(0, 'channels');
    }

    public function test_superadmin_can_toggle_hotel_iptv_and_country_catalog(): void
    {
        $hotel = Hotel::create([
            'name' => 'A Hotel',
            'slug' => 'a-hotel',
            'timezone' => 'Asia/Jakarta',
            'is_active' => true,
            'iptv_enabled' => false,
        ]);
        $country = IptvCountry::updateOrCreate(['code' => 'th'], [
            'name' => 'Thailand',
            'region' => 'Southeast Asia',
            'playlist_url' => 'https://iptv-org.github.io/iptv/countries/th.m3u',
            'is_enabled' => true,
            'sort_order' => 10,
        ]);
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'superadmin',
        ]);

        $this->actingAs($admin)
            ->patch("/admin/hotels/{$hotel->id}/iptv", ['iptv_enabled' => true])
            ->assertRedirect();

        $this->actingAs($admin)
            ->patch("/admin/iptv/countries/{$country->code}", ['is_enabled' => false])
            ->assertRedirect();

        $this->assertTrue($hotel->fresh()->iptv_enabled);
        $this->assertFalse($country->fresh()->is_enabled);
    }
}
