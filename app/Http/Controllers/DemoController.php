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
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class DemoController extends Controller
{
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
        ]);
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
