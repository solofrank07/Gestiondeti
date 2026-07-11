<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReportStatusSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('report_status')->insert([
            ['name' => 'Pendiente', 'slug' => 'pendiente', 'description' => 'Reporte recibido, pendiente de revisión', 'color' => '#eab308'],
            ['name' => 'En revisión', 'slug' => 'en-revision', 'description' => 'Autoridades están evaluando el reporte', 'color' => '#3b82f6'],
            ['name' => 'Verificado', 'slug' => 'verificado', 'description' => 'Reporte confirmado por autoridades', 'color' => '#22c55e'],
            ['name' => 'Rechazado', 'slug' => 'rechazado', 'description' => 'Reporte descartado tras evaluación', 'color' => '#ef4444'],
            ['name' => 'Cerrado', 'slug' => 'cerrado', 'description' => 'Caso resuelto o archivado', 'color' => '#6b7280'],
        ]);
    }
}
