<?php

namespace App\Http\Controllers;

use App\Models\Alarm;
use App\Models\Hotel;
use App\Models\IptvChannelOverride;
use App\Models\IptvCountry;
use App\Models\MobileSession;
use App\Models\Promo;
use App\Models\Room;
use App\Models\Service;
use App\Models\ServiceOption;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DemoController extends Controller
{
    private const STORAGE_PATH = 'demo/pitch.json';

    public function show(): Response
    {
        $countryPacks = $this->countRows(IptvCountry::class);
        $enabledCountryPacks = $this->hasColumn(IptvCountry::class, 'is_enabled')
            ? $this->countWhere(IptvCountry::class, fn ($query) => $query->where('is_enabled', true))
            : $countryPacks;
        $channelsPerCountry = 25;
        $sessionChannelLimit = 125;

        $facts = [
            'hotelCount' => $this->countRows(Hotel::class),
            'roomCount' => $this->countRows(Room::class),
            'occupiedRooms' => $this->hasColumn(Room::class, 'is_occupied')
                ? $this->countWhere(Room::class, fn ($query) => $query->where('is_occupied', true))
                : 0,
            'pairedStbs' => $this->hasColumn(Room::class, 'stb_status')
                ? $this->countWhere(Room::class, fn ($query) => $query->whereIn('stb_status', ['paired', 'online', 'offline', 'maintenance']))
                : 0,
            'onlineStbs' => $this->hasColumn(Room::class, 'stb_status')
                ? $this->countWhere(Room::class, fn ($query) => $query->where('stb_status', 'online'))
                : 0,
            'frontOfficeUsers' => $this->hasColumn(User::class, 'role')
                ? $this->countWhere(User::class, fn ($query) => $query->whereIn('role', ['frontoffice', 'manager']))
                : 0,
            'countryPacks' => $countryPacks,
            'enabledCountryPacks' => $enabledCountryPacks,
            'channelsPerCountry' => $channelsPerCountry,
            'configuredChannelSlots' => $enabledCountryPacks * $channelsPerCountry,
            'sessionChannelLimit' => $sessionChannelLimit,
            'trackedChannelHealth' => $this->countRows(IptvChannelOverride::class),
            'hiddenChannelOverrides' => $this->hasColumn(IptvChannelOverride::class, 'is_available')
                ? $this->countWhere(IptvChannelOverride::class, fn ($query) => $query->where('is_available', false))
                : 0,
            'serviceCount' => $this->countRows(Service::class),
            'serviceOptionCount' => $this->countRows(ServiceOption::class),
            'serviceRequestCount' => $this->countRows(ServiceRequest::class),
            'activePromos' => $this->hasColumn(Promo::class, 'is_active')
                ? $this->countWhere(Promo::class, fn ($query) => $query->where('is_active', true))
                : 0,
            'activeAlarms' => $this->hasColumn(Alarm::class, 'is_active')
                ? $this->countWhere(Alarm::class, fn ($query) => $query->where('is_active', true))
                : 0,
            'mobileSessions' => $this->countRows(MobileSession::class),
            'defaultAppCount' => 6,
            'blankCanvasAppCapacity' => 84,
            'recommendedCustomApps' => '8-12',
            'tvGrid' => '24x14',
            'demoPin' => '2026',
        ];

        return Inertia::render('Demo', [
            'facts' => $facts,
            'publishedDemo' => $this->publishedDemo(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'pin' => ['required', 'string', 'in:2026'],
            'slides' => ['required', 'array', 'min:1', 'max:20'],
            'slides.*.id' => ['required', 'string', 'max:80'],
            'slides.*.eyebrow' => ['required', 'string', 'max:120'],
            'slides.*.title' => ['required', 'string', 'max:220'],
            'slides.*.body' => ['required', 'string', 'max:1200'],
            'slides.*.imageUrl' => ['required', 'string'],
            'slides.*.imageLabel' => ['required', 'string', 'max:160'],
            'slides.*.metrics' => ['required', 'array', 'max:6'],
            'slides.*.metrics.*.label' => ['required', 'string', 'max:80'],
            'slides.*.metrics.*.value' => ['required', 'string', 'max:80'],
            'slides.*.metrics.*.detail' => ['required', 'string', 'max:160'],
            'slides.*.bullets' => ['required', 'array', 'max:8'],
            'slides.*.bullets.*' => ['required', 'string', 'max:300'],
            'slides.*.note' => ['nullable', 'string', 'max:500'],
            'themeId' => ['required', 'string', 'in:teal,blue,violet,rose,amber'],
        ]);

        $published = [
            'slides' => $payload['slides'],
            'themeId' => $payload['themeId'],
            'publishedAt' => now()->toIso8601String(),
        ];

        Storage::disk('local')->put(
            self::STORAGE_PATH,
            json_encode($published, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
        );

        return response()->json($published);
    }

    private function publishedDemo(): ?array
    {
        if (! Storage::disk('local')->exists(self::STORAGE_PATH)) {
            return null;
        }

        $payload = json_decode(Storage::disk('local')->get(self::STORAGE_PATH), true);

        if (! is_array($payload) || ! isset($payload['slides']) || ! is_array($payload['slides'])) {
            return null;
        }

        return [
            'slides' => $payload['slides'],
            'themeId' => $payload['themeId'] ?? 'teal',
            'publishedAt' => $payload['publishedAt'] ?? null,
        ];
    }

    private function countRows(string $modelClass): int
    {
        if (! $this->hasTable($modelClass)) {
            return 0;
        }

        return $modelClass::query()->count();
    }

    private function countWhere(string $modelClass, callable $scope): int
    {
        if (! $this->hasTable($modelClass)) {
            return 0;
        }

        return $scope($modelClass::query())->count();
    }

    private function hasColumn(string $modelClass, string $column): bool
    {
        return $this->hasTable($modelClass)
            && Schema::hasColumn($this->tableFor($modelClass), $column);
    }

    private function hasTable(string $modelClass): bool
    {
        return Schema::hasTable($this->tableFor($modelClass));
    }

    private function tableFor(string $modelClass): string
    {
        /** @var Model $model */
        $model = new $modelClass;

        return $model->getTable();
    }
}
