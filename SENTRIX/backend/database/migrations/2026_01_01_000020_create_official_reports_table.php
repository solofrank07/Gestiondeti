<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('official_reports', function (Blueprint $table) {
            $table->id();
            $table->string('external_id', 100)->unique()->comment('ID de la fuente oficial');
            $table->string('source', 100)->comment('Ministerio del Interior, INEI, etc.');
            $table->foreignId('crime_type_id')->nullable()->constrained('crime_types')->nullOnDelete();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->timestamp('incident_date');
            $table->string('severity', 20)->nullable();
            $table->string('status', 50)->nullable();
            $table->json('raw_data')->nullable();
            $table->timestamp('imported_at');
            $table->timestamps();

            $table->index('source');
            $table->index('incident_date');
            $table->index(['latitude', 'longitude']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('official_reports');
    }
};
