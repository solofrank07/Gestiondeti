<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('categories')->insert([
            ['name' => 'Delitos contra la vida', 'slug' => 'delitos-contra-la-vida', 'description' => 'Homicidios, lesiones graves', 'parent_id' => null],
            ['name' => 'Delitos contra el patrimonio', 'slug' => 'delitos-contra-el-patrimonio', 'description' => 'Robos, hurtos, estafas', 'parent_id' => null],
            ['name' => 'Delitos contra la libertad', 'slug' => 'delitos-contra-la-libertad', 'description' => 'Secuestros, violaciones', 'parent_id' => null],
            ['name' => 'Delitos contra la seguridad', 'slug' => 'delitos-contra-la-seguridad', 'description' => 'Pandillaje, extorsión', 'parent_id' => null],
            ['name' => 'Faltas', 'slug' => 'faltas', 'description' => 'Vandalismo, usurpación', 'parent_id' => null],
            ['name' => 'Robo agravado', 'slug' => 'robo-agravado', 'description' => 'Robo con violencia o armas', 'parent_id' => 1],
            ['name' => 'Robo simple', 'slug' => 'robo-simple', 'description' => 'Robo sin violencia', 'parent_id' => 1],
        ]);
    }
}
