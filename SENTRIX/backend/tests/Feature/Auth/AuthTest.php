<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private array $userData;
    private string $password = 'TestPass123!';

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'Ciudadano', 'description' => 'Usuario ciudadano']);
        Role::create(['name' => 'Autoridad', 'description' => 'Autoridad PNP/Serenazgo']);
        Role::create(['name' => 'Administrador', 'description' => 'Administrador del sistema']);

        $this->userData = [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'password' => $this->password,
            'password_confirmation' => $this->password,
            'phone' => '987654321',
        ];
    }

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', $this->userData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'name', 'email', 'roles'],
                'token',
                'token_type',
            ]);

        $this->assertDatabaseHas('users', ['email' => $this->userData['email']]);
    }

    public function test_user_gets_ciudadano_role_on_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', $this->userData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('user_roles', [
            'user_id' => $response['user']['id'],
        ]);
    }

    public function test_cannot_register_with_existing_email(): void
    {
        $this->postJson('/api/v1/auth/register', $this->userData);
        $response = $this->postJson('/api/v1/auth/register', $this->userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_login(): void
    {
        $this->postJson('/api/v1/auth/register', $this->userData);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $this->userData['email'],
            'password' => $this->password,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'name', 'email', 'roles'],
                'token',
                'token_type',
            ]);
    }

    public function test_cannot_login_with_invalid_credentials(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'nonexistent@test.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_authenticated_user_can_access_profile(): void
    {
        $this->postJson('/api/v1/auth/register', $this->userData);
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $this->userData['email'],
            'password' => $this->password,
        ]);

        $token = $loginResponse['token'];
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/profile');

        $response->assertStatus(200)
            ->assertJsonStructure(['id', 'name', 'email', 'roles']);
    }

    public function test_unauthenticated_user_cannot_access_profile(): void
    {
        $response = $this->getJson('/api/v1/auth/profile');
        $response->assertStatus(401);
    }

    public function test_user_can_logout(): void
    {
        $this->postJson('/api/v1/auth/register', $this->userData);
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $this->userData['email'],
            'password' => $this->password,
        ]);

        $token = $loginResponse['token'];
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Sesión cerrada correctamente.']);
    }

    public function test_user_can_change_password(): void
    {
        $this->postJson('/api/v1/auth/register', $this->userData);
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $this->userData['email'],
            'password' => $this->password,
        ]);

        $token = $loginResponse['token'];
        $newPassword = 'NewPass456!';

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/auth/change-password', [
                'current_password' => $this->password,
                'new_password' => $newPassword,
                'new_password_confirmation' => $newPassword,
            ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Contraseña actualizada correctamente.']);

        $loginWithNew = $this->postJson('/api/v1/auth/login', [
            'email' => $this->userData['email'],
            'password' => $newPassword,
        ]);
        $loginWithNew->assertStatus(200);
    }

    public function test_user_can_refresh_token(): void
    {
        $this->postJson('/api/v1/auth/register', $this->userData);
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $this->userData['email'],
            'password' => $this->password,
        ]);

        $token = $loginResponse['token'];
        $response = $this->postJson('/api/v1/auth/refresh', ['token' => $token]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user', 'token', 'token_type']);
    }

    public function test_role_middleware_blocks_unauthorized(): void
    {
        $this->postJson('/api/v1/auth/register', $this->userData);
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $this->userData['email'],
            'password' => $this->password,
        ]);

        $token = $loginResponse['token'];
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/dashboard/summary');

        $response->assertStatus(403);
    }

    public function test_authority_can_access_dashboard(): void
    {
        $user = User::create([
            'name' => 'Test Authority',
            'email' => 'authority@test.com',
            'password' => bcrypt($this->password),
        ]);
        $role = Role::where('name', 'Autoridad')->first();
        $user->roles()->attach($role->id);

        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'authority@test.com',
            'password' => $this->password,
        ]);

        $token = $loginResponse['token'];
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/dashboard/summary');

        $response->assertStatus(200);
    }

    public function test_user_can_update_profile(): void
    {
        $this->postJson('/api/v1/auth/register', $this->userData);
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $this->userData['email'],
            'password' => $this->password,
        ]);

        $token = $loginResponse['token'];
        $newName = 'Updated Name';

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson('/api/v1/auth/profile', ['name' => $newName]);

        $response->assertStatus(200)
            ->assertJsonPath('name', $newName);
    }

    public function test_login_updates_last_active_at(): void
    {
        $this->postJson('/api/v1/auth/register', $this->userData);
        $this->postJson('/api/v1/auth/login', [
            'email' => $this->userData['email'],
            'password' => $this->password,
        ]);

        $user = User::where('email', $this->userData['email'])->first();
        $this->assertNotNull($user->last_active_at);
    }

    public function test_password_minimum_length(): void
    {
        $response = $this->postJson('/api/v1/auth/register', array_merge($this->userData, [
            'password' => '123',
            'password_confirmation' => '123',
        ]));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_email_format_validation(): void
    {
        $response = $this->postJson('/api/v1/auth/register', array_merge($this->userData, [
            'email' => 'invalid-email',
        ]));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }
}
