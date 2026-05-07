<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotel_media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('hotel_id');
            $table->string('title')->nullable();
            $table->string('type', 20)->default('image');
            $table->text('url');
            $table->string('source_type', 30)->default('upload');
            $table->json('room_ids')->nullable();
            $table->json('tags')->nullable();
            $table->boolean('is_slideshow')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('hotel_id')->references('id')->on('hotels')->onDelete('cascade');
            $table->index(['hotel_id', 'type', 'is_slideshow']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotel_media');
    }
};
