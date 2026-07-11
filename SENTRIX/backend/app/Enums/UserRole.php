<?php

namespace App\Enums;

enum UserRole: string
{
    case Administrador = 'Administrador';
    case Ciudadano = 'Ciudadano';
    case Autoridad = 'Autoridad';
}
