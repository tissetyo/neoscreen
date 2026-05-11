<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('iptv_countries')
            ->where('code', 'int')
            ->update([
                'playlist_url' => 'https://iptv-org.github.io/iptv/index.m3u',
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        DB::table('iptv_countries')
            ->where('code', 'int')
            ->update([
                'playlist_url' => 'https://iptv-org.github.io/iptv/countries/int.m3u',
                'updated_at' => now(),
            ]);
    }
};
