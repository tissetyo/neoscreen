<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Str;
use App\Models\IptvChannelOverride;
use App\Models\IptvCountry;
use App\Support\IptvCatalogHealth;
use Symfony\Component\Process\Process;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

$channelKey = function (array $channel): string {
    $tvgId = (string) ($channel['tvgId'] ?? '');
    if ($tvgId !== '') {
        return strtolower(Str::before(Str::before($tvgId, '.'), '@'));
    }

    return strtolower((string) preg_replace('/[^a-z0-9]/i', '', (string) ($channel['name'] ?? '')));
};

$playlistChannels = function (IptvCountry $country) use ($channelKey) {
    try {
        $response = Http::timeout(12)
            ->withHeaders(['User-Agent' => 'Mozilla/5.0'])
            ->get($country->playlist_url);
    } catch (Throwable) {
        return collect();
    }

    if (! $response->ok()) {
        return collect();
    }

    $channels = collect();
    $pending = null;

    foreach (preg_split('/\r\n|\r|\n/', $response->body()) ?: [] as $line) {
        $line = trim($line);
        if ($line === '' || $line === '#EXTM3U') {
            continue;
        }

        if (str_starts_with($line, '#EXTINF')) {
            $pending = [
                'name' => trim(substr(strrchr($line, ','), 1) ?: 'Live TV'),
                'tvgId' => preg_match('/tvg-id="([^"]*)"/', $line, $matches) ? ($matches[1] ?: null) : null,
            ];
            continue;
        }

        if ($pending && preg_match('/^https?:\/\//i', $line)) {
            $channel = array_merge($pending, [
                'countryCode' => $country->code,
                'url' => $line,
            ]);
            $channel['channelKey'] = $channelKey($channel);
            $channels->push($channel);
            $pending = null;
        }
    }

    return $channels
        ->filter(fn (array $channel) => IptvCatalogHealth::isPlayableUrl((string) $channel['url']))
        ->unique('channelKey')
        ->values();
};

Artisan::command('iptv:health-monitor {--country=id : Country code to check, or "all"} {--limit=25 : Max channels per country} {--failures=2 : Failures before hiding}', function () use ($playlistChannels) {
    $countryOption = strtolower((string) $this->option('country'));
    $limit = max(1, (int) $this->option('limit'));
    $failureThreshold = max(1, (int) $this->option('failures'));

    $countries = IptvCountry::query()
        ->where('is_enabled', true)
        ->when($countryOption !== 'all', fn ($query) => $query->where('code', $countryOption))
        ->orderBy('sort_order')
        ->get();

    if ($countries->isEmpty()) {
        $this->warn('No IPTV countries matched.');
        return 1;
    }

    $checked = 0;
    $hidden = 0;

    foreach ($countries as $country) {
        $this->info("Checking {$country->name}...");
        $channels = $playlistChannels($country)->take($limit);

        foreach ($channels as $channel) {
            $probe = IptvCatalogHealth::probeStream((string) $channel['url']);
            $override = IptvChannelOverride::firstOrNew([
                'country_code' => $country->code,
                'channel_key' => $channel['channelKey'],
            ]);

            $failures = $probe['available'] ? 0 : ((int) $override->consecutive_failures + 1);
            $available = $probe['available'] || $failures < $failureThreshold;

            $override->fill([
                'name' => $channel['name'],
                'source_url' => $channel['url'],
                'is_available' => $available,
                'consecutive_failures' => $failures,
                'response_time_ms' => $probe['responseTimeMs'],
                'status_message' => $probe['message'],
                'checked_at' => now(),
            ])->save();

            $checked++;
            if (! $available) {
                $hidden++;
            }

            $status = $available ? 'ok' : 'hidden';
            $this->line("  {$status} {$channel['name']} ({$probe['message']})");
        }
    }

    $this->info("Checked {$checked} channels. Hidden {$hidden} after {$failureThreshold} consecutive failures.");
    return 0;
})->purpose('Probe IPTV streams and hide channels with repeated failures.');

