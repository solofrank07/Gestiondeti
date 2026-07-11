<?php

namespace App\Enums;

enum RiskLevel: string
{
    case MuyBajo = 'muy-bajo';
    case Bajo = 'bajo';
    case Medio = 'medio';
    case Alto = 'alto';
    case Critico = 'critico';

    public static function fromScore(int $score): self
    {
        return match (true) {
            $score <= 20 => self::MuyBajo,
            $score <= 40 => self::Bajo,
            $score <= 60 => self::Medio,
            $score <= 80 => self::Alto,
            default => self::Critico,
        };
    }
}
