<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CrimeTypeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('crime_types')->insert([
            ['name' => 'Robo', 'slug' => 'robo', 'severity_weight' => 6, 'icon' => 'robbery', 'color' => '#ef4444'],
            ['name' => 'Hurto', 'slug' => 'hurto', 'severity_weight' => 4, 'icon' => 'theft', 'color' => '#f97316'],
            ['name' => 'Asalto', 'slug' => 'asalto', 'severity_weight' => 8, 'icon' => 'assault', 'color' => '#dc2626'],
            ['name' => 'Violencia física', 'slug' => 'violencia-fisica', 'severity_weight' => 9, 'icon' => 'violence', 'color' => '#991b1b'],
            ['name' => 'Violencia doméstica', 'slug' => 'violencia-domestica', 'severity_weight' => 8, 'icon' => 'domestic', 'color' => '#be123c'],
            ['name' => 'Violación', 'slug' => 'violacion', 'severity_weight' => 10, 'icon' => 'assault', 'color' => '#881337'],
            ['name' => 'Homicidio', 'slug' => 'homicidio', 'severity_weight' => 10, 'icon' => 'murder', 'color' => '#450a0a'],
            ['name' => 'Secuestro', 'slug' => 'secuestro', 'severity_weight' => 10, 'icon' => 'kidnapping', 'color' => '#7f1d1d'],
            ['name' => 'Extorsión', 'slug' => 'extorsion', 'severity_weight' => 7, 'icon' => 'extortion', 'color' => '#9a3412'],
            ['name' => 'Microcomercialización de drogas', 'slug' => 'microcomercializacion-drogas', 'severity_weight' => 7, 'icon' => 'drugs', 'color' => '#4d7c0f'],
            ['name' => 'Pandillaje', 'slug' => 'pandillaje', 'severity_weight' => 6, 'icon' => 'gang', 'color' => '#a21caf'],
            ['name' => 'Vandalismo', 'slug' => 'vandalismo', 'severity_weight' => 4, 'icon' => 'vandalism', 'color' => '#9333ea'],
            ['name' => 'Usurpación', 'slug' => 'usurpacion', 'severity_weight' => 3, 'icon' => 'trespass', 'color' => '#6366f1'],
            ['name' => 'Estafa', 'slug' => 'estafa', 'severity_weight' => 5, 'icon' => 'fraud', 'color' => '#2563eb'],
            ['name' => 'Corrupción', 'slug' => 'corrupcion', 'severity_weight' => 8, 'icon' => 'corruption', 'color' => '#1d4ed8'],
        ]);
    }
}
