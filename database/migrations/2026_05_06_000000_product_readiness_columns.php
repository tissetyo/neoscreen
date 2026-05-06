<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            if (!Schema::hasColumn('rooms', 'checkin_date')) {
                $table->date('checkin_date')->nullable()->after('background_url');
            }

            if (!Schema::hasColumn('rooms', 'room_session_token')) {
                $table->string('room_session_token', 80)->nullable()->after('pin')->index();
            }
        });

        Schema::table('services', function (Blueprint $table) {
            if (!Schema::hasColumn('services', 'icon')) {
                $table->string('icon', 50)->nullable()->after('name');
            }

            if (!Schema::hasColumn('services', 'color_theme')) {
                $table->string('color_theme', 30)->nullable()->after('icon');
            }

            if (!Schema::hasColumn('services', 'sort_order')) {
                $table->unsignedInteger('sort_order')->default(0)->after('image_url')->index();
            }
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            foreach (['sort_order', 'color_theme', 'icon'] as $column) {
                if (Schema::hasColumn('services', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('rooms', function (Blueprint $table) {
            if (Schema::hasColumn('rooms', 'room_session_token')) {
                $table->dropColumn('room_session_token');
            }

            if (Schema::hasColumn('rooms', 'checkin_date')) {
                $table->dropColumn('checkin_date');
            }
        });
    }
};
