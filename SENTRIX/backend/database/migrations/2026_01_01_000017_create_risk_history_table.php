<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('risk_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('risk_zone_id')->constrained()->cascadeOnDelete();
            $table->decimal('risk_score', 5, 2);
            $table->foreignId('risk_level_id')->nullable()->constrained('risk_levels')->nullOnDelete();
            $table->integer('crime_count')->default(0);
            $table->integer('reports_count')->default(0);
            $table->json('factors_breakdown')->nullable();
            $table->timestamp('calculated_at');
            $table->timestamps();

            $table->index('risk_zone_id');
            $table->index('calculated_at');
            $table->index(['risk_zone_id', 'calculated_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('risk_history');
    }
};
