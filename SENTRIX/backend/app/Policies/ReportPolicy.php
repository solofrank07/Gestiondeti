<?php

namespace App\Policies;

use App\Enums\UserRole;
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
        return $user->id === $report->user_id || $user->hasRole(UserRole::Autoridad->value) || $user->hasRole(UserRole::Administrador->value);
    }

    public function create(User $user): bool
    {
        return $user->hasRole(UserRole::Ciudadano->value) || $user->hasRole(UserRole::Autoridad->value) || $user->hasRole(UserRole::Administrador->value);
    }

    public function update(User $user, Report $report): bool
    {
        return $user->id === $report->user_id || $user->hasRole(UserRole::Administrador->value);
    }

    public function delete(User $user, Report $report): bool
    {
        return $user->id === $report->user_id || $user->hasRole(UserRole::Administrador->value);
    }

    public function verify(User $user): bool
    {
        return $user->hasRole(UserRole::Autoridad->value) || $user->hasRole(UserRole::Administrador->value);
    }
}
