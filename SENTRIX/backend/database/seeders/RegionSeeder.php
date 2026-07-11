<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RegionSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('regions')->insert([
            'code' => 'PIU',
            'name' => 'Piura',
            'capital' => 'Piura',
            'latitude' => -5.194,
            'longitude' => -80.632,
            'is_active' => true,
            'created_at' => now(),
        ]);

        DB::table('provinces')->insert([
            ['region_id' => 1, 'code' => 'PIU-01', 'name' => 'Piura', 'capital' => 'Piura', 'latitude' => -5.194, 'longitude' => -80.632],
            ['region_id' => 1, 'code' => 'PIU-02', 'name' => 'Sullana', 'capital' => 'Sullana', 'latitude' => -4.904, 'longitude' => -80.685],
            ['region_id' => 1, 'code' => 'PIU-03', 'name' => 'Talara', 'capital' => 'Talara', 'latitude' => -4.577, 'longitude' => -81.272],
            ['region_id' => 1, 'code' => 'PIU-04', 'name' => 'Paita', 'capital' => 'Paita', 'latitude' => -5.089, 'longitude' => -81.114],
            ['region_id' => 1, 'code' => 'PIU-05', 'name' => 'Sechura', 'capital' => 'Sechura', 'latitude' => -5.557, 'longitude' => -80.822],
            ['region_id' => 1, 'code' => 'PIU-06', 'name' => 'Morropón', 'capital' => 'Chulucanas', 'latitude' => -5.093, 'longitude' => -80.162],
            ['region_id' => 1, 'code' => 'PIU-07', 'name' => 'Ayabaca', 'capital' => 'Ayabaca', 'latitude' => -4.637, 'longitude' => -79.714],
            ['region_id' => 1, 'code' => 'PIU-08', 'name' => 'Huancabamba', 'capital' => 'Huancabamba', 'latitude' => -5.239, 'longitude' => -79.451],
        ]);

        $districts = [
            // Piura (10 districts)
            ['province_code' => 'PIU-01', 'code' => 'PIU-01-01', 'name' => 'Piura', 'latitude' => -5.194, 'longitude' => -80.632],
            ['province_code' => 'PIU-01', 'code' => 'PIU-01-02', 'name' => 'Castilla', 'latitude' => -5.203, 'longitude' => -80.624],
            ['province_code' => 'PIU-01', 'code' => 'PIU-01-03', 'name' => 'Catacaos', 'latitude' => -5.265, 'longitude' => -80.677],
            ['province_code' => 'PIU-01', 'code' => 'PIU-01-04', 'name' => 'Cura Mori', 'latitude' => -5.327, 'longitude' => -80.665],
            ['province_code' => 'PIU-01', 'code' => 'PIU-01-05', 'name' => 'El Tallán', 'latitude' => -5.427, 'longitude' => -80.682],
            ['province_code' => 'PIU-01', 'code' => 'PIU-01-06', 'name' => 'La Arena', 'latitude' => -5.347, 'longitude' => -80.717],
            ['province_code' => 'PIU-01', 'code' => 'PIU-01-07', 'name' => 'La Unión', 'latitude' => -5.402, 'longitude' => -80.742],
            ['province_code' => 'PIU-01', 'code' => 'PIU-01-08', 'name' => 'Las Lomas', 'latitude' => -4.658, 'longitude' => -80.248],
            ['province_code' => 'PIU-01', 'code' => 'PIU-01-09', 'name' => 'Tambo Grande', 'latitude' => -4.930, 'longitude' => -80.340],
            ['province_code' => 'PIU-01', 'code' => 'PIU-01-10', 'name' => 'Veintiséis de Octubre', 'latitude' => -5.175, 'longitude' => -80.650],

            // Sullana (8 districts)
            ['province_code' => 'PIU-02', 'code' => 'PIU-02-01', 'name' => 'Sullana', 'latitude' => -4.904, 'longitude' => -80.685],
            ['province_code' => 'PIU-02', 'code' => 'PIU-02-02', 'name' => 'Bellavista', 'latitude' => -4.888, 'longitude' => -80.677],
            ['province_code' => 'PIU-02', 'code' => 'PIU-02-03', 'name' => 'Ignacio Escudero', 'latitude' => -4.841, 'longitude' => -80.870],
            ['province_code' => 'PIU-02', 'code' => 'PIU-02-04', 'name' => 'Lancones', 'latitude' => -4.659, 'longitude' => -80.553],
            ['province_code' => 'PIU-02', 'code' => 'PIU-02-05', 'name' => 'Marcavelica', 'latitude' => -4.884, 'longitude' => -80.710],
            ['province_code' => 'PIU-02', 'code' => 'PIU-02-06', 'name' => 'Miguel Checa', 'latitude' => -4.937, 'longitude' => -80.823],
            ['province_code' => 'PIU-02', 'code' => 'PIU-02-07', 'name' => 'Querecotillo', 'latitude' => -4.839, 'longitude' => -80.646],
            ['province_code' => 'PIU-02', 'code' => 'PIU-02-08', 'name' => 'Salitral', 'latitude' => -4.857, 'longitude' => -80.681],

            // Talara (6 districts)
            ['province_code' => 'PIU-03', 'code' => 'PIU-03-01', 'name' => 'Pariñas', 'latitude' => -4.577, 'longitude' => -81.272],
            ['province_code' => 'PIU-03', 'code' => 'PIU-03-02', 'name' => 'El Alto', 'latitude' => -4.269, 'longitude' => -81.218],
            ['province_code' => 'PIU-03', 'code' => 'PIU-03-03', 'name' => 'La Brea', 'latitude' => -4.656, 'longitude' => -81.305],
            ['province_code' => 'PIU-03', 'code' => 'PIU-03-04', 'name' => 'Lobitos', 'latitude' => -4.453, 'longitude' => -81.282],
            ['province_code' => 'PIU-03', 'code' => 'PIU-03-05', 'name' => 'Los Órganos', 'latitude' => -4.175, 'longitude' => -81.129],
            ['province_code' => 'PIU-03', 'code' => 'PIU-03-06', 'name' => 'Máncora', 'latitude' => -4.102, 'longitude' => -81.047],

            // Paita (7 districts)
            ['province_code' => 'PIU-04', 'code' => 'PIU-04-01', 'name' => 'Paita', 'latitude' => -5.089, 'longitude' => -81.114],
            ['province_code' => 'PIU-04', 'code' => 'PIU-04-02', 'name' => 'Amotape', 'latitude' => -4.882, 'longitude' => -81.016],
            ['province_code' => 'PIU-04', 'code' => 'PIU-04-03', 'name' => 'Arenal', 'latitude' => -4.883, 'longitude' => -81.035],
            ['province_code' => 'PIU-04', 'code' => 'PIU-04-04', 'name' => 'Colán', 'latitude' => -5.012, 'longitude' => -81.066],
            ['province_code' => 'PIU-04', 'code' => 'PIU-04-05', 'name' => 'La Huaca', 'latitude' => -4.912, 'longitude' => -80.961],
            ['province_code' => 'PIU-04', 'code' => 'PIU-04-06', 'name' => 'Tamarindo', 'latitude' => -4.877, 'longitude' => -80.976],
            ['province_code' => 'PIU-04', 'code' => 'PIU-04-07', 'name' => 'Vichayal', 'latitude' => -4.914, 'longitude' => -81.074],

            // Sechura (6 districts)
            ['province_code' => 'PIU-05', 'code' => 'PIU-05-01', 'name' => 'Sechura', 'latitude' => -5.557, 'longitude' => -80.822],
            ['province_code' => 'PIU-05', 'code' => 'PIU-05-02', 'name' => 'Bellavista de la Unión', 'latitude' => -5.436, 'longitude' => -80.755],
            ['province_code' => 'PIU-05', 'code' => 'PIU-05-03', 'name' => 'Bernal', 'latitude' => -5.464, 'longitude' => -80.752],
            ['province_code' => 'PIU-05', 'code' => 'PIU-05-04', 'name' => 'Cristo Nos Valga', 'latitude' => -5.488, 'longitude' => -80.795],
            ['province_code' => 'PIU-05', 'code' => 'PIU-05-05', 'name' => 'Rinconada Llicuar', 'latitude' => -5.483, 'longitude' => -80.770],
            ['province_code' => 'PIU-05', 'code' => 'PIU-05-06', 'name' => 'Vice', 'latitude' => -5.422, 'longitude' => -80.775],

            // Morropón (10 districts)
            ['province_code' => 'PIU-06', 'code' => 'PIU-06-01', 'name' => 'Chulucanas', 'latitude' => -5.093, 'longitude' => -80.162],
            ['province_code' => 'PIU-06', 'code' => 'PIU-06-02', 'name' => 'Buenos Aires', 'latitude' => -5.261, 'longitude' => -79.964],
            ['province_code' => 'PIU-06', 'code' => 'PIU-06-03', 'name' => 'Chalaco', 'latitude' => -5.042, 'longitude' => -79.795],
            ['province_code' => 'PIU-06', 'code' => 'PIU-06-04', 'name' => 'La Matanza', 'latitude' => -5.213, 'longitude' => -80.092],
            ['province_code' => 'PIU-06', 'code' => 'PIU-06-05', 'name' => 'Morropón', 'latitude' => -5.185, 'longitude' => -79.970],
            ['province_code' => 'PIU-06', 'code' => 'PIU-06-06', 'name' => 'Salitral', 'latitude' => -5.321, 'longitude' => -79.815],
            ['province_code' => 'PIU-06', 'code' => 'PIU-06-07', 'name' => 'San Juan de Bigote', 'latitude' => -5.327, 'longitude' => -79.782],
            ['province_code' => 'PIU-06', 'code' => 'PIU-06-08', 'name' => 'Santa Catalina de Mossa', 'latitude' => -5.102, 'longitude' => -79.890],
            ['province_code' => 'PIU-06', 'code' => 'PIU-06-09', 'name' => 'Santo Domingo', 'latitude' => -5.032, 'longitude' => -79.880],
            ['province_code' => 'PIU-06', 'code' => 'PIU-06-10', 'name' => 'Yamango', 'latitude' => -5.180, 'longitude' => -79.749],

            // Ayabaca (10 districts)
            ['province_code' => 'PIU-07', 'code' => 'PIU-07-01', 'name' => 'Ayabaca', 'latitude' => -4.637, 'longitude' => -79.714],
            ['province_code' => 'PIU-07', 'code' => 'PIU-07-02', 'name' => 'Frías', 'latitude' => -4.928, 'longitude' => -79.941],
            ['province_code' => 'PIU-07', 'code' => 'PIU-07-03', 'name' => 'Jililí', 'latitude' => -4.589, 'longitude' => -79.793],
            ['province_code' => 'PIU-07', 'code' => 'PIU-07-04', 'name' => 'Lagunas', 'latitude' => -4.747, 'longitude' => -79.798],
            ['province_code' => 'PIU-07', 'code' => 'PIU-07-05', 'name' => 'Montero', 'latitude' => -4.631, 'longitude' => -79.824],
            ['province_code' => 'PIU-07', 'code' => 'PIU-07-06', 'name' => 'Pacaipampa', 'latitude' => -4.994, 'longitude' => -79.664],
            ['province_code' => 'PIU-07', 'code' => 'PIU-07-07', 'name' => 'Paimas', 'latitude' => -4.638, 'longitude' => -79.938],
            ['province_code' => 'PIU-07', 'code' => 'PIU-07-08', 'name' => 'Sapillica', 'latitude' => -4.780, 'longitude' => -79.982],
            ['province_code' => 'PIU-07', 'code' => 'PIU-07-09', 'name' => 'Sícchez', 'latitude' => -4.567, 'longitude' => -79.764],
            ['province_code' => 'PIU-07', 'code' => 'PIU-07-10', 'name' => 'Suyo', 'latitude' => -4.514, 'longitude' => -79.999],

            // Huancabamba (8 districts)
            ['province_code' => 'PIU-08', 'code' => 'PIU-08-01', 'name' => 'Huancabamba', 'latitude' => -5.239, 'longitude' => -79.451],
            ['province_code' => 'PIU-08', 'code' => 'PIU-08-02', 'name' => 'Canchaque', 'latitude' => -5.376, 'longitude' => -79.607],
            ['province_code' => 'PIU-08', 'code' => 'PIU-08-03', 'name' => 'El Carmen de la Frontera', 'latitude' => -5.148, 'longitude' => -79.396],
            ['province_code' => 'PIU-08', 'code' => 'PIU-08-04', 'name' => 'Huarmaca', 'latitude' => -5.567, 'longitude' => -79.523],
            ['province_code' => 'PIU-08', 'code' => 'PIU-08-05', 'name' => 'Lalaquiz', 'latitude' => -5.226, 'longitude' => -79.668],
            ['province_code' => 'PIU-08', 'code' => 'PIU-08-06', 'name' => 'San Miguel de El Faique', 'latitude' => -5.403, 'longitude' => -79.605],
            ['province_code' => 'PIU-08', 'code' => 'PIU-08-07', 'name' => 'Sondor', 'latitude' => -5.316, 'longitude' => -79.388],
            ['province_code' => 'PIU-08', 'code' => 'PIU-08-08', 'name' => 'Sondorillo', 'latitude' => -5.337, 'longitude' => -79.433],
        ];

        $provinceIds = DB::table('provinces')->pluck('id', 'code');

        foreach ($districts as $district) {
            $provinceCode = $district['province_code'];
            unset($district['province_code']);
            $district['province_id'] = $provinceIds[$provinceCode];
            $district['is_active'] = true;
            $district['created_at'] = now();
            DB::table('districts')->insert($district);
        }
    }
}
