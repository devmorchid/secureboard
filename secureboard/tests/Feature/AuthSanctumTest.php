<?php

namespace Tests\Feature;

use Database\Seeders\LaratrustSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthSanctumTest extends TestCase
{
    use RefreshDatabase;

    public function test_csrf_and_login_and_get_user()
    {
        $this->seed(LaratrustSeeder::class);

        // Call CSRF cookie endpoint
        $response = $this->get('/sanctum/csrf-cookie');
        $response->assertStatus(204)->assertHeader('Set-Cookie');

        // Attempt login
        $login = $this->postJson('/login', [
            'email' => 'admin@local',
            'password' => 'password',
        ]);

        $login->assertStatus(200)->assertJsonStructure(['message','user' => ['id','name','email']]);

        // Authenticated request to /api/user
        $user = $this->getJson('/api/user');
        $user->assertStatus(200)->assertJsonStructure(['id','name','email']);
    }
}
