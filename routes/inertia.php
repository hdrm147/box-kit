<?php

use Illuminate\Support\Facades\Route;
use Laravel\Nova\Http\Requests\NovaRequest;

/*
|--------------------------------------------------------------------------
| BoxKit Tool Routes
|--------------------------------------------------------------------------
|
| These routes are loaded by the BoxKitServiceProvider for the
| Purchase Advisor tool page.
|
*/

Route::get('/', function (NovaRequest $request) {
    return inertia('BoxKit');
});
