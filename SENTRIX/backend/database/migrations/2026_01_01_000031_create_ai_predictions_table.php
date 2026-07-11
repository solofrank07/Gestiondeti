<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_predictions', function (Blueprint $table) {
            $table->id();
            $table->string('type', 50)->comment('pattern, risk_forecast, critical_zone, classification');
            $table->morphs('predictable');
            $table->json('prediction');
            $table->decimal('confidence', 5, 2)->default(0);
            $table->json('features')->nullable()->comment('Input features used for prediction');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index('type');
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_predictions');
    }
};
