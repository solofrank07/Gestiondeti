<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('urbanizations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('population_center_id')->constrained()->cascadeOnDelete();
            $table->string('name', 150);
            $table->enum('type', ['urbanizacion', 'asentamiento', 'barrio', 'comunidad', 'otro'])->default('urbanizacion');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('population_center_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('urbanizations');
    }
};
