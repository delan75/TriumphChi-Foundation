<?php

use App\Http\Middleware\SetLocale;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

$providers = [];

if (class_exists(\NunoMaduro\Collision\Adapters\Laravel\CollisionServiceProvider::class)) {
    $providers[] = \NunoMaduro\Collision\Adapters\Laravel\CollisionServiceProvider::class;
}

if (class_exists(\Spatie\Permission\PermissionServiceProvider::class)) {
    $providers[] = \Spatie\Permission\PermissionServiceProvider::class;
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
            SetLocale::class,
        ]);

        $middleware->appendToPriorityList(Authenticate::class, SetLocale::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->create();
