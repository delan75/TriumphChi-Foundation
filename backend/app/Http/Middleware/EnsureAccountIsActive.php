<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isActive()) {
            return response()->json([
                'success' => false,
                'message' => __('api.auth.account_inactive'),
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
