<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('risk_zones', function (Blueprint $table) {
            $table->unsignedInteger('incident_count')->default(0)->after('radius_meters');
            $table->boolean('auto_generated')->default(false)->after('incident_count');
            $table->timestamp('last_incident_at')->nullable()->after('auto_generated');
        });
    }

    public function down(): void
    {
        Schema::table('risk_zones', function (Blueprint $table) {
            $table->dropColumn(['incident_count', 'auto_generated', 'last_incident_at']);
        });
    }
};
