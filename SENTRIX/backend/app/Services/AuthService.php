<?php

namespace App\Services;

use App\Interfaces\UserRepositoryInterface;
use App\Interfaces\RoleRepositoryInterface;
use App\Models\User;
use App\Notifications\PasswordReset;
use Illuminate\Auth\Events\PasswordReset as PasswordResetEvent;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class AuthService
{
    public function __construct(
        private UserRepositoryInterface $userRepo,
        private RoleRepositoryInterface $roleRepo,
    ) {}

    public function register(array $data): array
    {
        $data['password'] = Hash::make($data['password']);
        $user = $this->userRepo->create($data);
        $role = $this->roleRepo->findByName('Ciudadano');
        if ($role) {
            $user->roles()->attach($role->id);
        }
        $user->load('roles');
        $token = $user->createToken('sentrix-token')->plainTextToken;
        return ['user' => $user, 'token' => $token];
    }

    public function login(string $email, string $password): array
    {
        $user = $this->userRepo->findByEmail($email);
        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages(['email' => ['Credenciales incorrectas.']]);
        }
        $user->update(['last_active_at' => now()]);
        $token = $user->createToken('sentrix-token', $user->roles->pluck('name')->toArray())->plainTextToken;
        return ['user' => $user->load('roles'), 'token' => $token, 'token_type' => 'Bearer'];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    public function logoutAllDevices(User $user): void
    {
        $user->tokens()->delete();
    }

    public function refreshToken(string $token): array
    {
        $accessToken = PersonalAccessToken::findToken($token);
        if (!$accessToken) {
            throw ValidationException::withMessages(['token' => ['Token inválido o expirado.']]);
        }
        $user = $accessToken->tokenable;
        $accessToken->delete();
        $newToken = $user->createToken('sentrix-token', $user->roles->pluck('name')->toArray())->plainTextToken;
        return ['user' => $user->load('roles'), 'token' => $newToken, 'token_type' => 'Bearer'];
    }

    public function updateProfile(User $user, array $data): User
    {
        $user->update($data);
        return $user->fresh()->load('roles');
    }

    public function changePassword(User $user, string $currentPassword, string $newPassword): User
    {
        if (!Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages(['current_password' => ['Contraseña actual incorrecta.']]);
        }
        $user->update(['password' => Hash::make($newPassword)]);
        return $user->fresh();
    }

    public function forgotPassword(string $email): string
    {
        $user = $this->userRepo->findByEmail($email);
        if (!$user) {
            throw ValidationException::withMessages(['email' => ['Email no registrado.']]);
        }
        $token = Password::createToken($user);
        $user->notify(new PasswordReset($token));
        return $token;
    }

    public function resetPassword(array $data): void
    {
        $status = Password::reset(
            $data,
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->setRememberToken(Str::random(60));
                $user->save();
                event(new PasswordResetEvent($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages(['email' => [__($status)]]);
        }
    }
}
