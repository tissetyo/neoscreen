<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('iptv_countries', function (Blueprint $table) {
            $table->string('code', 3)->primary();
            $table->string('name', 100);
            $table->string('region', 80)->default('Global');
            $table->string('playlist_url', 255);
            $table->boolean('is_enabled')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(100);
            $table->timestamps();
        });

        Schema::table('hotels', function (Blueprint $table) {
            $table->boolean('iptv_enabled')->default(false)->after('is_active');
        });

        Schema::table('rooms', function (Blueprint $table) {
            $table->string('guest_country_code', 3)->nullable()->after('guest_name');
        });

        $countries = [
            ['id', 'Indonesia', 'Default', 1], ['us', 'United States', 'Default', 2], ['int', 'International', 'Default', 3],
            ['th', 'Thailand', 'Southeast Asia', 10], ['sg', 'Singapore', 'Southeast Asia', 11], ['my', 'Malaysia', 'Southeast Asia', 12],
            ['ph', 'Philippines', 'Southeast Asia', 13], ['vn', 'Vietnam', 'Southeast Asia', 14], ['kh', 'Cambodia', 'Southeast Asia', 15],
            ['jp', 'Japan', 'Asia Pacific', 20], ['kr', 'South Korea', 'Asia Pacific', 21], ['cn', 'China', 'Asia Pacific', 22],
            ['in', 'India', 'Asia Pacific', 23], ['au', 'Australia', 'Asia Pacific', 24], ['nz', 'New Zealand', 'Asia Pacific', 25],
            ['gb', 'United Kingdom', 'Europe', 30], ['fr', 'France', 'Europe', 31], ['de', 'Germany', 'Europe', 32],
            ['it', 'Italy', 'Europe', 33], ['es', 'Spain', 'Europe', 34], ['nl', 'Netherlands', 'Europe', 35],
            ['ch', 'Switzerland', 'Europe', 36], ['se', 'Sweden', 'Europe', 37], ['tr', 'Turkey', 'Europe', 38],
            ['ae', 'United Arab Emirates', 'Middle East', 45], ['sa', 'Saudi Arabia', 'Middle East', 46], ['qa', 'Qatar', 'Middle East', 47],
            ['ca', 'Canada', 'Americas', 55], ['mx', 'Mexico', 'Americas', 56], ['br', 'Brazil', 'Americas', 57],
            ['ar', 'Argentina', 'Americas', 58], ['za', 'South Africa', 'Africa', 65], ['eg', 'Egypt', 'Africa', 66],
        ];

        foreach ($countries as [$code, $name, $region, $sort]) {
            $playlistUrl = $code === 'int'
                ? 'https://iptv-org.github.io/iptv/index.m3u'
                : "https://iptv-org.github.io/iptv/countries/{$code}.m3u";

            DB::table('iptv_countries')->insert([
                'code' => $code,
                'name' => $name,
                'region' => $region,
                'playlist_url' => $playlistUrl,
                'is_enabled' => true,
                'sort_order' => $sort,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn('guest_country_code');
        });

        Schema::table('hotels', function (Blueprint $table) {
            $table->dropColumn('iptv_enabled');
        });

        Schema::dropIfExists('iptv_countries');
    }
};
