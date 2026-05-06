<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hotels', function (Blueprint $table) {
            $table->string('billing_plan')->default('standard')->after('is_active');
            $table->string('billing_cycle')->default('monthly')->after('billing_plan');
            $table->string('billing_unit')->default('per_room')->after('billing_cycle');
            $table->string('billing_currency', 3)->default('IDR')->after('billing_unit');
            $table->decimal('billing_base_price', 12, 2)->default(0)->after('billing_currency');
            $table->decimal('billing_room_price', 12, 2)->default(0)->after('billing_base_price');
            $table->decimal('billing_stb_price', 12, 2)->default(0)->after('billing_room_price');
            $table->string('payment_status')->default('trial')->after('billing_stb_price');
            $table->date('next_billing_date')->nullable()->after('payment_status');
        });

        Schema::table('rooms', function (Blueprint $table) {
            $table->string('stb_device_id')->nullable()->after('room_session_token');
            $table->string('stb_status')->default('unpaired')->after('stb_device_id');
            $table->timestamp('stb_paired_at')->nullable()->after('stb_status');
            $table->timestamp('stb_last_seen_at')->nullable()->after('stb_paired_at');
        });
    }

    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn(['stb_device_id', 'stb_status', 'stb_paired_at', 'stb_last_seen_at']);
        });

        Schema::table('hotels', function (Blueprint $table) {
            $table->dropColumn([
                'billing_plan',
                'billing_cycle',
                'billing_unit',
                'billing_currency',
                'billing_base_price',
                'billing_room_price',
                'billing_stb_price',
                'payment_status',
                'next_billing_date',
            ]);
        });
    }
};
