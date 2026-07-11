<?php

namespace App\Enums;

enum ReportPriority: string
{
    case Baja = 'baja';
    case Media = 'media';
    case Alta = 'alta';
    case Critica = 'critica';
}
