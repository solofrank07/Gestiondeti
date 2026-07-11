<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('geofence_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('risk_zone_id')->constrained()->cascadeOnDelete();
            $table->enum('event', ['entry', 'exit', 'dwelling']);
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->decimal('distance_to_center', 10, 2)->nullable();
            $table->json('notification_sent')->nullable();
            $table->timestamp('event_at');
            $table->timestamps();

            $table->index('user_id');
            $table->index('risk_zone_id');
            $table->index('event');
            $table->index('event_at');
            $table->index(['user_id', 'event_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('geofence_logs');
    }
};
