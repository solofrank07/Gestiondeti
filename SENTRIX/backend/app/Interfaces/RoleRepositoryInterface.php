<?php

namespace App\Interfaces;

use App\Models\Role;

interface RoleRepositoryInterface extends BaseRepositoryInterface
{
    public function findByName(string $name): ?Role;
}
