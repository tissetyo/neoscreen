<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('sessions') || !Schema::hasColumn('sessions', 'user_id')) {
            return;
        }

        match (DB::connection()->getDriverName()) {
            'mysql', 'mariadb' => DB::statement('ALTER TABLE sessions MODIFY user_id CHAR(36) NULL'),
            'pgsql' => DB::statement("ALTER TABLE sessions ALTER COLUMN user_id TYPE UUID USING NULLIF(user_id::text, '')::uuid"),
            'sqlsrv' => DB::statement('ALTER TABLE sessions ALTER COLUMN user_id NVARCHAR(36) NULL'),
            default => null,
        };
    }

    public function down(): void
    {
        if (!Schema::hasTable('sessions') || !Schema::hasColumn('sessions', 'user_id')) {
            return;
        }

        match (DB::connection()->getDriverName()) {
            'mysql', 'mariadb' => DB::statement('ALTER TABLE sessions MODIFY user_id BIGINT UNSIGNED NULL'),
            'pgsql' => DB::statement('ALTER TABLE sessions ALTER COLUMN user_id TYPE BIGINT USING NULL'),
            'sqlsrv' => DB::statement('ALTER TABLE sessions ALTER COLUMN user_id BIGINT NULL'),
            default => null,
        };
    }
};
