<?php

namespace App\Enums;

enum GeofenceEvent: string
{
    case Entry = 'entry';
    case Exit = 'exit';
    case Dwelling = 'dwelling';
}
