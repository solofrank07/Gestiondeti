<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('panic:auto-expire')->everyThirtyMinutes();
Schedule::command('etl:fetch ministerio-interior')->dailyAt('02:00');
Schedule::command('etl:fetch inei')->dailyAt('03:00');
