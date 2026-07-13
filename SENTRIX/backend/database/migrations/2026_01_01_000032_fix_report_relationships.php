<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ========== CITIZEN REPORTS ==========
        Schema::table('citizen_reports', function (Blueprint $table) {
            // Crime type categorization (was missing entirely)
            $table->foreignId('crime_type_id')->nullable()->after('incident_date')
                ->constrained('crime_types')->nullOnDelete();

            // Category for finer classification
            $table->foreignId('category_id')->nullable()->after('crime_type_id')
                ->constrained('categories')->nullOnDelete();

            // Link to unified report (when processed)
            $table->foreignId('report_id')->nullable()->after('id')
                ->unique()
                ->constrained('reports')->nullOnDelete();
        });

        // ========== OFFICIAL REPORTS ==========
        Schema::table('official_reports', function (Blueprint $table) {
            // Category (was missing)
            $table->foreignId('category_id')->nullable()->after('crime_type_id')
                ->constrained('categories')->nullOnDelete();

            // Link to canonical report status (status VARCHAR kept for original source value)
            $table->foreignId('report_status_id')->nullable()->after('status')
                ->constrained('report_status')->nullOnDelete();

            // Link to unified report (when processed)
            $table->foreignId('report_id')->nullable()->after('id')
                ->unique()
                ->constrained('reports')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('citizen_reports', function (Blueprint $table) {
            $table->dropConstrainedForeignId('crime_type_id');
            $table->dropConstrainedForeignId('category_id');
            $table->dropConstrainedForeignId('report_id');
        });

        Schema::table('official_reports', function (Blueprint $table) {
            $table->dropConstrainedForeignId('category_id');
            $table->dropConstrainedForeignId('report_status_id');
            $table->dropConstrainedForeignId('report_id');
        });
    }
};
