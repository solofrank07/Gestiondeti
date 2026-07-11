<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sectors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('urbanization_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name', 150);
            $table->string('code', 20)->nullable()->unique();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('urbanization_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sectors');
    }
};
