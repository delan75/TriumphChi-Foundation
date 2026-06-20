<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuthAuditLogger;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function __construct(private readonly AuthAuditLogger $auditLogger)
    {
    }

    /**
     * Send a password reset link to the given user.
     * Prevents email enumeration by always returning a generic success message.
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::query()->where('email', $request->input('email'))->first();

        Password::broker()->sendResetLink(
            $request->only('email')
        );

        $this->auditLogger->log($user, 'password_reset_requested', $request, metadata: [
            'email' => $request->input('email'),
        ]);

        return $this->success(null, __('If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes.'));
    }

    /**
     * Reset the user's password.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();
                $user->tokens()->delete();
                $user->authProviders()->firstOrCreate(
                    ['provider' => 'local'],
                    ['linked_at' => now()],
                )->update(['last_used_at' => now()]);

                $this->auditLogger->log($user, 'password_reset_completed', $request);

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return $this->success(null, __($status));
        }

        return $this->error(__($status), 400);
    }
}
