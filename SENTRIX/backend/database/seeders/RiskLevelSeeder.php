<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RiskLevelSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('risk_levels')->insert([
            ['name' => 'Muy Bajo', 'slug' => 'muy-bajo', 'min_score' => 0, 'max_score' => 20, 'color' => '#22c55e', 'description' => 'Zona segura, sin incidencias significativas'],
            ['name' => 'Bajo', 'slug' => 'bajo', 'min_score' => 21, 'max_score' => 40, 'color' => '#84cc16', 'description' => 'Zona con baja incidencia delictiva'],
            ['name' => 'Medio', 'slug' => 'medio', 'min_score' => 41, 'max_score' => 60, 'color' => '#eab308', 'description' => 'Zona con incidencia moderada, precaución'],
            ['name' => 'Alto', 'slug' => 'alto', 'min_score' => 61, 'max_score' => 80, 'color' => '#f97316', 'description' => 'Zona peligrosa, evitar tránsito nocturno'],
            ['name' => 'Crítico', 'slug' => 'critico', 'min_score' => 81, 'max_score' => 100, 'color' => '#ef4444', 'description' => 'Zona extremadamente peligrosa, no ingresar'],
        ]);
    }
}
