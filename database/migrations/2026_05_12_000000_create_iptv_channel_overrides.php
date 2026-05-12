<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('iptv_channel_overrides', function (Blueprint $table) {
            $table->id();
            $table->string('country_code', 3)->index();
            $table->string('channel_key', 120);
            $table->string('name', 160);
            $table->text('source_url')->nullable();
            $table->string('restream_url', 500)->nullable();
            $table->boolean('is_available')->default(true)->index();
            $table->unsignedSmallInteger('consecutive_failures')->default(0);
            $table->unsignedInteger('response_time_ms')->nullable();
            $table->string('status_message', 255)->nullable();
            $table->timestamp('checked_at')->nullable();
            $table->timestamps();

            $table->unique(['country_code', 'channel_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('iptv_channel_overrides');
    }
};
