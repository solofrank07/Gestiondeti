<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('risk_zones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sector_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name', 200);
            $table->text('description')->nullable();
            $table->decimal('risk_score', 5, 2)->default(0)->comment('0-100');
            $table->foreignId('risk_level_id')->nullable()->constrained('risk_levels')->nullOnDelete();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->integer('crime_count')->default(0);
            $table->integer('citizen_reports_count')->default(0);
            $table->integer('official_reports_count')->default(0);
            $table->json('boundaries')->nullable();
            $table->decimal('radius_meters', 10, 2)->default(500);
            $table->decimal('area_km2', 10, 2)->nullable();
            $table->timestamp('calculated_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('sector_id');
            $table->index('risk_level_id');
            $table->index('risk_score');
            $table->index(['latitude', 'longitude']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('risk_zones');
    }
};
