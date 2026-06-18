<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\AuthUserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
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

        $token = $user->createToken($data['device_name'] ?? 'api-client')->plainTextToken;

        return response()->json([
            'message' => __('api.auth.logged_in'),
            'token' => [
                'access_token' => $token,
                'token_type' => 'Bearer',
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
