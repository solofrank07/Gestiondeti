<?php

return [
    // Distancia en metros para considerar que un reporte cae dentro de un
    // "punto picante" (zona de riesgo activa ya existente).
    'proximity_threshold_meters' => 300,

    // Clasificacion del HOTSPOT segun cantidad de incidencias (reportes
    // aceptados) acumuladas en la zona. Es independiente de cualquier
    // clasificacion a nivel de reporte individual. Los slugs deben existir
    // en la tabla risk_levels. Un hotspot ya es una zona confirmada de
    // riesgo (hubo reportes aceptados ahi), por eso arranca en "medio"
    // (amarillo) y nunca usa tonos verdes (muy-bajo/bajo).
    'classification_tiers' => [
        'medio' => ['min' => 1, 'max' => 3],
        'alto' => ['min' => 4, 'max' => 8],
        'critico' => ['min' => 9, 'max' => null], // null = sin tope
    ],

    // Radio por defecto al crear un hotspot nuevo, si el reporte que lo
    // origina no trae un radius propio.
    'default_hotspot_radius_meters' => 500,
];
