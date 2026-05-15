<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hotels', function (Blueprint $table) {
            if (!Schema::hasColumn('hotels', 'logo_url')) {
                $table->text('logo_url')->nullable()->after('startup_video_url');
            }

            if (!Schema::hasColumn('hotels', 'description')) {
                $table->text('description')->nullable()->after('location');
            }

            if (!Schema::hasColumn('hotels', 'website_url')) {
                $table->string('website_url', 500)->nullable()->after('description');
            }

            if (!Schema::hasColumn('hotels', 'phone')) {
                $table->string('phone', 80)->nullable()->after('website_url');
            }

            if (!Schema::hasColumn('hotels', 'email')) {
                $table->string('email', 255)->nullable()->after('phone');
            }
        });
    }

    public function down(): void
    {
        Schema::table('hotels', function (Blueprint $table) {
            foreach (['email', 'phone', 'website_url', 'description', 'logo_url'] as $column) {
                if (Schema::hasColumn('hotels', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
