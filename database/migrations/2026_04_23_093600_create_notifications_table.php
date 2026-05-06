<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('hotel_id');
            $table->uuid('room_id')->nullable();
            $table->string('title')->nullable();
            $table->text('message');
            $table->string('type', 50)->default('info');
            $table->boolean('is_read')->default(false);
            $table->timestamps();
            $table->foreign('hotel_id')->references('id')->on('hotels')->onDelete('cascade');
            $table->index(['hotel_id', 'room_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
