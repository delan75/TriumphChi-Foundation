<?php

namespace App\Http\Controllers;

use App\Support\ApiResponseTrait;

abstract class Controller
{
    use \Illuminate\Foundation\Auth\Access\AuthorizesRequests;
    use ApiResponseTrait;
}

