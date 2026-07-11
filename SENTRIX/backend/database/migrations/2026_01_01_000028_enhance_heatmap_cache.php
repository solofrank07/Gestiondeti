<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('heatmap_cache', function (Blueprint $table) {
            $table->unsignedInteger('tile_x')->nullable()->after('zoom_level');
            $table->unsignedInteger('tile_y')->nullable()->after('tile_x');
            $table->string('filters_hash', 32)->nullable()->after('data')->index();
            $table->json('grid_config')->nullable()->after('filters_hash')
                ->comment('{grid_size, bandwidth, cells_x, cells_y}');
            $table->unsignedInteger('hit_count')->default(0)->after('point_count');
            $table->timestamp('last_accessed_at')->nullable()->after('hit_count');
        });
    }

    public function down(): void
    {
        Schema::table('heatmap_cache', function (Blueprint $table) {
            $table->dropColumn(['tile_x', 'tile_y', 'filters_hash', 'grid_config', 'hit_count', 'last_accessed_at']);
        });
    }
};
