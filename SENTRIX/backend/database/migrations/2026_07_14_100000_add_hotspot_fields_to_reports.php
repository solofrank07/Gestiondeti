<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->boolean('auto_approved')->default(false)->after('verified_by');
            $table->foreignId('promoted_hotspot_id')->nullable()
                ->after('auto_approved')
                ->constrained('risk_zones')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropConstrainedForeignId('promoted_hotspot_id');
            $table->dropColumn('auto_approved');
        });
    }
};
