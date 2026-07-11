<?php

return [
    'critical_locations' => [
        ['name' => 'Hospital Regional de Piura', 'lat' => -5.195, 'lng' => -80.632, 'type' => 'hospital'],
        ['name' => 'Comisaría Piura', 'lat' => -5.198, 'lng' => -80.628, 'type' => 'police'],
        ['name' => 'Gobierno Regional Piura', 'lat' => -5.194, 'lng' => -80.634, 'type' => 'government'],
        ['name' => 'Universidad Nacional de Piura', 'lat' => -5.177, 'lng' => -80.608, 'type' => 'education'],
        ['name' => 'Plaza de Armas Piura', 'lat' => -5.194, 'lng' => -80.632, 'type' => 'public'],
    ],

    'heatmap' => [
        'cache_ttl_minutes' => 15,
        'max_grid_points' => 50000,
        'prewarm_enabled' => env('HEATMAP_PREWARM_ENABLED', false),
    ],

    'etl' => [
        'csv_max_rows' => 50000,
        'csv_max_size_mb' => 10,
        'batch_size' => 500,
        'dedup_window_hours' => 24,
        'sources' => [
            'ministerio-interior' => [
                'name' => 'Ministerio del Interior',
                'base_url' => env('ETL_MININTER_BASE_URL'),
                'api_key' => env('ETL_MININTER_API_KEY'),
                'enabled' => env('ETL_MININTER_ENABLED', false),
            ],
            'inei' => [
                'name' => 'INEI',
                'base_url' => env('ETL_INEI_BASE_URL'),
                'api_key' => env('ETL_INEI_API_KEY'),
                'enabled' => env('ETL_INEI_ENABLED', false),
            ],
        ],
    ],
];
