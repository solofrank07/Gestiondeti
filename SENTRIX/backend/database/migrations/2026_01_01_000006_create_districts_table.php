<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('districts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('province_id')->constrained()->cascadeOnDelete();
            $table->string('code', 10)->unique();
            $table->string('name', 150);
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('area_km2', 10, 2)->nullable();
            $table->integer('population')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('province_id');
            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('districts');
    }
};
