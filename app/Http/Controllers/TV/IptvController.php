<?php

namespace App\Http\Controllers\TV;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\IptvCountry;
use App\Models\Room;
use App\Support\IptvCatalogHealth;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class IptvController extends Controller
{
    private const CHANNELS_PER_COUNTRY = 25;
    private const TOTAL_CHANNEL_LIMIT = 125;

    private const INDONESIA_PRIMARY_CHANNELS = [
        'rcti',
        'sctv',
        'indosiar',
        'transtv',
        'trans7',
        'mnctv',
        'antv',
        'tvone',
        'metrotv',
        'gtv',
        'kompastv',
        'net',
        'inews',
        'moji',
        'rajawalitv',
    ];

    private const INDONESIA_FALLBACK_CHANNELS = [
        'jaktv',
        'btv',
        'garudatv',
        'tvri',
        'mentaritv',
        'magnachannel',
        'nusantaratv',
        'jtv',
        'balitv',
        'elshintatv',
    ];

    private const TEMPORARILY_UNAVAILABLE_CHANNELS = [
        'rcti',
    ];

    public function show(Request $request, string $roomId): JsonResponse
    {
        $hotelId = $request->query('hotelId');
        $room = Room::where('hotel_id', $hotelId)->findOrFail($roomId);
        $hotel = Hotel::findOrFail($room->hotel_id);

        if (! $hotel->iptv_enabled) {
            return response()->json(['enabled' => false, 'countries' => [], 'channels' => []]);
        }

        $countries = IptvCountry::where('is_enabled', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['code', 'name', 'region', 'playlist_url']);

        $requested = collect(explode(',', (string) $request->query('countries')))
            ->map(fn ($code) => strtolower(trim($code)))
            ->filter()
            ->unique()
            ->values();

        $baseCodes = collect(['id', 'us', 'int', strtolower((string) $room->guest_country_code)])
            ->filter()
            ->unique();

        $enabledCodes = $countries->pluck('code');
        $defaultCodes = $baseCodes->intersect($enabledCodes)->values();
        if ($defaultCodes->isEmpty() && $countries->isNotEmpty()) {
            $defaultCodes = collect([$countries->first()->code]);
        }

        $countryCodes = $requested->isNotEmpty()
            ? $requested->intersect($enabledCodes)->values()
            : $defaultCodes;
        $allowed = $countries->whereIn('code', $countryCodes)->values();

        $channelCollections = $allowed
            ->map(fn (IptvCountry $country) => $this->channelsForCountry($country)->take(self::CHANNELS_PER_COUNTRY));

        $channels = $channelCollections
            ->flatMap(fn ($items) => $items)
            ->values()
            ->take(self::TOTAL_CHANNEL_LIMIT);

        return response()->json([
            'enabled' => true,
            'defaultCountryCode' => $room->guest_country_code ?: 'id',
            'defaultCountryCodes' => $defaultCodes,
            'countries' => $countries,
            'channels' => $channels,
            'availability' => [
                'playableChannels' => $channels->count(),
                'hiddenChannels' => $allowed->sum(fn (IptvCountry $country) => max(0, IptvCatalogHealth::countrySummary($country)['hiddenChannels'] ?? 0)),
            ],
            'source' => [
                'name' => 'iptv-org/iptv',
                'url' => 'https://github.com/iptv-org/iptv',
            ],
        ]);
    }

    private function channelsForCountry(IptvCountry $country)
    {
        return collect(Cache::remember("iptv_country_{$country->code}_v12", now()->addHours(6), function () use ($country) {
            try {
                $response = Http::timeout(10)->retry(1, 300)->get($country->playlist_url);
            } catch (Throwable) {
                return [];
            }

            if (! $response->ok()) {
                return [];
            }

            $lines = preg_split('/\r\n|\r|\n/', $response->body()) ?: [];
            $channels = collect();
            $pending = null;

            foreach ($lines as $line) {
                $line = trim($line);
                if ($line === '' || $line === '#EXTM3U') {
                    continue;
                }

                if (str_starts_with($line, '#EXTINF')) {
                    $pending = [
                        'name' => trim(substr(strrchr($line, ','), 1) ?: 'Live TV'),
                        'tvgId' => $this->attribute($line, 'tvg-id'),
                        'logo' => $this->attribute($line, 'tvg-logo'),
                        'category' => $this->attribute($line, 'group-title') ?: $country->region,
                        'countryCode' => $country->code,
                        'countryName' => $country->name,
                    ];
                    continue;
                }

                if ($pending && preg_match('/^https?:\/\//i', $line)) {
                    $channels->push(array_merge($pending, [
                        'url' => $line,
                        'proxyUrl' => $this->proxyUrl($line),
                        'availabilityStatus' => IptvCatalogHealth::isAvailableName((string) $pending['name']) ? 'available' : 'unavailable',
                    ]));
                    $pending = null;
                }
            }

            return $this->prioritizeChannels($country, $channels
                ->filter(fn ($channel) => $this->isPlayableUrl((string) $channel['url']) && $channel['availabilityStatus'] === 'available' && $this->isAllowedChannel($channel))
                ->unique('url')
                ->values())
                ->all();
        }))->values();
    }

    public function proxy(Request $request)
    {
        try {
            $url = Crypt::decryptString((string) $request->query('token'));
        } catch (Throwable) {
            abort(404);
        }

        abort_unless($this->isAllowedProxyUrl($url), 403);

        try {
            $response = Http::timeout(12)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0'])
                ->get($url);
        } catch (Throwable) {
            abort(502);
        }

        abort_unless($response->ok(), 502);

        $body = $response->body();
        $contentType = $response->header('Content-Type', 'application/octet-stream');

        if (str_contains(strtolower($contentType), 'mpegurl') || str_ends_with(strtolower(parse_url($url, PHP_URL_PATH) ?: ''), '.m3u8')) {
            $body = $this->rewritePlaylist($body, $url);
            $contentType = 'application/vnd.apple.mpegurl';
        }

        return response($body, 200)
            ->header('Content-Type', $contentType)
            ->header('Cache-Control', 'public, max-age=20');
    }

    private function rewritePlaylist(string $body, string $sourceUrl): string
    {
        $baseUrl = $this->baseUrl($sourceUrl);

        return collect(preg_split('/\r\n|\r|\n/', $body) ?: [])
            ->map(function (string $line) use ($baseUrl) {
                $trimmed = trim($line);

                if ($trimmed === '') {
                    return $line;
                }

                if (str_starts_with($trimmed, '#EXT-X-KEY')) {
                    return preg_replace_callback('/URI="([^"]+)"/', fn ($matches) => 'URI="' . $this->proxyUrl($this->absoluteUrl($matches[1], $baseUrl)) . '"', $line) ?? $line;
                }

                if (str_starts_with($trimmed, '#')) {
                    return $line;
                }

                return $this->proxyUrl($this->absoluteUrl($trimmed, $baseUrl));
            })
            ->implode("\n");
    }

    private function baseUrl(string $url): string
    {
        return Str::beforeLast($url, '/') . '/';
    }

    private function absoluteUrl(string $url, string $baseUrl): string
    {
        if (preg_match('/^https?:\/\//i', $url)) {
            return $url;
        }

        if (str_starts_with($url, '//')) {
            return 'https:' . $url;
        }

        $parts = parse_url($baseUrl);
        $origin = ($parts['scheme'] ?? 'https') . '://' . ($parts['host'] ?? '');
        if (isset($parts['port'])) {
            $origin .= ':' . $parts['port'];
        }

        if (str_starts_with($url, '/')) {
            return $origin . $url;
        }

        return $baseUrl . $url;
    }

    private function proxyUrl(string $url): string
    {
        return '/api/iptv/proxy?token=' . rawurlencode(Crypt::encryptString($url));
    }

    private function isAllowedProxyUrl(string $url): bool
    {
        if (! preg_match('/^https?:\/\//i', $url)) {
            return false;
        }

        $host = parse_url($url, PHP_URL_HOST);
        if (! $host || in_array(strtolower($host), ['localhost', '127.0.0.1', '::1'], true)) {
            return false;
        }

        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false;
        }

        return true;
    }

    private function isPlayableUrl(string $url): bool
    {
        return IptvCatalogHealth::isPlayableUrl($url);
    }

    private function prioritizeChannels(IptvCountry $country, $channels)
    {
        if ($country->code !== 'id') {
            return $channels;
        }

        return $channels
            ->sort(fn ($a, $b) => [
                $this->priorityRankForChannel($a),
                $a['name'],
            ] <=> [
                $this->priorityRankForChannel($b),
                $b['name'],
            ])
            ->unique(fn ($channel) => $this->channelKey($channel))
            ->values();
    }

    private function priorityRankForChannel(array $channel): int
    {
        $key = $this->channelKey($channel);
        $primaryIndex = array_search($key, self::INDONESIA_PRIMARY_CHANNELS, true);
        if ($primaryIndex !== false) {
            return $primaryIndex + 1;
        }

        $fallbackIndex = array_search($key, self::INDONESIA_FALLBACK_CHANNELS, true);
        if ($fallbackIndex !== false) {
            return 100 + $fallbackIndex;
        }

        return 1000;
    }

    private function isAllowedChannel(array $channel): bool
    {
        return ! in_array($this->channelKey($channel), self::TEMPORARILY_UNAVAILABLE_CHANNELS, true);
    }

    private function channelKey(array $channel): string
    {
        $tvgId = (string) ($channel['tvgId'] ?? '');
        if ($tvgId !== '') {
            return strtolower(Str::before(Str::before($tvgId, '.'), '@'));
        }

        return strtolower((string) preg_replace('/[^a-z0-9]/i', '', (string) ($channel['name'] ?? '')));
    }

    private function attribute(string $line, string $name): ?string
    {
        if (preg_match('/' . preg_quote($name, '/') . '="([^"]*)"/', $line, $matches)) {
            return $matches[1] ?: null;
        }

        return null;
    }
}
