<?php

namespace App\Console\Commands;

use App\Services\PanicService;
use Illuminate\Console\Command;

class AutoExpirePanicAlerts extends Command
{
    protected $signature = 'panic:auto-expire';
    protected $description = 'Auto-expire stale panic alerts older than 6 hours';

    public function handle(PanicService $panicService): int
    {
        $expired = $panicService->autoExpireStaleAlerts();
        $this->info("Expired {$expired} stale panic alerts.");
        return Command::SUCCESS;
    }
}
