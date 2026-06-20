<?php

use App\Http\Middleware\ForceJsonResponse;
use App\Http\Middleware\EnsureAccountIsActive;
use App\Http\Middleware\SetLocale;
use App\Providers\AuthServiceProvider;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use NunoMaduro\Collision\Adapters\Laravel\CollisionServiceProvider;
use Spatie\Permission\PermissionServiceProvider;

$providers = [
    AuthServiceProvider::class,
];

if (class_exists(CollisionServiceProvider::class)) {
    $providers[] = CollisionServiceProvider::class;
}

if (class_exists(PermissionServiceProvider::class)) {
    $providers[] = PermissionServiceProvider::class;
}

return Application::configure(basePath: dirname(__DIR__))
    ->withProviders($providers)
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            ForceJsonResponse::class,
            SetLocale::class,
        ]);

        $middleware->alias([
            'account.active' => EnsureAccountIsActive::class,
        ]);

        $middleware->appendToPriorityList(Authenticate::class, SetLocale::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->create();
