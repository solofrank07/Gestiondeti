<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // ── Admin ──
        // test@example.com / password → Rol: Administrador
        $admin = User::factory()->create([
            'name' => 'Test Admin',
            'email' => 'test@example.com',
        ]);
        $admin->roles()->attach(1); // Administrador

        // ── Ciudadano de prueba ──
        // ciudadano@test.com / password → Rol: Ciudadano
        $citizen = User::factory()->create([
            'name' => 'Carlos Prueba',
            'email' => 'ciudadano@test.com',
        ]);
        $citizen->roles()->attach(2); // Ciudadano
    }
}
