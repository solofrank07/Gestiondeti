<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('heatmap_cache', function (Blueprint $table) {
            $table->id();
            $table->string('hash', 64)->unique()->comment('hash del área consultada');
            $table->decimal('north', 10, 7);
            $table->decimal('south', 10, 7);
            $table->decimal('east', 10, 7);
            $table->decimal('west', 10, 7);
            $table->integer('zoom_level');
            $table->json('data')->comment('grid de puntos con score');
            $table->integer('point_count');
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index('expires_at');
            $table->index(['north', 'south', 'east', 'west']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('heatmap_cache');
    }
};
