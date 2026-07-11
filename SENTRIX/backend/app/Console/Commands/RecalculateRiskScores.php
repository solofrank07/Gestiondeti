<?php

namespace App\Console\Commands;

use App\Services\HeatmapService;
use Illuminate\Console\Command;

class RecalculateRiskScores extends Command
{
    protected $signature = 'risk:recalculate';
    protected $description = 'Recalcula scores de todas las zonas de riesgo y limpia cache';

    public function handle(HeatmapService $heatmapService): int
    {
        $this->info('Recalculando scores de riesgo...');
        $heatmapService->recalculateAll();
        $this->info('Scores recalculados y caché limpiada.');
        return Command::SUCCESS;
    }
}
