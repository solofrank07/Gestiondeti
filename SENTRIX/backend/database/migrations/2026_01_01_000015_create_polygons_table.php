<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('polygons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('risk_zone_id')->constrained()->cascadeOnDelete();
            $table->string('name', 150)->nullable();
            $table->string('color', 20)->nullable();
            $table->decimal('stroke_width', 3, 1)->default(2.0);
            $table->string('fill_color', 20)->nullable();
            $table->decimal('fill_opacity', 3, 2)->default(0.3);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('risk_zone_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('polygons');
    }
};
