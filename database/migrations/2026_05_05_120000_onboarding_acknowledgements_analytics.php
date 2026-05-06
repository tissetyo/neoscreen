<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hotels', function (Blueprint $table) {
            $table->json('onboarding_data')->nullable()->after('is_active');
        });

        Schema::table('service_requests', function (Blueprint $table) {
            $table->timestamp('staff_acknowledged_at')->nullable()->after('status');
            $table->uuid('staff_acknowledged_by')->nullable()->after('staff_acknowledged_at');
            $table->timestamp('guest_acknowledged_at')->nullable()->after('staff_acknowledged_by');
            $table->foreign('staff_acknowledged_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->timestamp('staff_acknowledged_at')->nullable()->after('is_read');
            $table->uuid('staff_acknowledged_by')->nullable()->after('staff_acknowledged_at');
            $table->foreign('staff_acknowledged_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('alarms', function (Blueprint $table) {
            $table->timestamp('acknowledged_at')->nullable()->after('is_active');
            $table->uuid('acknowledged_by')->nullable()->after('acknowledged_at');
            $table->foreign('acknowledged_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('alarms', function (Blueprint $table) {
            $table->dropForeign(['acknowledged_by']);
            $table->dropColumn(['acknowledged_at', 'acknowledged_by']);
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropForeign(['staff_acknowledged_by']);
            $table->dropColumn(['staff_acknowledged_at', 'staff_acknowledged_by']);
        });

        Schema::table('service_requests', function (Blueprint $table) {
            $table->dropForeign(['staff_acknowledged_by']);
            $table->dropColumn(['staff_acknowledged_at', 'staff_acknowledged_by', 'guest_acknowledged_at']);
        });

        Schema::table('hotels', function (Blueprint $table) {
            $table->dropColumn('onboarding_data');
        });
    }
};
