<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('hotel_id');
            $table->string('room_code', 50);
            $table->string('pin', 10);
            $table->uuid('room_type_id')->nullable();
            $table->string('guest_name')->nullable();
            $table->text('guest_photo_url')->nullable();
            $table->text('background_url')->nullable();
            $table->date('checkout_date')->nullable();
            $table->text('custom_welcome_message')->nullable();
            $table->boolean('is_occupied')->default(false);
            $table->timestamps();
            $table->foreign('hotel_id')->references('id')->on('hotels')->onDelete('cascade');
            $table->foreign('room_type_id')->references('id')->on('room_types')->onDelete('set null');
            $table->unique(['hotel_id', 'room_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
