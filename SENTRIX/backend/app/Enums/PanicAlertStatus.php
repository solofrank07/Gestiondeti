<?php

namespace App\Enums;

enum PanicAlertStatus: string
{
    case Activo = 'activo';
    case Atendido = 'atendido';
    case FalsoAlarma = 'falso_alarma';
}
