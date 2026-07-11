<?php

namespace App\Policies;

use App\Models\Report;
use App\Models\User;

class ReportPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Report $report): bool
    {
        return $user->id === $report->user_id || $user->hasRole('Autoridad') || $user->hasRole('Administrador');
    }

    public function create(User $user): bool
    {
        return $user->hasRole('Ciudadano') || $user->hasRole('Autoridad') || $user->hasRole('Administrador');
    }

    public function update(User $user, Report $report): bool
    {
        return $user->id === $report->user_id || $user->hasRole('Administrador');
    }

    public function delete(User $user, Report $report): bool
    {
        return $user->id === $report->user_id || $user->hasRole('Administrador');
    }

    public function verify(User $user): bool
    {
        return $user->hasRole('Autoridad') || $user->hasRole('Administrador');
    }
}
