<?php

namespace App\Console\Commands;

use App\Services\HeatmapService;
use Illuminate\Console\Command;

class PrewarmHeatmapCache extends Command
{
    protected $signature = 'heatmap:prewarm {region? : ID de región a precalentar}';
    protected $description = 'Precalcula tiles de heatmap populares para mejorar rendimiento';

    public function handle(HeatmapService $heatmapService): int
    {
        $regionId = (int) ($this->argument('region') ?? 1);
        $this->info("Precalentando heatmap para región {$regionId}...");

        $heatmapService->prewarmPopularTiles($regionId);

        $this->info('Precalentamiento completado.');
        return Command::SUCCESS;
    }
}
