<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\AuthUserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        $user = DB::transaction(function () use ($data): User {
            $user = User::create([
                'name'             => $data['name'],
                'email'            => $data['email'],
                'password'         => $data['password'],
                'preferred_locale' => $data['preferred_locale'] ?? app()->getLocale(),
                'registered_via'   => 'local',
            ]);

            $user->authProviders()->create([
                'provider' => 'local',
                'linked_at' => now(),
            ]);

            return $user;
        });

        $token = $user->createToken($data['device_name'] ?? 'api-client')->plainTextToken;

        // Keep flat response shape — tests and existing frontend depend on this structure.
        return response()->json([
            'message' => __('api.auth.registered'),
            'token'   => [
                'access_token' => $token,
                'token_type'   => 'Bearer',
            ],
            'user' => AuthUserResource::make($user),
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $data = $request->validated();

        $user = User::query()
            ->where('email', $data['email'])
            ->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => __('api.auth.failed'),
            ]);
        }

        $user->touchLastLogin();
        $user->authProviders()
            ->firstOrCreate(['provider' => 'local'], ['linked_at' => now()])
            ->update(['last_used_at' => now()]);

        $token = $user->createToken($data['device_name'] ?? 'api-client')->plainTextToken;

        return response()->json([
            'message' => __('api.auth.logged_in'),
            'token'   => [
                'access_token' => $token,
                'token_type'   => 'Bearer',
            ],
            'user' => AuthUserResource::make($user),
        ]);
    }

    public function me(Request $request)
    {
        return AuthUserResource::make($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => __('api.auth.logged_out'),
        ]);
    }

    public function logoutAll(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => __('api.auth.logged_out_all'),
        ]);
    }
}
