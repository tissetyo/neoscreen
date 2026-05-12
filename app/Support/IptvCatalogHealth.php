<?php

namespace App\Support;

use App\Models\IptvCountry;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class IptvCatalogHealth
{
    /**
     * @param Collection<int, IptvCountry> $countries
     * @return array<string, mixed>
     */
    public static function summary(Collection $countries): array
    {
        $items = $countries
            ->map(fn (IptvCountry $country) => self::countrySummary($country))
            ->values();

        return [
            'countries' => $items,
            'enabledCountries' => $countries->where('is_enabled', true)->count(),
            'playlistOnline' => $items->where('playlistAvailable', true)->count(),
            'playableChannels' => $items->sum('playableChannels'),
            'hiddenChannels' => $items->sum('hiddenChannels'),
            'checkedAt' => now()->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function countrySummary(IptvCountry $country): array
    {
        return Cache::remember("iptv_catalog_health_{$country->code}_v2", now()->addMinutes(45), function () use ($country) {
            try {
                $response = Http::timeout(8)->retry(1, 250)->get($country->playlist_url);
            } catch (Throwable) {
                return self::emptyCountry($country, false);
            }

            if (! $response->ok()) {
                return self::emptyCountry($country, false);
            }

            $total = 0;
            $playable = 0;
            $hidden = 0;
            $pendingName = '';

            foreach (preg_split('/\r\n|\r|\n/', $response->body()) ?: [] as $line) {
                $line = trim($line);

                if (str_starts_with($line, '#EXTINF')) {
                    $pendingName = trim(substr(strrchr($line, ','), 1) ?: 'Live TV');
                    continue;
                }

                if ($pendingName !== '' && preg_match('/^https?:\/\//i', $line)) {
                    $total++;
                    if (self::isPlayableUrl($line) && self::isAvailableName($pendingName)) {
                        $playable++;
                    } else {
                        $hidden++;
                    }
                    $pendingName = '';
                }
            }

            return [
                'code' => $country->code,
                'name' => $country->name,
                'region' => $country->region,
                'isEnabled' => (bool) $country->is_enabled,
                'playlistAvailable' => true,
                'totalChannels' => $total,
                'playableChannels' => $playable,
                'hiddenChannels' => $hidden,
            ];
        });
    }

    public static function isAvailableName(string $name): bool
    {
        $normalized = strtolower($name);

        return ! str_contains($normalized, 'geo-blocked')
            && ! str_contains($normalized, 'not 24/7')
            && ! str_contains($normalized, 'offline')
            && ! str_contains($normalized, 'backup');
    }

    public static function isPlayableUrl(string $url): bool
    {
        if (! str_starts_with($url, 'http')) {
            return false;
        }

        $path = strtolower((string) parse_url($url, PHP_URL_PATH));

        return ! str_ends_with($path, '.mpd');
    }

    public static function streamAvailable(string $url): bool
    {
        if (app()->environment('testing')) {
            return true;
        }

        return Cache::remember('iptv_stream_health_' . sha1($url) . '_v2', now()->addMinutes(45), function () use ($url) {
            return self::probeStream($url)['available'];
        });
    }

    /**
     * @return array{available: bool, responseTimeMs: int|null, message: string}
     */
    public static function probeStream(string $url): array
    {
        $started = microtime(true);

        if (! self::isPlayableUrl($url)) {
            return ['available' => false, 'responseTimeMs' => null, 'message' => 'Unsupported stream URL'];
        }

        try {
            $response = Http::timeout(5)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0'])
                ->get($url);
        } catch (Throwable $exception) {
            return ['available' => false, 'responseTimeMs' => null, 'message' => Str::limit($exception->getMessage(), 180)];
        }

        $responseTimeMs = (int) round((microtime(true) - $started) * 1000);

        if (! $response->ok()) {
            return ['available' => false, 'responseTimeMs' => $responseTimeMs, 'message' => 'HTTP ' . $response->status()];
        }

        $path = strtolower((string) parse_url($url, PHP_URL_PATH));
        $contentType = strtolower($response->header('Content-Type', ''));
        $isHls = str_ends_with($path, '.m3u8') || str_contains($contentType, 'mpegurl') || str_contains($response->body(), '#EXTM3U');

        if (! $isHls) {
            return ['available' => true, 'responseTimeMs' => $responseTimeMs, 'message' => 'OK'];
        }

        if (! self::hlsPlaylistAvailable($response->body(), $url)) {
            return ['available' => false, 'responseTimeMs' => $responseTimeMs, 'message' => 'No playable HLS segment'];
        }

        return ['available' => true, 'responseTimeMs' => $responseTimeMs, 'message' => 'OK'];
    }

    public static function forgetStreamCache(string $url): void
    {
        Cache::forget('iptv_stream_health_' . sha1($url) . '_v2');
    }

    public static function cachedStreamAvailable(string $url): bool
    {
        return Cache::remember('iptv_stream_health_' . sha1($url) . '_v2', now()->addMinutes(45), function () use ($url) {
            if (! self::isPlayableUrl($url)) {
                return false;
            }

            try {
                $response = Http::timeout(4)
                    ->withHeaders(['User-Agent' => 'Mozilla/5.0'])
                    ->get($url);
            } catch (Throwable) {
                return false;
            }

            if (! $response->ok()) {
                return false;
            }

            $path = strtolower((string) parse_url($url, PHP_URL_PATH));
            $contentType = strtolower($response->header('Content-Type', ''));
            $isHls = str_ends_with($path, '.m3u8') || str_contains($contentType, 'mpegurl') || str_contains($response->body(), '#EXTM3U');

            if (! $isHls) {
                return true;
            }

            return self::hlsPlaylistAvailable($response->body(), $url);
        });
    }

    private static function hlsPlaylistAvailable(string $body, string $sourceUrl, int $depth = 0): bool
    {
        if (! str_contains($body, '#EXTM3U')) {
            return false;
        }

        $lines = collect(preg_split('/\r\n|\r|\n/', $body) ?: [])
            ->map(fn (string $line) => trim($line))
            ->filter();

        if ($lines->contains(fn (string $line) => str_starts_with($line, '#EXTINF'))) {
            return (bool) $lines->first(fn (string $line) => ! str_starts_with($line, '#'));
        }

        if ($depth >= 1) {
            return true;
        }

        $variant = $lines->first(fn (string $line) => ! str_starts_with($line, '#'));
        if (! is_string($variant)) {
            return false;
        }

        try {
            $variantUrl = self::absoluteUrl($variant, self::baseUrl($sourceUrl));
            $response = Http::timeout(4)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0'])
                ->get($variantUrl);
        } catch (Throwable) {
            return false;
        }

        return $response->ok() && self::hlsPlaylistAvailable($response->body(), $variantUrl, $depth + 1);
    }

    private static function baseUrl(string $url): string
    {
        return Str::beforeLast($url, '/') . '/';
    }

    private static function absoluteUrl(string $url, string $baseUrl): string
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

    /**
     * @return array<string, mixed>
     */
    private static function emptyCountry(IptvCountry $country, bool $available): array
    {
        return [
            'code' => $country->code,
            'name' => $country->name,
            'region' => $country->region,
            'isEnabled' => (bool) $country->is_enabled,
            'playlistAvailable' => $available,
            'totalChannels' => 0,
            'playableChannels' => 0,
            'hiddenChannels' => 0,
        ];
    }
}
