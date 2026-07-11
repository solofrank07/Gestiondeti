<?php

namespace App\Interfaces;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface UserRepositoryInterface extends BaseRepositoryInterface
{
    public function findByEmail(string $email): ?User;
    public function findWithRoles(int $id): ?User;
    public function getByRole(string $role): Collection;
    public function updateLocation(int $userId, float $lat, float $lng): User;
    public function getActiveUsers(): Collection;
}
