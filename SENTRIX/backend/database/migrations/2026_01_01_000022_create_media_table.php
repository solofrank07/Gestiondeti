<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->morphs('mediable');
            $table->enum('type', ['image', 'video', 'audio', 'document', 'other']);
            $table->string('filename', 255);
            $table->string('original_name', 255);
            $table->string('path', 500);
            $table->string('mime_type', 100);
            $table->integer('size_bytes')->nullable();
            $table->json('metadata')->nullable()->comment('dimensions, duration, etc.');
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index(['mediable_type', 'mediable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