Artisan::command('iptv:transcode-channel {channel : Channel key or name} {--country=id : Country code} {--base-url= : Public base URL for generated HLS files} {--dry-run : Print FFmpeg command without running}', function () use ($playlistChannels) {
    $country = IptvCountry::findOrFail(strtolower((string) $this->option('country')));
    $needle = strtolower((string) $this->argument('channel'));
    $channel = $playlistChannels($country)->first(function (array $item) use ($needle) {
        return $item['channelKey'] === $needle || str_contains(strtolower($item['name']), $needle);
    });

    if (! $channel) {
        $this->error('Channel not found in playlist.');
        return 1;
    }

    $which = new Process(['which', 'ffmpeg']);
    $which->run();
    $ffmpeg = trim($which->getOutput());
    if (! $which->isSuccessful() || $ffmpeg === '') {
        $this->error('ffmpeg is not installed on this server.');
        return 1;
    }

    $relativeDir = "iptv/{$country->code}/{$channel['channelKey']}";
    $outputDir = public_path($relativeDir);
    File::ensureDirectoryExists($outputDir);
    File::cleanDirectory($outputDir);

    $baseUrl = rtrim((string) ($this->option('base-url') ?: config('app.url')), '/');
    $publicUrl = "{$baseUrl}/{$relativeDir}/master.m3u8";

    $command = [
        $ffmpeg,
        '-hide_banner',
        '-loglevel', 'warning',
        '-reconnect', '1',
        '-reconnect_streamed', '1',
        '-reconnect_delay_max', '5',
        '-i', (string) $channel['url'],
        '-filter_complex', '[0:v]split=3[v360][v480][v720];[v360]scale=w=640:h=360:force_original_aspect_ratio=decrease[v360out];[v480]scale=w=854:h=480:force_original_aspect_ratio=decrease[v480out];[v720]scale=w=1280:h=720:force_original_aspect_ratio=decrease[v720out]',
        '-map', '[v360out]', '-map', '0:a:0',
        '-map', '[v480out]', '-map', '0:a:0',
        '-map', '[v720out]', '-map', '0:a:0',
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-profile:v', 'main',
        '-sc_threshold', '0',
        '-g', '48',
        '-keyint_min', '48',
        '-c:a', 'aac',
        '-ar', '48000',
        '-b:v:0', '700k', '-maxrate:v:0', '800k', '-bufsize:v:0', '1200k', '-b:a:0', '96k',
        '-b:v:1', '1400k', '-maxrate:v:1', '1600k', '-bufsize:v:1', '2400k', '-b:a:1', '112k',
        '-b:v:2', '2800k', '-maxrate:v:2', '3200k', '-bufsize:v:2', '4800k', '-b:a:2', '128k',
        '-f', 'hls',
        '-hls_time', '4',
        '-hls_list_size', '8',
        '-hls_flags', 'delete_segments+independent_segments+program_date_time',
        '-master_pl_name', 'master.m3u8',
        '-hls_segment_filename', "{$outputDir}/v%v/seg_%05d.ts",
        '-var_stream_map', 'v:0,a:0,name:360p v:1,a:1,name:480p v:2,a:2,name:720p',
        "{$outputDir}/v%v/index.m3u8",
    ];

    $this->info("Transcoding {$channel['name']} to {$publicUrl}");
    if ($this->option('dry-run')) {
        $this->line(implode(' ', array_map('escapeshellarg', $command)));
        return 0;
    }

    IptvChannelOverride::updateOrCreate([
        'country_code' => $country->code,
        'channel_key' => $channel['channelKey'],
    ], [
        'name' => $channel['name'],
        'source_url' => $channel['url'],
        'restream_url' => $publicUrl,
        'is_available' => true,
        'consecutive_failures' => 0,
        'status_message' => 'Restreaming through local ABR ladder',
        'checked_at' => now(),
    ]);

    $process = new Process($command, timeout: null);
    $process->setTty(false);
    $process->run(function ($type, $buffer) {
        $this->output->write($buffer);
    });

    return $process->isSuccessful() ? 0 : 1;
})->purpose('Restream one IPTV channel as a 360p/480p/720p adaptive HLS ladder.');

Schedule::command('iptv:health-monitor --country=all --limit=25 --failures=2')
    ->everyFifteenMinutes()
    ->withoutOverlapping();
