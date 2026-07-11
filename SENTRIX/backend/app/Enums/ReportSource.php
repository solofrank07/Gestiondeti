<?php

namespace App\Enums;

enum ReportSource: string
{
    case Ciudadano = 'ciudadano';
    case Oficial = 'oficial';
    case Etl = 'etl';
}
