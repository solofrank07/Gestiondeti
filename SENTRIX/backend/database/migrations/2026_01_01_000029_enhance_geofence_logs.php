<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('geofence_logs', function (Blueprint $table) {
            $table->unsignedInteger('duration_seconds')->nullable()->after('distance_to_center')
                ->comment('Duración dentro de la zona en segundos (dwelling)');
            $table->string('heading', 20)->nullable()->after('duration_seconds')
                ->comment('Dirección de aproximación (N, NE, E, SE, S, SW, W, NW)');
            $table->decimal('speed_ms', 6, 2)->nullable()->after('heading');
            $table->index('duration_seconds');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->json('last_geofence_state')->nullable()->after('last_active_at')
                ->comment('{zone_id: {status: inside|outside, entered_at, last_notified_at}}');
        });
    }

    public function down(): void
    {
        Schema::table('geofence_logs', function (Blueprint $table) {
            $table->dropColumn(['duration_seconds', 'heading', 'speed_ms']);
        });
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('last_geofence_state');
        });
    }
};
