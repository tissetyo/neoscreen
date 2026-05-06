<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotels', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('location', 500)->nullable();
            $table->string('timezone', 100)->default('Asia/Jakarta');
            $table->string('wifi_ssid')->nullable();
            $table->string('wifi_password')->nullable();
            $table->string('wifi_username')->nullable();
            $table->text('default_background_url')->nullable();
            $table->text('featured_image_url')->nullable();
            $table->text('startup_video_url')->nullable();
            $table->string('airport_iata_code', 10)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('clock_timezone_1', 100)->default('America/New_York');
            $table->string('clock_timezone_2', 100)->default('Europe/Paris');
            $table->string('clock_timezone_3', 100)->default('Asia/Shanghai');
            $table->string('clock_label_1', 50)->default('New York');
            $table->string('clock_label_2', 50)->default('France');
            $table->string('clock_label_3', 50)->default('China');
            $table->json('tv_layout_config')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotels');
    }
};
