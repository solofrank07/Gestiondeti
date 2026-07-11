<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('polygon_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('polygon_id')->constrained()->cascadeOnDelete();
            $table->integer('order');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->timestamps();

            $table->index('polygon_id');
            $table->index(['polygon_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('polygon_points');
    }
};
