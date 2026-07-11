<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('roles')->insert([
            ['name' => 'Administrador', 'description' => 'Acceso total al sistema', 'created_at' => now()],
            ['name' => 'Ciudadano', 'description' => 'Usuario ciudadano: reportar incidentes', 'created_at' => now()],
            ['name' => 'Autoridad', 'description' => 'PNP / Serenazgo: dashboard y gestión', 'created_at' => now()],
        ]);
    }
}
