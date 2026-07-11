<?php

namespace App\Repositories;

use App\Interfaces\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    public function __construct()
    {
        parent::__construct(new User());
    }

    public function findByEmail(string $email): ?User
    {
        return $this->model->where('email', $email)->first();
    }

    public function findWithRoles(int $id): ?User
    {
        return $this->model->with('roles')->find($id);
    }

    public function getByRole(string $role): Collection
    {
        return $this->model->whereHas('roles', fn($q) => $q->where('name', $role))->get();
    }

    public function updateLocation(int $userId, float $lat, float $lng): User
    {
        $user = $this->findOrFail($userId);
        $user->update([
            'last_lat' => $lat,
            'last_lng' => $lng,
            'last_active_at' => now(),
        ]);
        return $user->fresh();
    }

    public function getActiveUsers(): Collection
    {
        return $this->model->where('is_active', true)->get();
    }
}
